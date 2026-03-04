# urBackend API Usage Guide 📖

This guide provides technical examples for interacting with the urBackend API. Once your project is created in the dashboard, use your **Public API Key** (for frontend) or **Secret API Key** (for backend) to make requests.

## Base URL

```
https://api.urbackend.bitbros.in
```

## 1. Authentication

Manage users for your own applications using urBackend's built-in auth system.

### Sign Up User
```javascript
await fetch('https://api.urbackend.bitbros.in/api/userAuth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    email: "user@example.com",
    password: "securePassword123",
    name: "John Doe" // Optional
  })
});
```

### Login User
```javascript
const res = await fetch('https://api.urbackend.bitbros.in/api/userAuth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    email: "user@example.com",
    password: "securePassword123"
  })
});
const data = await res.json(); // Returns { token: "JWT_TOKEN", user: {...} }
```

### Get Profile (Me)
```javascript
await fetch('https://api.urbackend.bitbros.in/api/userAuth/me', {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Authorization': 'Bearer <USER_TOKEN>' // From login response
  }
});
```

## 2. Database API

Direct JSON document storage with no database management required.

### Get All Items
```javascript
// Replace :collectionName with your actual collection name (e.g., 'products')
const res = await fetch('https://api.urbackend.bitbros.in/api/data/products', {
  headers: { 'x-api-key': 'YOUR_API_KEY' }
});
const data = await res.json();
```

### Insert Data
```javascript
await fetch('https://api.urbackend.bitbros.in/api/data/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    name: "MacBook Pro",
    price: 1299,
    inStock: true
  })
});
```

### Update / Delete by ID
```javascript
const id = "DOCUMENT_ID";

// Update
await fetch(`https://api.urbackend.bitbros.in/api/data/products/${id}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({ price: 1199 })
});

// Delete
await fetch(`https://api.urbackend.bitbros.in/api/data/products/${id}`, {
  method: 'DELETE',
  headers: { 'x-api-key': 'YOUR_API_KEY' }
});
```

## 3. Storage API

Manage files and images with ease.

### Upload File
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const res = await fetch('https://api.urbackend.bitbros.in/api/storage/upload', {
  method: 'POST',
  headers: { 'x-api-key': 'YOUR_API_KEY' },
  body: formData
});
const data = await res.json();
// Returns { url: "...", path: "project_id/filename.jpg" }
```

### Delete File
```javascript
await fetch('https://api.urbackend.bitbros.in/api/storage/file', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    path: "PROJECT_ID/filename.jpg"
  })
});
```

## 🔐 Security Best Practices

> [!IMPORTANT]
> **Key Separation**:
> - Use the **Publishable Key** (`pk_live_...`) for frontend requests (Read-Only).
> - Use the **Secret Key** (`sk_live_...`) ONLY for backend/secure environments.
