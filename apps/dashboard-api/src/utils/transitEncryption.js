const crypto = require('crypto');

/**
 * Encrypts a plaintext string for secure transit to the Python service.
 * Uses AES-256-GCM keyed by INTERNAL_PAYLOAD_KEY.
 * @param {string} plainText - The secret to encrypt
 * @returns {{ iv: string, encryptedData: string, authTag: string }}
 */
function encryptForTransit(plainText) {
    const key = process.env.INTERNAL_PAYLOAD_KEY;
    if (!key) throw new Error("INTERNAL_PAYLOAD_KEY is not defined in environment");

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();

    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted,
        authTag: tag.toString('hex')
    };
}

module.exports = { encryptForTransit };
