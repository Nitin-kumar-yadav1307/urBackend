const { registry, circuitBreakers } = require("./registry");
const { getPublicIp, isSafeUri, createSafeLookup } = require("./network");
const Project = require("../models/Project");
const { decrypt } = require("./encryption");
const mongoose = require("mongoose");
const redis = require("../config/redis");

const CB_MAX_FAILURES = 3;
const CB_TIMEOUT_MS = 30000; // 30 seconds

function recordFailure(key) {
    const state = circuitBreakers.get(key) || { failures: 0, openUntil: null, probeInFlight: false };
    state.failures += 1;
    state.probeInFlight = false;
    if (state.failures >= CB_MAX_FAILURES) {
        console.warn(`[CIRCUIT BREAKER] Tripped OPEN for project ${key} due to ${state.failures} failures.`);
        state.openUntil = Date.now() + CB_TIMEOUT_MS;
    }
    circuitBreakers.set(key, state);
}

function recordSuccess(key) {
    if (circuitBreakers.has(key)) {
        const state = circuitBreakers.get(key);
        state.probeInFlight = false;
        circuitBreakers.delete(key);
    }
}

async function getConnection(projectId) {
    const key = projectId.toString();

    // 0. Circuit Breaker Check (Fast Fail)
    const cbState = circuitBreakers.get(key);
    if (cbState) {
        if (cbState.openUntil && Date.now() < cbState.openUntil) {
            const error = new Error(`Service Unavailable: Database for project ${key} is currently unreachable. Circuit breaker is OPEN.`);
            error.status = 503;
            throw error;
        } else if (cbState.openUntil && Date.now() >= cbState.openUntil) {
            if (cbState.probeInFlight) {
                // Reject concurrent callers while the single half-open probe is in flight
                const error = new Error(`Service Unavailable: Database for project ${key} is currently unreachable. Circuit breaker is probing.`);
                error.status = 503;
                throw error;
            }
            // Half-open: Timeout expired, allow one retry probe
            cbState.openUntil = null;
            cbState.probeInFlight = true;
            circuitBreakers.set(key, cbState);
        }
    }

    // 1. Instant Cache Hit (Fastest Path for UX)
    if (registry.has(key)) {
        const cachedConn = registry.get(key);
        if (cachedConn.readyState === 1) {
            cachedConn.lastAccessed = new Date(); // Update access timestamp instantly
            return cachedConn;
        }
    }

    let dbUri;
    let plan = 'free'; // default

    // 2. Redis Cache Check (Saves Main DB load and Decryption CPU cycles)
    const redisKey = `project:uri:${key}`;
    const cachedDataStr = await redis.get(redisKey);

    if (cachedDataStr) {
        try {
            const cachedData = JSON.parse(cachedDataStr);
            dbUri = cachedData.dbUri;
            plan = cachedData.plan || 'free';
        } catch (e) {
            console.error("Failed to parse cached project data from Redis", e);
        }
    }

    // 3. Database Lookup & Decryption (Only runs if Redis is empty)
    if (!dbUri) {
        const projectDoc = await Project.findById(projectId)
            .select("+resources.db.config.encrypted +resources.db.config.iv +resources.db.config.tag resources.db.isExternal plan");

        if (!projectDoc) throw new Error("Project not found");

        if (!projectDoc.resources.db.isExternal) {
            return mongoose.connection;
        }

        try {
            const decryptedConfig = decrypt(projectDoc.resources.db.config);
            dbUri = JSON.parse(decryptedConfig).dbUri;
            plan = projectDoc.plan || 'free';
        } catch (err) {
            console.error("Decryption Error:", err);
            // Treat decryption errors as hard failures, don't trip breaker for user config errors, but we can't connect anyway
            throw new Error("Invalid or corrupted external config");
        }

        // Save to Redis for 1 Hour so subsequent server processes can grab it instantly
        await redis.set(redisKey, JSON.stringify({ dbUri, plan }), 'EX', 3600);
    }

    // 4. ENTERPRISE CONFIGURATION FIX
    // We dynamically allocate pooling size depending on usage tiers to balance RAM & Throughput
    const isPremiumUser = plan === 'premium';

    const safeCheck = await isSafeUri(dbUri);
    if (!safeCheck.isSafe) {
        throw new Error("DB URI targets a restricted internal host (SSRF Prevented).");
    }

    const connectionOptions = {
        maxPoolSize: isPremiumUser ? 50 : 15,    // Cap free/hobby projects at 15 to prevent crashing your server
        minPoolSize: 2,                          // Keeps 2 warm sockets alive for instant response time
        maxIdleTimeMS: 15000,                    // Native driver automatically kills idle sockets after 15 seconds
        connectTimeoutMS: 5000,                  // Fail fast (5s) if user provides a bad/dead connection string
        socketTimeoutMS: 45000,
        waitQueueTimeoutMS: 5000,                // Prevents requests from stalling forever if pool is exhausted
        lookup: createSafeLookup(safeCheck.resolvedIps)
    };

    // Initialize the pool with custom options
    const connection = mongoose.createConnection(dbUri, connectionOptions);

    // Track active query load on this connection to prevent overflow crashes
    connection.lastAccessed = new Date();

    connection.on("connected", () => {
        console.log(`✅ External DB pool opened for: ${projectId} (maxPoolSize: ${connectionOptions.maxPoolSize})`);
    });

    try {
        await connection.asPromise();
        recordSuccess(key); // Reset failures on successful connection
    } catch (err) {
        console.error("❌ Initial Connection Failed:", err.message);
        recordFailure(key); // Increment circuit breaker failures
        
        if (err.message.includes("Server selection timed out") || err.message.includes("Could not connect")) {
            const serverIp = await getPublicIp();
            throw new Error(`Access Denied: Please whitelist Server IP [${serverIp}] in MongoDB Atlas.`);
        }
        throw err;
    }

    connection.on("error", (err) => {
        console.error(`❌ DB Connection Error for project ${projectId}:`, err);
        if (registry.deleteIfCurrent(key, connection)) {
            recordFailure(key); // Only record failure if it was the active connection
        }
    });

    connection.on("disconnected", () => {
        console.log(`🔌 External DB disconnected: ${projectId}`);
        registry.deleteIfCurrent(key, connection);
    });

    connection.on("close", () => {
        console.log(`🔌 Connection closed: ${key}`);
        registry.deleteIfCurrent(key, connection);
    });

    // Save back to your central in-memory store (LRU handles the capacity limit internally)
    registry.set(key, connection);

    return connection;
}

module.exports = { getConnection };
