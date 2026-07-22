#!/usr/bin/env bash
# =============================================================================
# urBackend TypeScript SDK Quickstart
# =============================================================================
# This script scaffolds a new urBackend project with the TypeScript SDK.
#
# Usage:
#   bash <(curl -fsSL https://raw.githubusercontent.com/geturbackend/urBackend/main/examples/quickstart-scripts/setup-ts-sdk.sh)
#
# Or locally:
#   bash examples/quickstart-scripts/setup-ts-sdk.sh
#
# Prerequisites:
#   - Node.js 18+
#   - npm or yarn
#   - A urBackend account (https://urbackend.bitbros.in)
# =============================================================================

set -euo pipefail

# ── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     urBackend TypeScript SDK Quickstart                 ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# ── Check prerequisites ─────────────────────────────────────────────────────
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ is required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# ── Get project name ────────────────────────────────────────────────────────
DEFAULT_NAME="my-urbackend-app"
read -r -p "Project name [${DEFAULT_NAME}]: " PROJECT_NAME
PROJECT_NAME="${PROJECT_NAME:-$DEFAULT_NAME}"

if [ -d "$PROJECT_NAME" ]; then
    echo -e "${RED}❌ Directory '$PROJECT_NAME' already exists.${NC}"
    exit 1
fi

# ── Get API keys ────────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Enter your urBackend API keys (from https://urbackend.bitbros.in)${NC}"
read -r -p "Publishable Key (pk_live_...): " PUBLISHABLE_KEY
read -r -p "Secret Key (sk_live_...): " SECRET_KEY
read -r -p "Project ID: " PROJECT_ID

if [ -z "$PUBLISHABLE_KEY" ] || [ -z "$SECRET_KEY" ] || [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ All API keys are required.${NC}"
    exit 1
fi

# ── Scaffold project ────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}📁 Creating project: ${PROJECT_NAME}...${NC}"

mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Initialize package.json
cat > package.json << EOF
{
  "name": "${PROJECT_NAME}",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest run"
  },
  "dependencies": {
    "@urbackend/sdk": "^0.4.2"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0",
    "@types/node": "^20.0.0"
  }
}
EOF

# Create TypeScript config
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Create .env file
cat > .env << EOF
URBACKEND_PUBLISHABLE_KEY=${PUBLISHABLE_KEY}
URBACKEND_SECRET_KEY=${SECRET_KEY}
URBACKEND_PROJECT_ID=${PROJECT_ID}
URBACKEND_API_URL=https://api.ub.bitbros.in
EOF

# Create source directory
mkdir -p src

# Create main entry point
cat > src/index.ts << 'SRCEOF'
import { UrBackendClient } from '@urbackend/sdk';
import { config } from 'dotenv';

config();

const PUBLISHABLE_KEY = process.env.URBACKEND_PUBLISHABLE_KEY!;
const SECRET_KEY = process.env.URBACKEND_SECRET_KEY!;
const PROJECT_ID = process.env.URBACKEND_PROJECT_ID!;
const API_URL = process.env.URBACKEND_API_URL || 'https://api.ub.bitbros.in';

// Initialize client with publishable key (safe for frontend)
const client = new UrBackendClient({
  apiKey: PUBLISHABLE_KEY,
  baseUrl: API_URL,
});

async function main() {
  console.log('🚀 urBackend TypeScript SDK Demo');
  console.log('='.repeat(50));

  // ── Authentication ────────────────────────────────────────────────
  console.log('\n🔐 Authentication');
  try {
    const { token } = await client.auth.login({
      email: 'demo@example.com',
      password: 'DemoPassword123!',
    });
    console.log('✅ Login successful!');
    client.setToken(token);
  } catch (err) {
    console.log('ℹ️  Login failed (expected if user does not exist)');
  }

  // ── Database CRUD ─────────────────────────────────────────────────
  console.log('\n🗄️  Database CRUD');
  try {
    // Create a document
    const post = await client.db.insert('posts', {
      title: 'Hello from TypeScript SDK!',
      content: 'This post was created using @urbackend/sdk.',
    });
    console.log(`✅ Created post: ${post._id}`);

    // Read all documents
    const posts = await client.db.getAll('posts');
    console.log(`✅ Found ${posts.length} post(s)`);

    // Update a document
    const updated = await client.db.patch('posts', post._id, {
      title: 'Updated: TypeScript SDK Demo Post',
    });
    console.log(`✅ Updated post: ${updated.title}`);

    // Delete a document
    const { deleted } = await client.db.delete('posts', post._id);
    console.log(`✅ Post deleted: ${deleted}`);
  } catch (err) {
    console.log('ℹ️  Database demo requires a "posts" collection');
  }

  // ── Storage ───────────────────────────────────────────────────────
  console.log('\n📦 Storage');
  try {
    const file = new File(['Hello from urBackend!'], 'hello.txt', { type: 'text/plain' });
    const result = await client.storage.upload(file);
    console.log(`✅ File uploaded: ${result.path}`);
  } catch (err) {
    console.log('ℹ️  Storage demo requires storage to be configured');
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Demo complete!');
}

main().catch(console.error);
SRCEOF

# Create a test file
mkdir -p src/__tests__
cat > src/__tests__/client.test.ts << 'TESTEOF'
import { describe, it, expect } from 'vitest';

describe('urBackend SDK Client', () => {
  it('should initialize with API key', () => {
    const { UrBackendClient } = require('@urbackend/sdk');
    const client = new UrBackendClient({
      apiKey: 'pk_live_test_key',
      baseUrl: 'https://api.ub.bitbros.in',
    });
    expect(client).toBeDefined();
  });
});
TESTEOF

# Install dependencies
echo ""
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

echo ""
echo -e "${GREEN}✅ Project created successfully!${NC}"
echo ""
echo -e "  ${BLUE}Next steps:${NC}"
echo -e "  1. cd ${PROJECT_NAME}"
echo -e "  2. Edit src/index.ts with your logic"
echo -e "  3. Run ${YELLOW}npm run dev${NC} to start development"
echo -e "  4. Run ${YELLOW}npm run build${NC} to build for production"
echo ""
echo -e "  ${BLUE}Deploy to Vercel:${NC}"
echo -e "  https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgeturbackend%2FurBackend%2Ftree%2Fmain%2Fexamples%2Fquickstart-ts"
echo ""