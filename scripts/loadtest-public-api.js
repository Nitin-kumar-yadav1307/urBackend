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
const apiKey = args.apiKey || process.env.TEST_API_KEY || 'demo-api-key';

console.log('====================================================');
console.log('🚀 urBackend Public API Load Testing Suite');
console.log('====================================================');
console.log(`📍 Target URL  : ${target}`);
console.log(`⚡ Connections : ${connections} VUs (Virtual Users)`);
console.log(`⏱️ Duration   : ${duration} seconds`);
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
                headers: opts.headers || {},
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
    // Test 1: Health Check Endpoint
    await runBenchmark('Health Check Endpoint (GET /api/health)', {
        url: `${target}/api/health`,
        method: 'GET',
    });

    // Test 2: API Key Auth & Data Read Endpoint
    await runBenchmark('Data Collection Read (GET /api/data/posts)', {
        url: `${target}/api/data/posts?limit=10`,
        method: 'GET',
        headers: {
            'x-api-key': apiKey,
            'accept': 'application/json',
        },
    });

    console.log('🎉 Load Testing Complete!');
}

startLoadTest().catch((err) => {
    console.error('Fatal load test error:', err);
    process.exit(1);
});
