import pytest
import os
import sys
from pathlib import Path
from unittest.mock import AsyncMock, patch, MagicMock

SERVICE_ROOT = Path(__file__).resolve().parents[1]
if str(SERVICE_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVICE_ROOT))

# Set env vars before importing modules
os.environ.setdefault("INTERNAL_SECRET", "a" * 32)
os.environ.setdefault("INTERNAL_PAYLOAD_KEY", "a" * 64)
os.environ.setdefault("GROQ_API_KEY", "gsk_test_platform_key")

from services.byok import resolve_ai_client, FREE_TIER_LIMIT
from config import settings


@pytest.fixture(autouse=True)
def mock_redis():
    """Mock Redis client for all tests.

    redis.asyncio's pipeline() is a sync method returning a Pipeline object,
    but execute() on the pipeline is async. We use MagicMock for the client
    and pipeline, with AsyncMock only for the awaited methods.
    """
    with patch('services.byok.redis_client') as mock_rc:
        mock_pipe = MagicMock()
        mock_pipe.incr = MagicMock(return_value=mock_pipe)  # chainable
        mock_pipe.ttl = MagicMock(return_value=mock_pipe)   # chainable
        mock_pipe.execute = AsyncMock(return_value=[1, -1])
        mock_rc.pipeline = MagicMock(return_value=mock_pipe)
        mock_rc.expire = AsyncMock()
        yield mock_rc, mock_pipe


@pytest.fixture
def mock_decrypt():
    """Mock transit decryption."""
    with patch('services.byok.decrypt_transit') as mock:
        mock.return_value = "gsk_test_byok_key_12345"
        yield mock


@pytest.mark.asyncio
async def test_byok_key_decrypted_and_used(mock_decrypt):
    """When BYOK key is provided, it should be decrypted and used."""
    encrypted_byok = {"groqKey": {"iv": "aa", "encryptedData": "bb", "authTag": "cc"}}

    with patch('services.byok.ChatGroq') as MockGroq:
        MockGroq.return_value = MagicMock()
        client = await resolve_ai_client("dev123", "free", encrypted_byok)

        mock_decrypt.assert_called_once_with(encrypted_byok["groqKey"])
        MockGroq.assert_called_once_with(
            api_key="gsk_test_byok_key_12345",
            model_name="llama-3.1-8b-instant",
            temperature=0,
        )


@pytest.mark.asyncio
async def test_invalid_byok_returns_401():
    """When BYOK decryption fails, should raise 401."""
    encrypted_byok = {"groqKey": {"iv": "bad", "encryptedData": "bad", "authTag": "bad"}}

    with patch('services.byok.decrypt_transit', side_effect=Exception("decrypt failed")):
        with pytest.raises(Exception) as exc_info:
            await resolve_ai_client("dev123", "free", encrypted_byok)
        assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_free_tier_under_limit(mock_redis):
    """Free tier under limit should use platform key."""
    _, mock_pipe = mock_redis
    mock_pipe.execute = AsyncMock(return_value=[3, 100000])

    with patch('services.byok.ChatGroq') as MockGroq:
        MockGroq.return_value = MagicMock()
        client = await resolve_ai_client("dev123", "free", None)

        MockGroq.assert_called_once_with(
            api_key=settings.GROQ_API_KEY,
            model_name="llama-3.1-8b-instant",
            temperature=0,
        )


@pytest.mark.asyncio
async def test_free_tier_limit_enforced(mock_redis):
    """Free tier over limit should raise 403."""
    _, mock_pipe = mock_redis
    mock_pipe.execute = AsyncMock(return_value=[6, 100000])

    with pytest.raises(Exception) as exc_info:
        await resolve_ai_client("dev123", "free", None)
    assert exc_info.value.status_code == 403


@pytest.mark.asyncio
async def test_pro_tier_under_limit(mock_redis):
    """Pro tier under limit should use platform key."""
    _, mock_pipe = mock_redis
    mock_pipe.execute = AsyncMock(return_value=[99, 100000])

    with patch('services.byok.ChatGroq') as MockGroq:
        MockGroq.return_value = MagicMock()
        client = await resolve_ai_client("dev123", "pro", None)

        MockGroq.assert_called_once_with(
            api_key=settings.GROQ_API_KEY,
            model_name="llama-3.1-8b-instant",
            temperature=0,
        )


@pytest.mark.asyncio
async def test_pro_tier_limit_enforced(mock_redis):
    """Pro tier over limit should raise 403."""
    _, mock_pipe = mock_redis
    mock_pipe.execute = AsyncMock(return_value=[101, 100000])

    with pytest.raises(Exception) as exc_info:
        await resolve_ai_client("dev123", "pro", None)
    assert exc_info.value.status_code == 403

