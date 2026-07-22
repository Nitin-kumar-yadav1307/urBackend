#!/usr/bin/env python3
"""
urBackend Python SDK Demo
=========================
Demonstrates the core features of the urbackend Python SDK:
  - Authentication (signup, login, session management)
  - Database CRUD operations
  - File storage (upload/download)
  - Email sending (server-side, secret key required)

Prerequisites:
  - Python 3.9+
  - pip install urbackend python-dotenv
  - A urBackend project with API keys configured in .env

Usage:
  python main.py
"""

import os
import sys
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ── Configuration ──────────────────────────────────────────────────────────
PUBLISHABLE_KEY = os.getenv("URBACKEND_PUBLISHABLE_KEY", "")
SECRET_KEY = os.getenv("URBACKEND_SECRET_KEY", "")
PROJECT_ID = os.getenv("URBACKEND_PROJECT_ID", "")
API_URL = os.getenv("URBACKEND_API_URL", "https://api.ub.bitbros.in")


def print_separator(title: str) -> None:
    """Print a section header for cleaner output."""
    print(f"\n{'=' * 60}")
    print(f"  {title}")
    print(f"{'=' * 60}")


def demo_auth(client) -> Optional[dict]:
    """
    Demonstrate authentication features.

    Shows signup, login, token refresh, and fetching the current user.
    Returns the authenticated user object if successful.
    """
    print_separator("🔐 AUTHENTICATION DEMO")

    # For demo purposes, we use a random test user
    import random
    import string
    suffix = ''.join(random.choices(string.ascii_lowercase, k=6))
    test_email = f"demo-user-{suffix}@example.com"
    test_password = "DemoPassword123!"
    test_username = f"demouser_{suffix}"

    print(f"  Signing up user: {test_email}")
    try:
        signup_result = client.auth.signup(
            email=test_email,
            password=test_password,
            username=test_username,
        )
        print(f"  ✅ Signup successful! User ID: {signup_result.get('_id', 'N/A')}")
    except Exception as e:
        print(f"  ℹ️  Signup note: {e} (user may already exist, trying login...)")

    print(f"\n  Logging in as: {test_email}")
    try:
        session = client.auth.login(email=test_email, password=test_password)
        token = session.get("token", client.auth.get_token())
        print(f"  ✅ Login successful! Token: {token[:20]}...")
    except Exception as e:
        print(f"  ❌ Login failed: {e}")
        return None

    print("\n  Fetching current user profile...")
    try:
        user = client.auth.me()
        print(f"  ✅ Current user: {user.get('email', 'N/A')} (ID: {user.get('_id', 'N/A')})")
        return user
    except Exception as e:
        print(f"  ❌ Failed to fetch user: {e}")
        return None


def demo_database(client, project_id: str, token: str) -> None:
    """
    Demonstrate database CRUD operations.

    Shows creating, reading, updating, and deleting documents in a collection.
    Requires a 'posts' collection with fields: title (String), content (String).
    """
    print_separator("🗄️  DATABASE CRUD DEMO")
    collection = "posts"

    # ── Create a document ──────────────────────────────────────────────
    print(f"  Inserting a document into '{collection}'...")
    try:
        post = client.db.insert(collection, {
            "title": "Hello from Python SDK!",
            "content": "This post was created by the urbackend Python SDK demo.",
        }, token=token)
        post_id = post.get("_id", "N/A")
        print(f"  ✅ Document created! ID: {post_id}")
    except Exception as e:
        print(f"  ❌ Insert failed: {e}")
        print("  💡 Make sure you've created a 'posts' collection in your urBackend dashboard.")
        return

    # ── Read all documents ─────────────────────────────────────────────
    print(f"\n  Fetching all documents from '{collection}'...")
    try:
        posts = client.db.get_all(collection, token=token)
        print(f"  ✅ Found {len(posts)} document(s)")
    except Exception as e:
        print(f"  ❌ Fetch failed: {e}")

    # ── Read a single document ─────────────────────────────────────────
    print(f"\n  Fetching single document by ID...")
    try:
        fetched = client.db.get_one(collection, post_id, token=token)
        print(f"  ✅ Retrieved: {fetched.get('title', 'N/A')}")
    except Exception as e:
        print(f"  ❌ Fetch failed: {e}")

    # ── Update a document ──────────────────────────────────────────────
    print(f"\n  Updating document title...")
    try:
        updated = client.db.patch(collection, post_id, {
            "title": "Updated: Python SDK Demo Post",
        }, token=token)
        print(f"  ✅ Updated! New title: {updated.get('title', 'N/A')}")
    except Exception as e:
        print(f"  ❌ Update failed: {e}")

    # ── Delete a document ──────────────────────────────────────────────
    print(f"\n  Deleting document...")
    try:
        result = client.db.delete(collection, post_id, token=token)
        if result.get("deleted"):
            print(f"  ✅ Document deleted successfully!")
    except Exception as e:
        print(f"  ❌ Delete failed: {e}")


