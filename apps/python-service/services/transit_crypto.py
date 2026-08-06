"""Decrypt payloads encrypted by Node's encryptForTransit() using AES-256-GCM."""

from Crypto.Cipher import AES
from config import settings


def decrypt_transit(encrypted_obj: dict) -> str:
    """Decrypt a transit-encrypted value.

    Args:
        encrypted_obj: Dict with keys 'iv', 'encryptedData', 'authTag' (all hex strings).

    Returns:
        The decrypted plaintext string.

    Raises:
        ValueError: If INTERNAL_PAYLOAD_KEY is not configured.
        Exception: If decryption or verification fails.
    """
    if not settings.INTERNAL_PAYLOAD_KEY:
        raise ValueError("INTERNAL_PAYLOAD_KEY is not configured")

    key = bytes.fromhex(settings.INTERNAL_PAYLOAD_KEY)
    iv = bytes.fromhex(encrypted_obj["iv"])
    tag = bytes.fromhex(encrypted_obj["authTag"])
    ciphertext = bytes.fromhex(encrypted_obj["encryptedData"])

    cipher = AES.new(key, AES.MODE_GCM, nonce=iv)
    plaintext = cipher.decrypt_and_verify(ciphertext, tag)
    return plaintext.decode("utf-8")
