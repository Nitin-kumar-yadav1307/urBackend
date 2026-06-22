const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(
    process.env.RESEND_API_KEY_2 ||
    process.env.RESEND_API_KEY
);

const BATCH_SIZE = 100;

async function sendEmail(email) {
    return resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: email,
        subject: 'Try urBackend',
        html: `
            <h2>Hi there 👋</h2>

            <p>I'm building urBackend, an open-source backend platform that helps developers build APIs and backend services faster.</p>

            <p>I'd love for you to try it out and share feedback.</p>

            <p>
                <a href="https://urbackend.bitbros.in">
                    Try urBackend
                </a>
            </p>

            <p>Thanks!</p>
        `
    });
}

async function main() {
    const emails = fs
        .readFileSync(
            path.join(__dirname, 'emails.txt'),
            'utf8'
        )
        .split(/\r?\n/)
        .map(e => e.trim())
        .filter(Boolean);

   const batchSize = parseInt(process.argv[2]) || 100;
    const batch = emails.slice(0, batchSize);
    console.log(`Sending ${batch.length} emails...`);

    for (const email of batch) {
        try {
            await sendEmail(email);
            console.log(`✓ ${email}`);

            await new Promise(resolve =>
                setTimeout(resolve, 1000)
            );

        } catch (err) {
            console.error(`✗ ${email}`, err.message);
        }
    }

    console.log('Finished');
}

main();