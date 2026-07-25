#!/usr/bin/env node
/**
 * urBackend Public API Load Testing Script
 * Benchmark Public API endpoints (Health, Auth, RLS Data endpoints) under heavy load.
 *
 * Usage:
 *   node scripts/loadtest-public-api.js [--target=http://localhost:5001] [--connections=50] [--duration=10] [--apiKey=YOUR_KEY]
 */

const autocannon = require('autocannon');

// Parse CLI arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
    const [key, val] = arg.replace(/^--/, '').split('=');
    acc[key] = val || true;
    return acc;
}, {});

const target = (args.target || process.env.PUBLIC_API_URL || 'http://localhost:5001').replace(/\/$/, '');
const connections = parseInt(args.connections || '50', 10);
const duration = parseInt(args.duration || '10', 10);
const apiKey = args.apiKey || args.pk || args.sk || process.env.TEST_API_KEY || process.env.PUBLIC_KEY || 'pk_live_demo_key';
const collection = args.collection || 'posts';
const email = args.email || 'loadtest@example.com';
const password = args.password || 'password123';
const skipAuth = args.skipAuth === 'true' || args.skipAuth === true;
const skipData = args.skipData === 'true' || args.skipData === true;

const keyType = apiKey.startsWith('sk_live_') ? 'Secret Key (sk_live_)' : apiKey.startsWith('pk_live_') ? 'Publishable Key (pk_live_)' : 'Custom Key';

console.log('====================================================');
console.log('🚀 urBackend Public API Load Testing Suite');
console.log('====================================================');
console.log(`📍 Target URL  : ${target}`);
console.log(`⚡ Connections : ${connections} VUs (Virtual Users)`);
console.log(`⏱️ Duration   : ${duration} seconds`);
console.log(`🔑 Key Type    : ${keyType}`);
console.log(`📁 Collection  : ${collection}`);
console.log('====================================================\n');

async function runBenchmark(name, opts) {
    console.log(`► Benchmarking: [${name}]`);
    return new Promise((resolve) => {
        const instance = autocannon(
            {
                url: opts.url,
                method: opts.method || 'GET',
                connections,
                duration,
                headers: {
                    'x-bypass-rate-limit': process.env.LOADTEST_BYPASS_KEY || 'urbackend_loadtest_secret',
                    ...(opts.headers || {}),
                },
                body: opts.body ? JSON.stringify(opts.body) : undefined,
            },
            (err, result) => {
                if (err) {
                    console.error(`❌ Error benchmarking ${name}:`, err);
                    resolve(null);
                    return;
                }
                console.log(autocannon.printResult(result));
                console.log('----------------------------------------------------\n');
                resolve(result);
            }
        );

        autocannon.track(instance, { renderProgressBar: true });
    });
}

async function startLoadTest() {
    // Test 1: Health Check Endpoint (Works without any project setup)
    await runBenchmark('1. Health Check Endpoint (GET /api/health)', {
        url: `${target}/api/health`,
        method: 'GET',
    });

    // Test 2: Data Collection Read
    if (!skipData) {
        await runBenchmark(`2. Data Collection Read (GET /api/data/${collection})`, {
            url: `${target}/api/data/${collection}?limit=10`,
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'accept': 'application/json',
            },
        });
    }

    // Test 3: User Auth Login
    if (!skipAuth) {
        await runBenchmark('3. User Auth Login (POST /api/userAuth/login)', {
            url: `${target}/api/userAuth/login`,
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'content-type': 'application/json',
            },
            body: {
                email,
                password,
            },
        });
    }

    // Test 4: Data Write / Document Insert
    if (!skipData) {
        await runBenchmark(`4. Document Insert (POST /api/data/${collection})`, {
            url: `${target}/api/data/${collection}`,
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'content-type': 'application/json',
            },
            body: {
                title: 'Load Test Post',
                content: 'Benchmarking database write performance',
            },
        });
    }

    console.log('🎉 Load Testing Complete!');
}

startLoadTest().catch((err) => {
    console.error('Fatal load test error:', err);
    process.exit(1);
});
