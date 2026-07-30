class LruConnectionMap {
    constructor(maxSize, onEvict) {
        this.map = new Map();
        this.maxSize = maxSize;
        this.onEvict = onEvict;
    }

    get(key) {
        if (!this.map.has(key)) return undefined;
        // Move to end to mark as recently used
        const val = this.map.get(key);
        this.map.delete(key);
        this.map.set(key, val);
        return val;
    }

    set(key, value) {
        if (this.map.has(key)) {
            this.map.delete(key);
        } else if (this.map.size >= this.maxSize) {
            // Evict oldest (least recently used)
            const oldestKey = this.map.keys().next().value;
            const oldestVal = this.map.get(oldestKey);
            this.map.delete(oldestKey);
            if (this.onEvict) {
                try {
                    this.onEvict(oldestKey, oldestVal);
                } catch (e) {
                    console.error(`Error during LRU eviction for ${oldestKey}:`, e);
                }
            }
        }
        this.map.set(key, value);
    }

    has(key) {
        return this.map.has(key);
    }

    delete(key) {
        return this.map.delete(key);
    }

    get size() {
        return this.map.size;
    }

    // Support Iterators for gc.js compatibility
    *[Symbol.iterator]() {
        yield* this.map[Symbol.iterator]();
    }
}

// Mongoose connection pool registry (limit 50 to protect Node.js RAM/sockets)
const registry = new LruConnectionMap(50, (key, conn) => {
    console.log(`[LRU Eviction] Closing idle Mongoose connection for project ${key}`);
    if (conn && typeof conn.close === 'function') {
        conn.close().catch(err => console.error(`[LRU Eviction Error] Failed to close connection ${key}:`, err));
    }
});

// Storage registry (S3/R2 clients, lower overhead so limit is higher)
const storageRegistry = new LruConnectionMap(200, (key, client) => {
    console.log(`[LRU Eviction] Removing idle storage client for project ${key}`);
    if (client && typeof client.destroy === 'function') {
        client.destroy();
    }
});

// Circuit Breaker State Registry (No eviction needed, small overhead, or we can use another Map)
const circuitBreakers = new Map();

module.exports = { registry, storageRegistry, circuitBreakers, LruConnectionMap };
