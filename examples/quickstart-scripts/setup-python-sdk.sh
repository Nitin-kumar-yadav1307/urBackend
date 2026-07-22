#!/usr/bin/env bash
# =============================================================================
# urBackend Python SDK Quickstart
# =============================================================================
# This script scaffolds a new urBackend project with the Python SDK.
#
# Usage:
#   bash <(curl -fsSL https://raw.githubusercontent.com/geturbackend/urBackend/main/examples/quickstart-scripts/setup-python-sdk.sh)
#
# Or locally:
#   bash examples/quickstart-scripts/setup-python-sdk.sh
#
# Prerequisites:
#   - Python 3.9+
#   - pip
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
echo -e "${BLUE}║     urBackend Python SDK Quickstart                     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# ── Check prerequisites ─────────────────────────────────────────────────────
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3.9+ first.${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1)
if [ "$PYTHON_VERSION" -lt 3 ]; then
    echo -e "${RED}❌ Python 3.9+ is required. Current version: $(python3 --version)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ $(python3 --version) detected${NC}"

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
echo -e "${YELLOW}Enter your urBackend Publishable Key (from https://urbackend.bitbros.in)${NC}"
read -r -p "Publishable Key (pk_live_...): " PUBLISHABLE_KEY

if [ -z "$PUBLISHABLE_KEY" ]; then
    echo -e "${RED}❌ Publishable Key is required.${NC}"
    exit 1
fi

# ── Scaffold project ────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}📁 Creating project: ${PROJECT_NAME}...${NC}"

mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Create virtual environment
echo -e "${BLUE}🔧 Creating virtual environment...${NC}"
python3 -m venv venv

# Activate based on OS
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Create project structure
mkdir -p src tests

# Create requirements.txt
cat > requirements.txt << 'EOF'
urbackend>=0.1.0
python-dotenv>=1.0.0
pytest>=7.0.0
EOF

# Create .env
cat > .env << EOF
URBACKEND_PUBLISHABLE_KEY=${PUBLISHABLE_KEY}
URBACKEND_API_URL=https://api.ub.bitbros.in
EOF

# Create main.py
cat > main.py << 'PYEOF'
#!/usr/bin/env python3
"""
urBackend Quickstart App
"""
import os
from dotenv import load_dotenv
from urbackend import UrBackendClient

load_dotenv()

PUBLISHABLE_KEY = os.getenv("URBACKEND_PUBLISHABLE_KEY", "")
API_URL = os.getenv("URBACKEND_API_URL", "https://api.ub.bitbros.in")


def main():
    print("🚀 urBackend Python Quickstart")
    print("=" * 50)

    # Initialize with publishable key (safe for frontend use)
    client = UrBackendClient(api_key=PUBLISHABLE_KEY, base=API_URL)

    # ── Database: Create a document ───────────────────────────────────
    print("\n📝 Creating a post...")
    try:
        post = client.db.insert("posts", {
            "title": "Hello from Python!",
            "content": "This was created with the urbackend Python SDK."
        })
        print(f"   ✅ Created: {post.get('_id')}")
    except Exception as e:
        print(f"   ℹ️  Create a 'posts' collection in your dashboard first: {e}")

    print("\n" + "=" * 50)
    print("🎉 Done! Check your urBackend dashboard.")


if __name__ == "__main__":
    main()
PYEOF

# Create test file
cat > tests/test_quickstart.py << 'PYTEST'
"""Basic tests for the quickstart app."""

import pytest
from unittest.mock import MagicMock


def test_client_import():
    """Test that the SDK can be imported."""
    from urbackend import UrBackendClient
    assert UrBackendClient is not None
PYTEST

# Create __init__.py for tests
touch tests/__init__.py

# Install dependencies
echo ""
echo -e "${BLUE}📦 Installing dependencies...${NC}"
pip install -r requirements.txt

echo ""
echo -e "${GREEN}✅ Project created successfully!${NC}"
echo ""
echo -e "  ${BLUE}Next steps:${NC}"
echo -e "  1. cd ${PROJECT_NAME}"
echo -e "  2. source venv/bin/activate  (Windows: venv\\Scripts\\activate)"
echo -e "  3. Edit main.py with your logic"
echo -e "  4. Run ${YELLOW}python main.py${NC}"
echo -e "  5. Run tests: ${YELLOW}pytest${NC}"
echo ""
echo -e "  ${BLUE}Deploy to Vercel:${NC}"
echo -e "  https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgeturbackend%2FurBackend%2Ftree%2Fmain%2Fexamples%2Fquickstart-python"
echo ""