import React from 'react';
import { motion as Motion } from 'framer-motion';

const COMPATIBLE_TECHNOLOGIES = [
    // React
    {
        id: 'react',
        label: 'React',
        ring: 'inner',
        cls: 'int-react',
        type: 'Official SDK',
        badge: '@urbackend/react',
        desc: 'Connect your React applications seamlessly with our official React SDK. Equip your components with hooks, authentication providers, and state utilities.',
        color: '#61DAFB',
        svg: (
            <svg viewBox="-11.5 -10.23174 23 20.46348" width="18" height="18">
                <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
                <g stroke="#61DAFB" strokeWidth="1" fill="none">
                    <ellipse rx="11" ry="4.2" />
                    <ellipse rx="11" ry="4.2" transform="rotate(60)" />
                    <ellipse rx="11" ry="4.2" transform="rotate(120)" />
                </g>
            </svg>
        ),
        code: `import { UrProvider, useUrCollection } from '@urbackend/react';\n\n// 1. Wrap your app\nfunction App() {\n  return (\n    <UrProvider endpoint="https://api.ub.bitbros.in" projectId="proj_123">\n      <TodoList />\n    </UrProvider>\n  );\n}\n\n// 2. Use reactive database hooks!\nfunction TodoList() {\n  const { documents, loading } = useUrCollection('todos');\n  return (\n    <ul>\n      {documents.map(todo => <li key={todo.id}>{todo.title}</li>)}\n    </ul>\n  );\n}`
    },
    // Next.js
    {
        id: 'nextjs',
        label: 'Next.js',
        ring: 'inner',
        cls: 'int-next',
        type: 'React Framework',
        badge: 'SDK + Server Actions',
        desc: 'Build server-rendered React applications. Works beautifully with Next.js Server Components, Middleware auth checks, and Server Actions.',
        color: '#ffffff',
        svg: (
            <svg viewBox="0 0 180 180" width="18" height="18" fill="none">
                <mask id="next-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
                    <circle cx="90" cy="90" r="90" fill="#fff" />
                </mask>
                <g mask="url(#next-mask)">
                    <circle cx="90" cy="90" r="90" fill="#000" stroke="#fff" strokeWidth="6"/>
                    <path d="M149.508 157.52L69.142 54H54v72h14.4V69.412l67.24 87.054a89.4 89.4 0 0013.868-1.046zM111.6 54h14.4v72h-14.4z" fill="url(#next-gradient)" />
                </g>
                <defs>
                    <linearGradient id="next-gradient" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#fff" />
                        <stop offset="1" stopColor="#fff" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
        ),
        code: `// Get server-side data in Server Components\nimport { createServerClient } from '@urbackend/sdk/server';\n\nexport default async function DashboardPage() {\n  const ur = createServerClient({\n    endpoint: 'https://api.ub.bitbros.in',\n    apiKey: process.env.UR_PRIVATE_KEY\n  });\n\n  const { data: posts } = await ur.db('posts').find();\n\n  return (\n    <div>\n      {posts.map(post => <h2 key={post._id}>{post.title}</h2>)}\n    </div>\n  );\n}`
    },
    // Flutter
    {
        id: 'flutter',
        label: 'Flutter',
        ring: 'inner',
        cls: 'int-flutter',
        type: 'Mobile Framework',
        badge: 'urbackend_sdk (Dart)',
        desc: 'Build gorgeous, high-performance mobile apps. Sync local collections, authenticate users, and manage media uploads natively in Dart.',
        color: '#02569B',
        svg: (
            <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M14.314 0L2.3 12l6 6 6-6-6-6 2.985-2.985L14.314 0zm0 6l-6 6 6 6 5.7-5.7-2.985-3L20.014 6H14.314z" fill="#54C5F8"/>
                <path d="M14.314 12L8.3 18l6 6h5.7l-6-6 6-6h-5.7z" fill="#01579B"/>
            </svg>
        ),
        code: `import 'package:urbackend_sdk/urbackend_sdk.dart';\n\nvoid main() async {\n  // Initialize urBackend client\n  final client = UrClient(\n    endpoint: 'https://api.ub.bitbros.in',\n    projectId: 'proj_123',\n  );\n\n  // Authenticate user\n  final session = await client.auth.signIn(\n    email: 'user@example.com', \n    password: 'secure_password'\n  );\n\n  print('Access Token: \${session.accessToken}');\n}`
    },
    // Vue
    {
        id: 'vue',
        label: 'Vue.js',
        ring: 'inner',
        cls: 'int-vue',
        type: 'Frontend Framework',
        badge: '@urbackend/sdk (ESM)',
        desc: 'Create highly responsive web experiences. Integrates natively with Vue 3 composition APIs, reactive ref/computed state, and Pinia stores.',
        color: '#42B883',
        svg: (
            <svg viewBox="0 0 256 221" width="18" height="18" preserveAspectRatio="xMidYMid">
                <path d="M204.8 0H256L128 220.8 0 0h51.2L128 132.48 204.8 0z" fill="#41B883"/>
                <path d="M0 0l128 220.8L256 0h-51.2L128 132.48 51.2 0H0z" fill="#35495E"/>
            </svg>
        ),
        code: `<script setup>\nimport { ref, onMounted } from 'vue';\nimport { createClient } from '@urbackend/sdk';\n\nconst ur = createClient({ endpoint: 'https://api.ub.bitbros.in' });\nconst items = ref([]);\n\nonMounted(async () => {\n  const res = await ur.collection('store_items').find();\n  items.value = res.data;\n});\n</script>\n\n<template>\n  <div v-for="item in items" :key="item._id">{{ item.name }}</div>\n</template>`
    },
    // Webflow
    {
        id: 'webflow',
        label: 'Webflow',
        ring: 'inner',
        cls: 'int-webflow',
        type: 'Low-Code Web',
        badge: 'Custom Script CDN',
        desc: 'Add custom dynamic databases, member logic, and contact forms to Webflow designs without writing a single line of backend server code.',
        color: '#4353FF',
        svg: (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#4353FF">
                <path d="M20.8 6.2c-1.2-.3-2.4-.4-3.6-.2-2.2.3-4 1.5-5.2 3.3-1.2-1.8-3-3-5.2-3.3C5.6 5.7 4.4 5.8 3.2 6.2c-1.5 2-2.5 4.3-2.5 6.8 0 1.8 1.2 3 2.5 3.5 1.3.5 2.7.3 3.8-.3 1.8-1 3-2.7 3.7-4.7.7 2 1.9 3.7 3.7 4.7 1.1.6 2.5.8 3.8.3 1.3-.5 2.5-1.7 2.5-3.5 0-2.3-1.5-3.7-3.2-4.3z"/>
            </svg>
        ),
        code: `<!-- Add this in Webflow page header -->\n<script src="https://cdn.ub.bitbros.in/sdk/v1.js"></script>\n\n<script>\n  window.addEventListener('DOMContentLoaded', async () => {\n    // Initialize Webflow Client\n    const client = urBackend.createClient({ projectId: 'proj_webflow' });\n    \n    // Submit Webflow Form to MongoDB Collection\n    document.querySelector('#submit-btn').addEventListener('click', async () => {\n      await client.collection('leads').insert({\n        email: document.querySelector('#email-input').value\n      });\n      alert('Lead captured in MongoDB!');\n    });\n  });\n</script>`
    },
    // React Native
    {
        id: 'react-native',
        label: 'React Native',
        ring: 'mid',
        cls: 'int-react-native',
        type: 'Mobile Framework',
        badge: '@urbackend/react-native',
        desc: 'Write beautiful native iOS and Android apps using React and Javascript. Supports secure AsyncStorage token persistence out-of-the-box.',
        color: '#61DAFB',
        svg: (
            <svg viewBox="-11.5 -10.23174 23 20.46348" width="18" height="18">
                <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
                <g stroke="#61DAFB" strokeWidth="1.2" fill="none">
                    <ellipse rx="11" ry="4.2" />
                    <ellipse rx="11" ry="4.2" transform="rotate(60)" />
                    <ellipse rx="11" ry="4.2" transform="rotate(120)" />
                </g>
            </svg>
        ),
        code: `import { UrProvider } from '@urbackend/react';\nimport AsyncStorage from '@react-native-async-storage/async-storage';\n\n// Initialize with Native Storage for sessions\nfunction App() {\n  return (\n    <UrProvider \n      endpoint="https://api.ub.bitbros.in" \n      projectId="proj_native"\n      storage={AsyncStorage}\n    >\n      <MyMobileApp />\n    </UrProvider>\n  );\n}`
    },
    // Dart
    {
        id: 'dart',
        label: 'Dart',
        ring: 'mid',
        cls: 'int-dart',
        type: 'Programming Language',
        badge: 'REST API Wrapper',
        desc: 'Build CLI utilities, server-side tools, or Flutter extensions using raw Dart. Fast JSON processing and asynchronous networking.',
        color: '#00D2B8',
        svg: (
            <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M4 20l2.5-6.5L13 20H4z" fill="#00D2B8"/>
                <path d="M20 4l-2.5 6.5L11 4h9z" fill="#00B4AB"/>
                <path d="M4 4l13 16h-3L2 4h2z" fill="#0059A3"/>
            </svg>
        ),
        code: `import 'package:http/http.dart' as http;\nimport 'dart:convert';\n\nvoid main() async {\n  final url = Uri.parse('https://api.ub.bitbros.in/v1/db/analytics');\n  final response = await http.post(\n    url,\n    headers: { 'x-api-key': 'ur_sec_dart' },\n    body: jsonEncode({ 'metric': 'system_boot', 'value': 1 }),\n  );\n  print(jsonDecode(response.body));\n}`
    },
    // Nuxt
    {
        id: 'nuxt',
        label: 'Nuxt',
        ring: 'mid',
        cls: 'int-nuxt',
        type: 'Vue Framework',
        badge: 'Nuxt Module',
        desc: 'Build fullstack server-rendered Vue 3 applications. Fully integrated with Nuxt server routes and asyncData fetching.',
        color: '#00DC82',
        svg: (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M13.464 19h8.273a.5.5 0 0 0 .427-.76l-6.358-10.6a.5.5 0 0 0-.854 0l-2.717 4.528L9.5 9.22l1.894-3.157a.5.5 0 0 0-.428-.76H2.263a.5.5 0 0 0-.427.76l6.358 10.6a.5.5 0 0 0 .854 0l-2.717-4.528 1.235 2.058-2.717 4.528a.5.5 0 0 0 .428.76h2.753z" fill="#00DC82"/>
            </svg>
        ),
        code: `// server/api/users.ts\nimport { createClient } from '@urbackend/sdk';\n\nexport default defineEventHandler(async (event) => {\n  const ur = createClient({\n    endpoint: 'https://api.ub.bitbros.in',\n    apiKey: process.env.UR_API_KEY\n  });\n  \n  const users = await ur.collection('users').find();\n  return { success: true, users };\n});`
    },
    // Python
    {
        id: 'python',
        label: 'Python',
        ring: 'mid',
        cls: 'int-python',
        type: 'Official SDK',
        badge: 'urbackend-python',
        desc: 'For script automation, machine learning pipelines, and backend processing. A simple, robust requests-based client wrapper.',
        color: '#FFD43B',
        svg: (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M12.043 1.017c-2.157 0-2.078.918-2.078.918l.003 2.126h2.32v.639H7.768S5.449 4.487 5.449 6.72c0 2.233 0 2.767 0 2.767h1.568V8.282c0-.725.68-1.324 1.582-1.324h3.722c1.383 0 2.234-.84 2.234-2.234V3.11c0-1.156-.99-2.093-2.234-2.093h-2.32V1.017zm-1.09.934a.6.6 0 1 1 .002 1.2.6.6 0 0 1-.002-1.2z" fill="#387EB8"/>
                <path d="M12.043 22.983c2.157 0 2.078-.918 2.078-.918l-.003-2.126h-2.32v-.639h4.518s2.32.217 2.32-2.017c0-2.233 0-2.767 0-2.767h-1.568v1.201c0 .725-.68 1.324-1.582 1.324h-3.722c-1.383 0-2.234.84-2.234 2.234v1.867c0 1.156.99 2.093 2.234 2.093h2.32v-.252h-.041z" fill="#FFD43B"/>
            </svg>
        ),
        code: `from urbackend import UrClient\n\n# Initialize Python Client\nclient = UrClient(\n    endpoint="https://api.ub.bitbros.in",\n    api_key="ur_sec_python_999"\n)\n\n# Insert documents in MongoDB\nnew_item = client.db("inventory").insert({\n    "sku": "ITEM_XYZ",\n    "quantity": 150,\n    "location": "Warehouse A"\n})\n\nprint(f"Created doc with ID: {new_item['_id']}")`
    },
    // TypeScript
    {
        id: 'typescript',
        label: 'TypeScript',
        ring: 'mid',
        cls: 'int-typescript',
        type: 'Official SDK',
        badge: '@urbackend/sdk (Typed)',
        desc: 'Lightweight core package compiled for JS/TS. Enjoy autocomplete, model schema inference, and full compiler support.',
        color: '#3178C6',
        svg: (
            <svg viewBox="0 0 24 24" width="18" height="18">
                <rect width="24" height="24" rx="2" fill="#3178C6"/>
                <path d="M5.5 12v-1.5h4.5V21h-2V12H5.5zm5.5-1.5h4.5v1.5h-3v2h3v1.5h-3v2h3V21h-4.5v-1.5h3v-2h-3v-1.5h3v-2h-3V10.5z" fill="#fff"/>
            </svg>
        ),
        code: `import { UrClient, Document } from '@urbackend/sdk';\n\ninterface Order extends Document {\n  item: string;\n  total: number;\n}\n\nconst client = new UrClient({ endpoint: 'https://api.ub.bitbros.in' });\n\n// Auto-inferred typing on query responses\nconst { data } = await client.db<Order>('orders').findById('ord_999');\nconsole.log(data.item.toUpperCase());`
    },
    // Swift
    {
        id: 'swift',
        label: 'Swift',
        ring: 'mid',
        cls: 'int-swift',
        type: 'Native iOS',
        badge: 'REST API Endpoint',
        desc: 'Integrate native Apple ecosystems. Fast and optimized REST routing designed for modern iOS, macOS, watchOS, or visionOS Apps.',
        color: '#F05138',
        svg: (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M4 16.5C4 16.5 9 11 10.5 8.5C12 6 13 3.5 13 3.5C13 3.5 14.5 6.5 16.5 8.5C18.5 10.5 21 12 21 12C21 12 18.5 14 16.5 16C14.5 18 13 20 13 20C13 20 11.5 18 9.5 16.5C7.5 15 4 16.5 4 16.5Z" stroke="#F05138" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="6" cy="18" r="1.5" fill="#F05138"/>
            </svg>
        ),
        code: `import Foundation\n\nstruct User: Codable {\n    let email: String\n}\n\nfunc fetchUser(userId: String) {\n    let url = URL(string: "https://api.ub.bitbros.in/v1/db/users/\\(userId)")!\n    var request = URLRequest(url: url)\n    request.setValue("ur_sec_swift_key", forHTTPHeaderField: "x-api-key")\n    \n    URLSession.shared.dataTask(with: request) { data, _, _ in\n        if let data = data {\n            let user = try? JSONDecoder().decode(User.self, from: data)\n            print("User: \\(user?.email ?? "")")\n        }\n    }.resume()\n}`
    },
    // Kotlin
    {
        id: 'kotlin',
        label: 'Kotlin',
        ring: 'outer',
        cls: 'int-kotlin',
        type: 'Native Android',
        badge: 'REST API Client',
        desc: 'Build powerful Android applications. Fetch collections, authorize users, and write logs natively inside Kotlin-based repositories.',
        color: '#7F52FF',
        svg: (
            <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M2 2h10.3L2 12.3V2zm0 20l10.3-10.3L12.3 22H2zm11.3-10.3L22 2v10.3l-8.7 8.7-2-2z" fill="#7F52FF"/>
            </svg>
        ),
        code: `import okhttp3.OkHttpClient\nimport okhttp3.Request\n\nval client = OkHttpClient()\n\nfun loadData() {\n    val request = Request.Builder()\n        .url("https://api.ub.bitbros.in/v1/db/products")\n        .addHeader("x-api-key", "ur_sec_kotlin")\n        .build()\n\n    client.newCall(request).execute().use { response ->\n        println(response.body?.string())\n    }\n}`
    },
    // Go
    {
        id: 'go',
        label: 'Go',
        ring: 'outer',
        cls: 'int-go',
        type: 'Backend Language',
        badge: 'Net/HTTP API Calls',
        desc: 'Connect performant microservices. urBackend gives Go services immediate read/write access to MongoDB instances over SSL endpoints.',
        color: '#00ADD8',
        svg: (
            <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M3.8 8.15a.36.36 0 0 0-.36.41.36.36 0 0 0 .36.33h4.69a.36.36 0 0 0 .36-.33.36.36 0 0 0-.36-.41H3.8zm-2.56 1.8a.36.36 0 0 0-.36.45.36.36 0 0 0 .36.33h4.69a.36.36 0 0 0 .36-.33.36.36 0 0 0-.36-.45H1.24zm13.8 0a.36.36 0 0 0-.36.45.36.36 0 0 0 .36.33h4.69a.36.36 0 0 0 .36-.33.36.36 0 0 0-.36-.45h-4.69zm-2.56-1.8a.36.36 0 0 0-.36.41.36.36 0 0 0 .36.33h4.69a.36.36 0 0 0 .36-.33.36.36 0 0 0-.36-.41h-4.69z" fill="#00ADD8"/>
                <path d="M22.83 11.1c-.43-1.27-1.53-2.03-2.96-2.03-1.28 0-2.27.49-3.22 1.33.4.35.77.79 1.08 1.3.48-.5 1.06-.96 1.9-.96.84 0 1.4.47 1.57 1.17.03.1.04.2.04.32v.27c-.54-.02-1.18-.05-1.83-.05-2.16 0-3.35.5-4.16 1.5-.78.96-.9 2.14-.9 3.08 0 1.34.5 2.55 1.8 2.55.84 0 1.43-.37 1.91-.86.35.55.72 1.01 1.3 1.31.62.32 1.28.38 2.13.38 1.99 0 3.2-.95 3.85-2.6.54-1.34.38-2.5.03-3.28h-2.73v.02zm-1.16 3.73c-.48.75-1.12 1.06-1.83 1.06-.36 0-.72-.1-1-.32-.3-.23-.5-.56-.5-1.1 0-.8.36-1.42 1.06-1.8.56-.3 1.3-.42 2.23-.42.17 0 .35 0 .54.01-.03.72-.23 1.63-.5 2.57zM8.3 9.02H4.76c-.88 0-1.6.72-1.6 1.6v2.85c0 .88.72 1.6 1.6 1.6H8.3c1.52 0 3.04-1.36 3.04-3.03 0-1.66-1.52-3.02-3.04-3.02zm0 3.95H5.43v-.7H8.3s.36.1.36.43c0 .34-.36.26-.36.26v.01z" fill="#00ADD8"/>
            </svg>
        ),
        code: `package main\n\nimport (\n    "bytes"\n    "fmt"\n    "net/http"\n)\n\nfunc main() {\n    jsonData := []byte(\`{"device_id": "sensor_01", "temp": 24.5}\`)\n    req, _ := http.NewRequest("POST", "https://api.ub.bitbros.in/v1/db/telemetry", bytes.NewBuffer(jsonData))\n    req.Header.Set("x-api-key", "ur_sec_golang")\n    req.Header.Set("Content-Type", "application/json")\n\n    client := &http.Client{}\n    resp, _ := client.Do(req)\n    fmt.Println("Status Code:", resp.StatusCode)\n}`
    },
    // Rust
    {
        id: 'rust',
        label: 'Rust',
        ring: 'outer',
        cls: 'int-rust',
        type: 'Systems Language',
        badge: 'Async REST Crates',
        desc: 'Integrate memory-safe microservices with urBackend. Fully asynchronous request bodies with low connection latency.',
        color: '#FF6F30',
        svg: (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#ff6f30" strokeWidth="2" strokeDasharray="4 3"/>
                <path d="M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" fill="#ff6f30"/>
                <circle cx="12" cy="12" r="1.5" fill="#fff"/>
            </svg>
        ),
        code: `use serde_json::json;\n\n#[tokio::main]\nasync fn main() -> Result<(), reqwest::Error> {\n    let client = reqwest::Client::new();\n    let body = json!({ "user_id": "usr_99", "status": "active" });\n\n    let res = client.post("https://api.ub.bitbros.in/v1/db/sessions")\n        .header("x-api-key", "ur_sec_rust")\n        .json(&body)\n        .send()\n        .await?;\n\n    println!("Response status: {}", res.status());\n    Ok(())\n}`
    },
    // FastAPI
    {
        id: 'fastapi',
        label: 'FastAPI',
        ring: 'outer',
        cls: 'int-fastapi',
        type: 'Python Framework',
        badge: 'HTTP Client Callouts',
        desc: 'Combine local python microservices with urBackend datastores. Offload authentication and file storage flows with ease.',
        color: '#009485',
        svg: (
            <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-1-4H8l3-7v5h2l1 4h2l-3 7v-5z" fill="#009485"/>
            </svg>
        ),
        code: `from fastapi import FastAPI, Depends\nimport httpx\n\napp = FastAPI()\n\n@app.get("/sync-data")\nasync def sync_data():\n    async with httpx.AsyncClient() as client:\n        res = await client.post(\n            "https://api.ub.bitbros.in/v1/db/syncs",\n            headers={"x-api-key": "ur_sec_fastapi"},\n            json={"status": "completed"}\n        )\n    return res.json()`
    },
    // Node.js
    {
        id: 'node',
        label: 'Node.js',
        ring: 'outer',
        cls: 'int-node',
        type: 'Core SDK',
        badge: '@urbackend/sdk (ESM/CJS)',
        desc: 'Perform server-side orchestration. Manage document indexing, trigger email deliveries, and query buckets directly from Node.js scripts.',
        color: '#339933',
        svg: (
            <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M12.008 2.532a1.826 1.826 0 0 0-.875.232L4.035 6.283a1.832 1.832 0 0 0-.875 1.557v7.919c0 .648.356 1.249.928 1.568l7.098 4.003c.254.143.57.225.886.225h.004c.316 0 .632-.082.886-.225l7.098-4.003c.572-.319.928-.92.928-1.568V8.592c0-.408-.106-.808-.306-1.158l-5.596 3.218-1.688.972-2.776 1.597-.004 3.197-2.36-1.362v-2.68l2.364-1.36V8.218l-2.364 1.36V6.915l.005-.004 2.78-1.6 5.59-3.215a1.818 1.818 0 0 0-.442-.564l-.006-.004-.04-.04c-.28-.228-.64-.36-1.016-.36h-.004z" fill="#339933"/>
            </svg>
        ),
        code: `const { UrClient } = require('@urbackend/sdk');\n\n// Initialize with admin privileges\nconst ur = new UrClient({\n  endpoint: 'https://api.ub.bitbros.in',\n  apiKey: process.env.UR_ADMIN_KEY\n});\n\nasync function sendNewsletter() {\n  const result = await ur.mail.send({\n    template: 'newsletter',\n    to: 'subscribers@domain.com',\n    data: { week: '24' }\n  });\n  console.log('Emails dispatched:', result.success);\n}`
    }
];

