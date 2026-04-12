# urKanban — SDK Powered Kanban Example

A modern Kanban Board application demonstrating the official `@urbackend/sdk`.

## 🏗️ Architecture

- **Frontend (React/Vite)**: Uses the **Publishable Key (PK)** to manage authentication and database CRUD (Boards & Tasks).
- **Backend (Node.js/Express)**: Uses the **Secret Key (SK)** to securely send email notifications via the SDK's Mail module.

## 🚀 Getting Started

### 1. Dashboard Setup
1.  **Enable Auth**: Go to 'Auth' in your urBackend project and toggle it on.
2.  **Create Collections**:
    - `boards`: Add field `name` (String, Required) and `ownerId` (String, Required).
    - `tasks`: Add field `title` (String, Required), `description` (String), `status` (String, Default: `Todo`), `boardId` (String, Required), and `ownerId` (String, Required).
3.  **Configure RLS**:
    - `boards`: Set Mode to `private`, ownerField to `ownerId`.
    - `tasks`: Set Mode to `private`, ownerField to `ownerId`.

### 2. Environment Variables

#### Server (`server/.env`)
```env
URBACKEND_SECRET_KEY=sk_live_...
PORT=4001
```

#### Client (`client/.env`)
```env
VITE_URBACKEND_PK=pk_live_...
VITE_NOTIFY_SERVER_URL=http://localhost:4001
```

### 3. Installation & Run

```bash
# Terminal 1: Server
cd server
npm install
npm start

# Terminal 2: Client
cd client
npm install
npm run dev
```

## 💡 SDK Features Shown
- `client.auth.signUp` / `client.auth.login`: User management.
- `client.db.getAll` / `client.db.getOne`: Data fetching with filters.
- `client.db.insert`: Creating new documents.
- `client.db.patch`: Efficient partial updates for task movement.
- `client.mail.send`: Server-side secure mailing.
