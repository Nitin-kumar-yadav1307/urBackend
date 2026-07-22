"""
Tests for the Python SDK demo.

These tests verify that the demo script's functions work correctly
with mock data. They do NOT require a live urBackend connection.
"""

from unittest.mock import MagicMock, patch
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


class TestDemoFunctions:
    """Test suite for the Python SDK demo functions."""

    def setup_method(self, method):
        """Reset all mocks before each test."""
        self.mock_urbackend = MagicMock()
        self.mock_client = MagicMock()
        self.mock_auth = MagicMock()
        self.mock_db = MagicMock()
        self.mock_storage = MagicMock()
        self.mock_mail = MagicMock()

        self.mock_client.auth = self.mock_auth
        self.mock_client.db = self.mock_db
        self.mock_client.storage = self.mock_storage
        self.mock_client.mail = self.mock_mail

        self.mock_urbackend.UrBackendClient.return_value = self.mock_client

    def test_demo_auth_signup(self):
        """Test that demo_auth handles signup correctly."""
        from main import demo_auth

        self.mock_auth.signup.return_value = {"_id": "user_123", "email": "test@example.com"}
        self.mock_auth.login.return_value = {"token": "test_token_abc123"}
        self.mock_auth.get_token.return_value = "test_token_abc123"
        self.mock_auth.me.return_value = {
            "_id": "user_123",
            "email": "test@example.com",
            "name": "Test User",
        }

        result = demo_auth(self.mock_client)
        assert result is not None
        assert result["email"] == "test@example.com"
        self.mock_auth.signup.assert_called_once()
        self.mock_auth.login.assert_called_once()
        self.mock_auth.me.assert_called_once()

    def test_demo_auth_login_fallback(self):
        """Test that demo_auth falls back to login if signup fails."""
        from main import demo_auth

        self.mock_auth.signup.side_effect = Exception("User already exists")
        self.mock_auth.login.return_value = {"token": "test_token_abc123"}
        self.mock_auth.get_token.return_value = "test_token_abc123"
        self.mock_auth.me.return_value = {"_id": "user_123", "email": "test@example.com"}

        result = demo_auth(self.mock_client)
        assert result is not None
        assert result["email"] == "test@example.com"
        self.mock_auth.signup.assert_called_once()
        self.mock_auth.login.assert_called_once()

    def test_demo_auth_login_failure(self):
        """Test that demo_auth returns None on login failure."""
        from main import demo_auth

        self.mock_auth.signup.side_effect = Exception("User exists")
        self.mock_auth.login.side_effect = Exception("Invalid credentials")

        result = demo_auth(self.mock_client)
        assert result is None

    def test_demo_database_crud(self):
        """Test full database CRUD cycle."""
        from main import demo_database

        self.mock_db.insert.return_value = {"_id": "post_123", "title": "Test Post"}
        self.mock_db.get_all.return_value = [{"_id": "post_123", "title": "Test Post"}]
        self.mock_db.get_one.return_value = {"_id": "post_123", "title": "Test Post"}
        self.mock_db.patch.return_value = {
            "_id": "post_123",
            "title": "Updated: Python SDK Demo Post",
        }
        self.mock_db.delete.return_value = {"deleted": True}

        # Should not raise any exceptions
        demo_database(self.mock_client, "project_123", "test_token")
        self.mock_db.insert.assert_called_once()
        self.mock_db.get_all.assert_called_once()
        self.mock_db.get_one.assert_called_once()
        self.mock_db.patch.assert_called_once()
        self.mock_db.delete.assert_called_once()

    def test_demo_storage(self):
        """Test storage upload and URL generation."""
        from main import demo_storage

        self.mock_storage.upload.return_value = {"path": "uploads/demo-upload.txt"}
        self.mock_storage.get_url.return_value = "https://storage.example.com/file.txt"

        # Should not raise any exceptions
        demo_storage(self.mock_client, "project_123", "test_token")
        self.mock_storage.upload.assert_called_once()

    def test_demo_mail(self):
        """Test mail sending."""
        from main import demo_mail

        self.mock_mail.send.return_value = {"id": "email_123"}

        # Should not raise any exceptions
        demo_mail(self.mock_client)
        self.mock_mail.send.assert_called_once()
</arg_value></tool_call>