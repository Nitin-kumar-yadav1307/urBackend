# Python SDK Demo — urBackend Quickstart

A minimal Python application demonstrating the `urbackend` Python SDK for database CRUD, authentication, and storage operations.

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.9+
- A urBackend account ([sign up here](https://urbackend.bitbros.in))
- A urBackend project with API keys

### 2. Setup

```bash
# Clone the repo
git clone https://github.com/geturbackend/urBackend.git
cd urBackend/examples/python-sdk-demo

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your urBackend API keys
```

### 3. Run the Demo

```bash
python main.py
```

## 📦 What This Demo Shows

| Feature | Code Example |
|---------|-------------|
| **Auth** | Sign up, login, get current user |
| **Database** | CRUD operations on collections |
| **Storage** | Upload and download files |
| **Mail** | Send transactional emails (server-side) |

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `URBACKEND_PUBLISHABLE_KEY` | Publishable API key (pk_live_...) |
| `URBACKEND_SECRET_KEY` | Secret API key (sk_live_...) |
| `URBACKEND_PROJECT_ID` | Your project ID |
| `URBACKEND_API_URL` | API base URL (default: https://api.ub.bitbros.in) |

## 🧪 Run Tests

```bash
pytest tests/
```

## 🚢 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgeturbackend%2FurBackend%2Ftree%2Fmain%2Fexamples%2Fpython-sdk-demo&env=URBACKEND_PUBLISHABLE_KEY,URBACKEND_SECRET_KEY,URBACKEND_PROJECT_ID&project-name=urbackend-python-demo&repository-name=urbackend-python-demo)