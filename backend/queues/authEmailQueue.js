const { Queue, Worker } = require('bullmq');
const connection = require('../config/redis');
const { sendAuthOtpEmail } = require('../utils/emailService');

// Create the email queue specifically for fast OTPs
const authEmailQueue = new Queue('auth-email-queue', { connection });

// Initialize Worker with Rate Limiting
const worker = new Worker('auth-email-queue', async (job) => {
    const { email, otp, type, pname } = job.data;
    try {
        console.log(`[Queue] Processing ${type} email for: ${email}`);
        await sendAuthOtpEmail(email, { otp, type, pname});
    } catch (error) {
        console.error(`[Queue] Failed to send auth email to ${email}:`, error);
        throw error;
    }
}, {
    connection,
    limiter: {
        max: 2,
        duration: 1000, 
    }
});

worker.on('completed', (job) => {
    console.log(`[Queue] Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
    console.error(`[Queue] Job ${job.id} failed:`, err);
});

module.exports = { authEmailQueue };
