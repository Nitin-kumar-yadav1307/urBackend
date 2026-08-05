"""BYOK (Bring Your Own Key) resolution and AI generation rate limiting."""

import datetime
import logging

from fastapi import HTTPException
from langchain_groq import ChatGroq

from config import settings
from dependencies import redis_client
from services.transit_crypto import decrypt_transit

logger = logging.getLogger(__name__)

FREE_TIER_LIMIT = 5


async def resolve_ai_client(
    developer_id: str | None,
    plan: str | None,
    encrypted_byok: dict | None,
) -> ChatGroq:
    """Resolve the appropriate AI client based on BYOK and plan.

    Resolution order:
        1. BYOK key present → decrypt, use developer's key, no rate limit
        2. Pro plan, no BYOK → platform key, no rate limit
        3. Free plan, no BYOK → platform key, 5 generations/month

    Args:
        developer_id: The developer's MongoDB ObjectId string.
        plan: The developer's plan ('free' or 'pro').
        encrypted_byok: Transit-encrypted BYOK payload from Node, or None.

    Returns:
        An initialized ChatGroq client.

    Raises:
        HTTPException: 401 if BYOK key is invalid, 403 if rate limited, 500 if no platform key.
    """

    # ── 1. Try BYOK ──
    if encrypted_byok and encrypted_byok.get("groqKey"):
        try:
            decrypted_key = decrypt_transit(encrypted_byok["groqKey"])
            return ChatGroq(
                api_key=decrypted_key,
                model_name="llama-3.1-8b-instant",
                temperature=0,
            )
        except Exception as e:
            logger.warning("BYOK decryption/init failed: %s", e)
            raise HTTPException(
                status_code=401, detail="Invalid BYOK Groq key provided"
            ) from e

    # ── 2. Platform key guard ──
    if not settings.GROQ_API_KEY:
        raise HTTPException(
            status_code=500, detail="Platform AI key not configured"
        )

    # ── 3. Free-tier atomic rate limit ──
    if plan != "pro" and developer_id:
        month = datetime.datetime.now(datetime.UTC).strftime("%Y-%m")
        key = f"ai:gen:count:{developer_id}:{month}"

        # Atomic pipeline: INCR + TTL check
        pipe = redis_client.pipeline()
        pipe.incr(key)
        pipe.ttl(key)
        count, ttl = await pipe.execute()

        # First usage this month → set 32-day expiry
        if count == 1 or ttl == -1:
            await redis_client.expire(key, 32 * 86400)

        if count > FREE_TIER_LIMIT:
            raise HTTPException(
                status_code=403,
                detail=(
                    f"Free tier AI limit reached ({FREE_TIER_LIMIT}/month). "
                    f"Upgrade to Pro or add your own Groq key in Settings."
                ),
            )

    # ── 4. Return platform client ──
    return ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model_name="llama-3.1-8b-instant",
        temperature=0,
    )
