# Developer Experience (DevEx) Guide

This guide explains the developer experience improvements available for urBackend, including project templates, quickstart scripts, and deployment options.

## 📋 Overview

The DevEx improvements make it easy for developers to:
1. **Discover** ready-to-use project templates via the web dashboard
2. **Clone** templates with one-click "Deploy to Vercel" buttons
3. **Scaffold** new projects from the terminal using quickstart scripts
4. **Learn** through comprehensive SDK demo projects

---

## 🚀 Project Templates

Access the templates page at `/templates` in your urBackend dashboard. Available templates:

| Template | SDK | Description | Deploy |
|----------|-----|-------------|--------|
| **React SDK Demo** | `@urbackend/react` | Auth components (UrAuth, ProtectedRoute) | ✅ Vercel |
| **Kanban Board** | `@urbackend/sdk` | CRUD + drag-and-drop + email notifications | ✅ Vercel |
| **Social Media (X Clone)** | `@urbackend/sdk` | Infinite scroll, images, social graphs | ✅ Vercel |
| **Python SDK Demo** | `urbackend` (Python) | CLI demo of auth, CRUD, storage, mail | - |
| **TypeScript Quickstart** | `@urbackend/sdk` | Scaffold a TS project from CLI | ✅ Vercel |
| **Python Quickstart** | `urbackend` (Python) | Scaffold a Python project from CLI | - |

### Features
- **Search**: Filter templates by name, description, or SDK
- **SDK Filter**: View templates by specific SDK
- **One-click Deploy**: "Deploy to Vercel" with pre-configured env vars
- **Expandable README**: Click any template to see setup instructions
- **Copy Quickstart**: One-click copy of terminal commands

---

## 💻 Quickstart Scripts

Scaffold projects without leaving your terminal:

### TypeScript
```bash
# Download from an immutable release tag and verify checksum before executing
SCRIPT_URL="https://raw.githubusercontent.com/geturbackend/urBackend/v0.1.1/examples/quickstart-scripts/setup-ts-sdk.sh"
curl -fsSL "$SCRIPT_URL" -o /tmp/setup-ts-sdk.sh
echo "d842dab0fab57131a51e232147cde01ff8594cb88b02a560698a32d9a7642d73  /tmp/setup-ts-sdk.sh" | sha256sum -c - && bash /tmp/setup-ts-sdk.sh
```

### Python
```bash
# Download from an immutable release tag and verify checksum before executing
SCRIPT_URL="https://raw.githubusercontent.com/geturbackend/urBackend/v0.1.1/examples/quickstart-scripts/setup-python-sdk.sh"
curl -fsSL "$SCRIPT_URL" -o /tmp/setup-python-sdk.sh
echo "1f7c32bd4d8d382da079b236b03383f61190f67745956df80b1dfc37daa4ea18  /tmp/setup-python-sdk.sh" | sha256sum -c - && bash /tmp/setup-python-sdk.sh
```

Each script:
1. Checks prerequisites (Node.js 18+ / Python 3.9+)
2. Prompts for project name and API keys
3. Creates a complete project structure
4. Installs dependencies
5. Provides next steps

---

## 📦 SDK Demo Projects

### Python SDK Demo (`examples/python-sdk-demo/`)

A complete CLI application demonstrating all Python SDK features:
- **Auth**: Signup, login, token management, user profile
- **Database**: Full CRUD (create, read, update, delete)
- **Storage**: File upload and download URLs
- **Mail**: Send transactional emails

Run: `python main.py`

### React SDK Demo (`examples/react-sdk-demo/`)

A React app using `@urbackend/react`:
- **UrAuth**: Ready-to-use auth UI
- **ProtectedRoute**: Route protection
- **useUser / useAuth**: React hooks
- **UrUserButton**: User menu component

Run: `npm run dev`

### Kanban Board (`examples/sdk-kanban/`)

Full Kanban board with drag-and-drop:
- **Client**: React using `@urbackend/sdk` for auth and data
- **Server**: Node.js using secret key for mail notifications
- **Features**: Boards, tasks, drag-and-drop, email notifications

### Social Media Clone (`examples/social-demo/`)

Twitter/X.com clone demonstrating complex features:
- **Social Auth**: GitHub and Google OAuth
- **Posts**: Text + multi-image uploads
- **Social Graph**: Follow/unfollow
- **Timeline**: Infinite scroll
- **Theming**: Light/Dark mode

---

## 🚢 Deploy to Vercel

All frontend examples have pre-configured "Deploy to Vercel" buttons. When clicked:

1. You're taken to Vercel's import page
2. Environment variables are pre-configured (add your API keys)
3. The project builds and deploys automatically
4. Your urBackend-powered app is live in minutes!

### Environment Variables

| Template | Required Env Vars |
|----------|------------------|
| React SDK Demo | `VITE_URBACKEND_PK` |
| Kanban Board | `VITE_URBACKEND_PK` |
| Social Media | `VITE_PUBLIC_KEY` |
| TS Quickstart | `URBACKEND_PUBLISHABLE_KEY`, `URBACKEND_SECRET_KEY`, `URBACKEND_PROJECT_ID` |

---

## 🛠️ Adding a New Template

To add a new template to the dashboard:

1. Create the example project in `examples/your-demo/`
2. Add a Vercel deploy button in the README
3. Add the template to `apps/web-dashboard/src/pages/Templates.jsx` `TEMPLATES` array
4. Add CI job in `.github/workflows/examples.yml`

Template schema:
```js
{
  id: 'unique-id',           // Unique identifier
  name: 'Template Name',     // Display name
  description: '...',        // Short description
  icon: <IconComponent />,   // Lucide icon
  color: '#HEX',             // Accent color
  bgColor: 'rgba(...)',     // Background color
  sdk: '@urbackend/sdk',    // SDK name
  language: 'TypeScript',    // Language
  features: ['Feat1', ...], // Feature tags
  deployUrl: '...',          // Vercel deploy URL (null if not deployable)
  repoUrl: '...',            // Source code URL
  readme: '...'              // Setup instructions (markdown)
}
```

---

## 📊 File Structure

```
examples/
├── python-sdk-demo/       # Python SDK demo
│   ├── main.py
│   ├── requirements.txt
│   ├── tests/
│   └── README.md
├── react-sdk-demo/        # React SDK demo
│   ├── src/
│   ├── package.json
│   └── README.md
├── sdk-kanban/            # Kanban board demo
│   ├── client/
│   └── server/
├── social-demo/           # Social media clone
│   ├── client/
│   └── server/
├── quickstart-scripts/    # Quickstart scripts
│   ├── setup-ts-sdk.sh
│   └── setup-python-sdk.sh
├── vercel.json            # Vercel deployment config
└── DEVEX.md               # This file