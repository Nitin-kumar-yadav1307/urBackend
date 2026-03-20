const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("✅ MongoDB Connected (Common Package)");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
        // Retry logic
        setTimeout(connectDB, 5000);
    }
};

// Runtime Errors
mongoose.connection.on('error', (err) => {
    console.error("🔥 MongoDB Runtime Error:", err);
});

// Auto-Reconnect
mongoose.connection.on('disconnected', () => {
    console.warn("⚠️ MongoDB Disconnected. Retrying...");
    connectDB();
});

module.exports = { connectDB };
