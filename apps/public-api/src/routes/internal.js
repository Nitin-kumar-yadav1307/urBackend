const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { getPublicIp, isSafeUri, createSafeLookup } = require('@urbackend/common');
const router = express.Router();

// Middleware to protect internal routes
const internalAuth = (req, res, next) => {
    const secret = process.env.INTERNAL_SECRET;
    if (!secret) {
        console.error("INTERNAL_SECRET is not configured on Public API");
        return res.status(500).json({ success: false, data: {}, message: "Server misconfiguration" });
    }
    
    const header = req.headers['x-internal-secret'];
    const providedSecret = Array.isArray(header) ? header[0] : (header || '');
    
    // Convert both to buffers of the same length to use timingSafeEqual
    const secretBuffer = Buffer.from(String(secret), 'utf8');
    const providedBuffer = Buffer.from(String(providedSecret), 'utf8');
    
    if (secretBuffer.length !== providedBuffer.length || !crypto.timingSafeEqual(secretBuffer, providedBuffer)) {
        return res.status(403).json({ success: false, data: {}, message: "Forbidden: Invalid internal secret" });
    }
    
    next();
};

router.post('/test-db', internalAuth, async (req, res) => {
    const { dbUri } = req.body;
    if (!dbUri) {
        return res.status(400).json({ success: false, data: {}, message: "dbUri is required" });
    }
    
    const safeCheck = await isSafeUri(dbUri);
    if (!safeCheck.isSafe) {
        return res.status(400).json({
            success: false,
            data: {},
            message: "DB URI is pointing to a restricted host, internal network, or unsupported URI format.",
        });
    }

    console.log("[Internal] Verifying connection for external DB...");
    let tempConn = null;
    try {
        tempConn = mongoose.createConnection(dbUri, {
            serverSelectionTimeoutMS: 5000,
            lookup: createSafeLookup(safeCheck.resolvedIps)
        });
        await tempConn.asPromise();
        return res.status(200).json({ success: true, data: {}, message: "Connection verified" });
    } catch (connErr) {
        console.error("[Internal] Verification Connection Failed:", connErr.message);
        let errorMsg = "Could not connect to the provided MongoDB URI.";
        let serverIp = null;

        if (
            connErr.message.includes("Server selection timed out") ||
            connErr.message.includes("Could not connect")
        ) {
            try {
                serverIp = await getPublicIp();
                errorMsg = `Access Denied: Please whitelist Server IP [${serverIp}] in MongoDB Atlas.`;
            } catch (ipErr) {
                console.error("Failed to fetch Public API IP:", ipErr.message);
            }
        }

        return res.status(400).json({ success: false, data: { serverIp }, message: errorMsg });
    } finally {
        if (tempConn) {
            await tempConn.close();
        }
    }
});

module.exports = router;
