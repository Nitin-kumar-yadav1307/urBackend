# Cloud Storage ☁️

Easily manage file and image uploads without setting up AWS S3 buckets or managing complex multi-part forms.

## 1. Upload a File

To upload a file, send a `POST` request with a `multipart/form-data` body.

**Endpoint**: `POST /api/storage/upload`

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const res = await fetch('https://api.ub.bitbros.in/api/storage/upload', {
  method: 'POST',
  headers: { 'x-api-key': 'YOUR_KEY' },
  body: formData
});

const { url, path, provider } = await res.json();
// url: "https://xyz.supabase.co/storage/v1/object/public/dev-files/project_id/image.jpg"
// path: "project_id/image.jpg"
```

Expected response shape:

```json
{
  "message": "File uploaded successfully",
  "url": "https://xyz.supabase.co/storage/v1/object/public/dev-files/PROJECT_ID/file.png",
  "path": "PROJECT_ID/file.png",
  "provider": "internal"
}
```

> [!NOTE]
> Do **NOT** set the `Content-Type` header manually for file uploads; the browser will handle it for you when you pass a `FormData` object.

## 2. Delete a File

To delete a file, you must provide the `path` returned during the upload.

**Endpoint**: `DELETE /api/storage/file`

```javascript
await fetch('https://api.ub.bitbros.in/api/storage/file', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json', 'x-api-key': 'YOUR_KEY' },
  body: JSON.stringify({
    path: "YOUR_PROJECT_ID/your_file_name.png"
  })
});
```

If `path` is invalid or already removed, API returns `404`.

## Limits

- **File Size**: Maximum **10 MB** per file.
- **Storage Quota**: Total storage depends on your project's plan (default: **100 MB**).
- **Public Access**: All uploaded files are publicly accessible via the returned URL. Do not upload sensitive, private documents.

## Troubleshooting

- `400 Bad Request`: usually missing `file` in multipart form.
- `401 Unauthorized`: missing/invalid API key.
- `413 Payload Too Large`: file exceeds max size limit.

## Presigned Upload (Dashboard/Public API)

For the newer upload flow, file bytes are uploaded directly from the browser to storage.

Typical flow:

1. Call backend `POST /api/storage/upload-request` with `filename`, `contentType`, and `size`.
2. Receive `signedUrl` and `filePath`.
3. Browser uploads file to `signedUrl` using `PUT`.
4. Call backend `POST /api/storage/upload-confirm` to verify file existence and charge quota.

This avoids proxying file bytes through Node.js and keeps server memory usage predictable.

## Required Bucket CORS For S3/R2

If using AWS S3 or Cloudflare R2 with presigned browser uploads, bucket CORS must allow the dashboard origin.

Required methods:

- `PUT`
- `OPTIONS`
- `GET`
- `HEAD`

Required headers should include at least:

- `content-type`
- `content-length`

Browser `PUT` requests to `signedUrl` should send the file body and include the correct `Content-Type`, and `Content-Length` when your client/runtime allows explicitly setting it.

If preflight CORS is missing or restrictive, browser uploads will fail even when the signed URL is valid.
