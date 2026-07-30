const express = require('express');
const mongoose = require('mongoose');
const { getPublicIp } = require('@urbackend/common');
const router = express.Router();

// Middleware to protect internal routes
const internalAuth = (req, res, next) => {
    const secret = process.env.INTERNAL_SECRET;
    if (!secret) {
        console.error("INTERNAL_SECRET is not configured on Public API");
        return res.status(500).json({ success: false, message: "Server misconfiguration" });
    }
    
    const providedSecret = req.headers['x-internal-secret'];
    if (!providedSecret || providedSecret !== secret) {
        return res.status(403).json({ success: false, message: "Forbidden: Invalid internal secret" });
    }
    
    next();
};

router.post('/test-db', internalAuth, async (req, res) => {
    const { dbUri } = req.body;
    if (!dbUri) {
        return res.status(400).json({ success: false, message: "dbUri is required" });
    }

    console.log("[Internal] Verifying connection for external DB...");
    try {
        const tempConn = mongoose.createConnection(dbUri, {
            serverSelectionTimeoutMS: 5000,
        });
        await tempConn.asPromise();
        await tempConn.close();
        return res.status(200).json({ success: true, message: "Connection verified" });
    } catch (connErr) {
        console.error("[Internal] Verification Connection Failed:", connErr.message);
        let errorMsg = "Could not connect to the provided MongoDB URI.";
        let serverIp = null;

        if (
            connErr.message.includes("Server selection timed out") ||
            connErr.message.includes("Could not connect")
        ) {
            serverIp = await getPublicIp();
            errorMsg = `Access Denied: Please whitelist Server IP [${serverIp}] in MongoDB Atlas.`;
        }

        return res.status(400).json({ success: false, message: errorMsg, serverIp });
    }
});

module.exports = router;
