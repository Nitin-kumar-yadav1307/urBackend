# Authentication 🔐

urBackend includes a built-in authentication system that manages user registration, login, token refresh, logout, and profile retrieval using **JSON Web Tokens (JWT)**.

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

Authenticates credentials and returns an access token. A refresh token is also issued for session continuation.

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
const { accessToken, expiresIn } = await res.json();
```

> [!NOTE]
> `token` is currently returned as a backward-compatibility alias of `accessToken` and will be removed in a future release.
> Please migrate clients to `accessToken` now.

## 3. Refresh Access Token

Use when access token expires.

**Endpoint**: `POST /api/userAuth/refresh-token`

Web clients can use refresh cookie automatically:

```javascript
const refreshed = await fetch('https://api.ub.bitbros.in/api/userAuth/refresh-token', {
  method: 'POST',
  headers: { 'x-api-key': 'YOUR_KEY' },
  credentials: 'include'
});
```

Mobile/non-browser clients can send refresh token in header:

```javascript
const refreshed = await fetch('https://api.ub.bitbros.in/api/userAuth/refresh-token', {
  method: 'POST',
  headers: {
    'x-api-key': 'YOUR_KEY',
    'x-refresh-token': REFRESH_TOKEN,
    'x-refresh-token-mode': 'header'
  }
});
```

## 4. Logout

Revokes the current refresh session.

**Endpoint**: `POST /api/userAuth/logout`

```javascript
await fetch('https://api.ub.bitbros.in/api/userAuth/logout', {
  method: 'POST',
  headers: { 'x-api-key': 'YOUR_KEY' },
  credentials: 'include'
});
```

## 5. Get Profile (Me)

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

## 6. Get Public Profile by Username

Fetches a safe, public profile view for a user without requiring login.

**Endpoint**: `GET /api/userAuth/public/:username`

```javascript
await fetch('https://api.ub.bitbros.in/api/userAuth/public/dev_pulse', {
  headers: { 'x-api-key': 'YOUR_KEY' }
});
```

> [!NOTE]
> This endpoint never returns sensitive fields like `password` or `email`.

## 7. Social Auth

Supported providers:
- GitHub
- Google

Social auth is configured from the dashboard:
1. Set your project `Site URL` in Project Settings.
2. Open `Auth -> Social Auth`.
3. Copy the read-only callback URL shown for the provider.
4. Register that callback URL in the provider console.
5. Save the provider `Client ID` and `Client Secret` in urBackend and enable the provider.

### Start the provider login

**Endpoint**: `GET /api/userAuth/social/:provider/start`

Required headers:
- `x-api-key: pk_live_*` or `x-api-key: sk_live_*`

Example:

```javascript
window.location.href = 'https://api.ub.bitbros.in/api/userAuth/social/github/start';
```

This endpoint redirects the browser to the provider and uses the project `Site URL` to send users back to:

```text
<Site URL>/auth/callback
```

### What the callback URL contains

After successful provider login, urBackend redirects to your frontend callback route with:
- `token` in the URL fragment
- `rtCode` in the query string
- `provider`, `projectId`, `userId`, `isNewUser`, and `linkedByEmail` in the query string

Example redirect:

```text
https://your-app.example/auth/callback?rtCode=abc123&provider=github&projectId=proj_1&userId=user_1&isNewUser=false&linkedByEmail=true#token=eyJ...
```

`token` is intentionally placed in the fragment so it is not exposed through normal query-string logging or referrer leakage.

### Exchange the one-time `rtCode`

**Endpoint**: `POST /api/userAuth/social/exchange`

Required headers:

```javascript
{
  'Content-Type': 'application/json',
  'x-api-key': 'YOUR_KEY'
}
```

Required JSON body:

```javascript
{
  token: 'ACCESS_TOKEN_FROM_HASH',
  rtCode: 'ONE_TIME_CODE_FROM_QUERY'
}
```

Example frontend callback handler:

```javascript
const hashParams = new URLSearchParams(window.location.hash.slice(1));
const queryParams = new URLSearchParams(window.location.search);

const token = hashParams.get('token');
const rtCode = queryParams.get('rtCode');

if (!token || !rtCode) {
  throw new Error('Missing auth callback tokens');
}

const response = await fetch('https://api.ub.bitbros.in/api/userAuth/social/exchange', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ token, rtCode })
});

const payload = await response.json();
```

Successful response:

```javascript
{
  success: true,
  data: {
    refreshToken: 'REFRESH_TOKEN_VALUE'
  },
  message: 'Refresh token exchanged successfully'
}
```

Expected client behavior after success:
1. Keep using the original `token` as the access token.
2. Store `data.refreshToken` for session continuation.
3. Optionally store `provider`, `projectId`, and `userId` from the callback query string.
4. Redirect the user into the authenticated part of your app.

Common error responses:

```javascript
{ success: false, message: 'rtCode and token are required' }
{ success: false, message: 'Invalid or expired refresh token exchange code' }
{ success: false, message: 'Invalid refresh token exchange payload' }
```

Notes:
- `rtCode` is short-lived and one-time use.
- Existing users are linked by verified email when possible.
- New social-auth users still receive a generated hashed password internally to satisfy the required `users` schema contract.

## Security Note

- **Access Token Expiration**: Access tokens are short-lived. Use `/api/userAuth/refresh-token` for renewal.
- **Refresh Token Rotation**: Refresh tokens are rotated and replay-protected.
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
