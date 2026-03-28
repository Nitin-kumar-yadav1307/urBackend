# Authentication 🔐

urBackend includes a built-in authentication system that manages user registration, login, and profile retrieval using **JSON Web Tokens (JWT)**.

## The `users` Collection Contract

To enable authentication, your project must have a collection named `users`. 

> [!IMPORTANT]
> **Schema Requirements**:
> The `users` collection **MUST** contain at least these two fields:
> 1. `email` (String, Required, Unique)
> 2. `password` (String, Required)
>
> You can add any other fields (e.g., `username`, `avatar`, `preferences`), and urBackend's Mongoose-powered validation will handle them automatically during signup.

## 1. Sign Up User

Creates a new user and returns a 7-day JWT token.

**Endpoint**: `POST /api/userAuth/signup`

```javascript
await fetch('https://api.ub.bitbros.in/api/userAuth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': 'YOUR_KEY' },
  body: JSON.stringify({
    email: "dev@example.com",
    password: "securePassword123",
    username: "dev_pulse",
    preferences: { theme: "dark", notifications: true } // Custom fields are supported!
  })
});
```

## 2. Login User

Authenticates credentials and returns a 7-day JWT token.

**Endpoint**: `POST /api/userAuth/login`

```javascript
const res = await fetch('https://api.ub.bitbros.in/api/userAuth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': 'YOUR_KEY' },
  body: JSON.stringify({
    email: "dev@example.com",
    password: "securePassword123"
  })
});
const { token } = await res.json();
```

## 3. Get Profile (Me)

Fetches the details of the currently authenticated user.

**Endpoint**: `GET /api/userAuth/me`

```javascript
await fetch('https://api.ub.bitbros.in/api/userAuth/me', {
  headers: {
    'x-api-key': 'YOUR_KEY',
    'Authorization': `Bearer ${USER_TOKEN}`
  }
});
```

## Security Note

- **JWT Expiration**: Tokens expire after **7 days**. Ensure your frontend handles token refresh or re-login logic.
- **Passwords**: Passwords are automatically hashed using **Bcrypt** before being stored. Even project owners cannot see raw user passwords.

## How this relates to RLS and `pk_live`

- `userAuth` endpoints (`/api/userAuth/*`) are the official way to create/login/manage end users.
- The generic data API for users (`/api/data/users*`) is protected and should not be used for user management.
- With `pk_live`, write access to non-users collections is:
  - blocked by default,
  - allowed only when collection-level RLS is enabled,
  - and requires `Authorization: Bearer <user_jwt>`.

## RLS Quick Test (2 minutes)

Use this checklist to quickly verify collection-level RLS behavior on any non-`users` collection (example: `posts` with owner field `userId`).

### 1) `pk_live` + no token => write should fail

```bash
curl -X POST "https://api.ub.bitbros.in/api/data/posts" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: pk_live_xxx" ^
  -d "{\"content\":\"hello\"}"
```

Expected: `401/403` when RLS write auth is required.

### 2) `pk_live` + user token + no `userId` => write should pass, owner auto-injected

```bash
curl -X POST "https://api.ub.bitbros.in/api/data/posts" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: pk_live_xxx" ^
  -H "Authorization: Bearer USER_JWT" ^
  -d "{\"content\":\"my first post\"}"
```

Expected: success (`200/201`) and response includes `userId` set to the authenticated user.

### 3) `pk_live` + user token + different `userId` => write should fail

```bash
curl -X POST "https://api.ub.bitbros.in/api/data/posts" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: pk_live_xxx" ^
  -H "Authorization: Bearer USER_JWT" ^
  -d "{\"content\":\"blocked write\",\"userId\":\"SOMEONE_ELSE_ID\"}"
```

Expected: `403 Forbidden`.

### 4) `sk_live` (server side) => bypass allowed

```bash
curl -X POST "https://api.ub.bitbros.in/api/data/posts" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: sk_live_xxx" ^
  -d "{\"content\":\"server insert\",\"userId\":\"any_valid_user_id\"}"
```

Expected: success (`200/201`) from trusted backend context.
