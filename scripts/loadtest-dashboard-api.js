#!/usr/bin/env node
/**
 * urBackend Dashboard API Load Testing Script
 * Benchmark Admin/Dashboard API endpoints under heavy load.
 *
 * Usage:
 *   node scripts/loadtest-dashboard-api.js [--target=http://localhost:5000] [--connections=50] [--duration=10]
 */

const autocannon = require('autocannon');

const args = process.argv.slice(2).reduce((acc, arg) => {
    const [key, val] = arg.replace(/^--/, '').split('=');
    acc[key] = val || true;
    return acc;
}, {});

const target = (args.target || process.env.DASHBOARD_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const connections = parseInt(args.connections || '50', 10);
const duration = parseInt(args.duration || '10', 10);

const email = args.email || 'developer@example.com';
const password = args.password || 'password123';
const token = args.token || '';
const skipAuth = args.skipAuth === 'true' || args.skipAuth === true;
const bypassKey = args.bypassKey || process.env.LOADTEST_BYPASS_KEY;

console.log('====================================================');
console.log('🚀 urBackend Dashboard API Load Testing Suite');
console.log('====================================================');
console.log(`📍 Target URL  : ${target}`);
console.log(`⚡ Connections : ${connections} VUs (Virtual Users)`);
console.log(`⏱️ Duration   : ${duration} seconds`);
console.log(`🛡️ Rate Bypass : ${bypassKey ? 'Enabled' : 'Disabled (Standard Rate Limits Active)'}`);
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
                    ...(bypassKey ? { 'x-bypass-rate-limit': bypassKey } : {}),
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
    // Test 1: Dashboard Health Check Endpoint
    await runBenchmark('1. Dashboard Health Check (GET /api/health)', {
        url: `${target}/api/health`,
        method: 'GET',
    });

    // Test 2: Developer Auth Login
    if (!skipAuth) {
        await runBenchmark('2. Developer Auth Login (POST /api/auth/login)', {
            url: `${target}/api/auth/login`,
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: {
                email,
                password,
            },
        });
    }

    // Test 3: Admin Projects List
    if (token) {
        await runBenchmark('3. Admin Projects List (GET /api/projects)', {
            url: `${target}/api/projects`,
            method: 'GET',
            headers: {
                'authorization': `Bearer ${token}`,
                'accept': 'application/json',
            },
        });
    }

    console.log('🎉 Dashboard Load Testing Complete!');
}

startLoadTest().catch((err) => {
    console.error('Fatal load test error:', err);
    process.exit(1);
});