const ORBIT_INNER_TECH = COMPATIBLE_TECHNOLOGIES.filter((t) => t.ring === 'inner');
const ORBIT_MID_TECH = COMPATIBLE_TECHNOLOGIES.filter((t) => t.ring === 'mid');
const ORBIT_OUTER_TECH = COMPATIBLE_TECHNOLOGIES.filter((t) => t.ring === 'outer');

export default function OrbitSection() {
    return (
        <div className="integration-section">
            <div className="integration-inner">
                <Motion.div className="integration-heading-wrapper"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="section-badge">Ecosystem</span>
                    <h2 className="section-title">Compatible with your favorite stack</h2>
                    <p className="section-desc">Connect from any framework or platform. Enjoy official client SDKs, clean typed models, or direct REST connections.</p>
                </Motion.div>

                <div className="orbit-stage-wrapper">
                    <div className="orbit-stage">
                        <div className="orbit-container">
                            <div className="orbit-sun">
                                <div className="orbit-sun-glow"></div>
                                <img
                                    className="orbit-sun-logo"
                                    src="/LOGO_SQ.png"
                                    alt="urBackend"
                                    width={64}
                                    height={64}
                                    loading="lazy"
                                    decoding="async"
                                />
                                <div className="orbit-sun-ring-dec orbit-sun-ring-1"></div>
                                <div className="orbit-sun-ring-dec orbit-sun-ring-2"></div>
                            </div>

                            <div className="orbit-dust orbit-dust-1" style={{ animationDelay: '-4s', '--orbit-radius': '165px', '--dust-color': '#00f5d4' }}></div>
                            <div className="orbit-dust orbit-dust-2" style={{ animationDelay: '-11s', '--orbit-radius': '260px', '--dust-color': '#a855f7' }}></div>
                            <div className="orbit-dust orbit-dust-3" style={{ animationDelay: '-19s', '--orbit-radius': '340px', '--dust-color': '#3b82f6' }}></div>
                            <div className="orbit-dust orbit-dust-4" style={{ animationDelay: '-28s', '--orbit-radius': '395px', '--dust-color': '#00f5d4' }}></div>
                            <div className="orbit-dust orbit-dust-5" style={{ animationDelay: '-7s', '--orbit-radius': '200px', '--dust-color': '#ec4899' }}></div>
                            <div className="orbit-dust orbit-dust-6" style={{ animationDelay: '-15s', '--orbit-radius': '365px', '--dust-color': '#eab308' }}></div>
                            <div className="orbit-dust orbit-dust-7" style={{ animationDelay: '-23s', '--orbit-radius': '430px', '--dust-color': '#a855f7' }}></div>

                            <div className="orbit-ring orbit-ring-inner"></div>
                            {ORBIT_INNER_TECH.map((item, i, arr) => (
                                <div
                                    key={item.id}
                                    className={`orbit-item-wrapper orbit-inner-wrapper ${item.cls}`}
                                    style={{
                                        animationDelay: `${-(20 / arr.length) * i}s`,
                                        '--hover-color': item.color
                                    }}
                                >
                                    <div className="orbit-connect-line"></div>
                                    <div className="orbit-logo-card">
                                        {item.svg}
                                        <span className="orbit-logo-text">{item.label}</span>
                                    </div>
                                </div>
                            ))}

                            <div className="orbit-ring orbit-ring-mid"></div>
                            {ORBIT_MID_TECH.map((item, i, arr) => (
                                <div
                                    key={item.id}
                                    className={`orbit-item-wrapper orbit-mid-wrapper ${item.cls}`}
                                    style={{
                                        animationDelay: `${-(32 / arr.length) * i}s`,
                                        '--hover-color': item.color
                                    }}
                                >
                                    <div className="orbit-connect-line"></div>
                                    <div className="orbit-logo-card">
                                        {item.svg}
                                        <span className="orbit-logo-text">{item.label}</span>
                                    </div>
                                </div>
                            ))}

                            <div className="orbit-ring orbit-ring-outer"></div>
                            {ORBIT_OUTER_TECH.map((item, i, arr) => (
                                <div
                                    key={item.id}
                                    className={`orbit-item-wrapper orbit-outer-wrapper ${item.cls}`}
                                    style={{
                                        animationDelay: `${-(48 / arr.length) * i}s`,
                                        '--hover-color': item.color
                                    }}
                                >
                                    <div className="orbit-connect-line"></div>
                                    <div className="orbit-logo-card">
                                        {item.svg}
                                        <span className="orbit-logo-text">{item.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