def demo_storage(client, project_id: str, token: str) -> None:
    """
    Demonstrate file storage operations.

    Shows uploading a file and generating a presigned URL for download.
    """
    print_separator("📦 STORAGE DEMO")

    # Create a temporary file to upload
    test_file_path = Path("demo-upload.txt")
    try:
        test_file_path.write_text(
            "Hello from urBackend Python SDK!\n"
            "This file was uploaded using the Python SDK storage module.\n"
        )

        print(f"  Uploading '{test_file_path.name}'...")
        with open(test_file_path, "rb") as f:
            result = client.storage.upload(
                f,
                filename=test_file_path.name,
                token=token,
            )
        print(f"  ✅ Upload successful! Path: {result.get('path', 'N/A')}")

        print(f"\n  Getting download URL...")
        try:
            url = client.storage.get_url(test_file_path.name, token=token)
            print(f"  ✅ Download URL: {url[:60]}...")
        except Exception as e:
            print(f"  ℹ️  get_url not available in this SDK version: {e}")

    except Exception as e:
        print(f"  ❌ Storage demo failed: {e}")
    finally:
        if test_file_path.exists():
            test_file_path.unlink()
            print(f"  🧹 Cleaned up test file")


def demo_mail(client) -> None:
    """
    Demonstrate sending transactional emails.

    Requires a Secret Key and a configured email template in urBackend.
    """
    print_separator("📧 MAIL DEMO")

    print("  Sending test email (requires configured email template)...")
    try:
        result = client.mail.send(
            to="user@example.com",
            template_name="welcome",
            variables={
                "name": "Demo User",
                "projectName": "Python SDK Demo",
                "appUrl": "https://urbackend.bitbros.in",
            },
        )
        print(f"  ✅ Email sent! ID: {result.get('id', 'N/A')}")
    except Exception as e:
        print(f"  ℹ️  Mail demo skipped (configure email template in dashboard): {e}")


def main() -> None:
    """Main demo entry point."""
    try:
        from urbackend import UrBackendClient, UrBackendError, AuthError, NotFoundError
    except ImportError:
        print("❌ urbackend SDK not installed. Run: pip install urbackend")
        sys.exit(1)

    if not PUBLISHABLE_KEY or not SECRET_KEY:
        print("❌ Error: URBACKEND_PUBLISHABLE_KEY and URBACKEND_SECRET_KEY must be set in .env")
        print("💡 Copy .env.example to .env and fill in your API keys")
        sys.exit(1)

    print("╔══════════════════════════════════════════════════════════╗")
    print("║     urBackend Python SDK Demo                           ║")
    print("║     Showcasing all core SDK capabilities                ║")
    print("╚══════════════════════════════════════════════════════════╝")

    # Initialize the SDK client with the publishable key
    print(f"\n🔧 Initializing SDK client... (API URL: {API_URL})")
    client = UrBackendClient(
        api_key=PUBLISHABLE_KEY,
        base_url=API_URL,
    )

    # ── Authentication Demo ───────────────────────────────────────────
    user = demo_auth(client)
    if not user:
        print("\n⚠️  Skipping remaining demos (authentication required).")
        return

    token = client.auth.get_token()
    if not token:
        print("⚠️  No auth token available. Skipping database and storage demos.")
        return

    # ── Database CRUD Demo ────────────────────────────────────────────
    demo_database(client, PROJECT_ID, token)

    # ── Storage Demo ──────────────────────────────────────────────────
    demo_storage(client, PROJECT_ID, token)

    # ── Mail Demo (secret key only) ────────────────────────────────────
    print("\n📧 Switching to Secret Key for mail operations...")
    secret_client = UrBackendClient(api_key=SECRET_KEY, base_url=API_URL)
    demo_mail(secret_client)

    print(f"\n{'=' * 60}")
    print("  🎉 Demo complete! Check your urBackend dashboard for results.")
    print(f"{'=' * 60}\n")


if __name__ == "__main__":
    main()