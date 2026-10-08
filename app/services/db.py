import hashlib
import logging
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, Tuple
from cryptography.fernet import Fernet
from supabase import create_client, Client

from app.core.config import settings

logger = logging.getLogger(__name__)


class DatabaseService:
    def __init__(self):
        # Initialize Supabase Admin Client using service_role secret
        self.supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        self.cipher = Fernet(settings.MASTER_ENCRYPTION_KEY.encode("utf-8"))

    # --- CRYPTOGRAPHY HELPERS ---
    def encrypt_secret(self, raw_secret: str) -> str:
        """Encrypts an upstream API key before storing in the database."""
        return self.cipher.encrypt(raw_secret.encode("utf-8")).decode("utf-8")

    def decrypt_secret(self, encrypted_secret: str) -> str:
        """Decrypts an upstream API key for forwarding requests to OpenAI."""
        return self.cipher.decrypt(encrypted_secret.encode("utf-8")).decode("utf-8")

    def hash_key(self, raw_key: str) -> str:
        """Computes a SHA-256 hash of a proxy key for database lookups."""
        return hashlib.sha256(raw_key.strip().encode("utf-8")).hexdigest()

    # --- API KEY OPERATIONS ---
    def generate_proxy_key(self, user_id: str, raw_upstream_key: Optional[str] = None) -> str:
        """
        Generates a secure circuit breaker proxy key (cb_live_...), optionally
        encrypting an upstream key before storing the record in Supabase.
        """
        raw_token = secrets.token_hex(24)
        raw_proxy_key = f"cb_live_{raw_token}"
        key_hash = self.hash_key(raw_proxy_key)
        key_prefix = raw_proxy_key[:12]
        encrypted_upstream = (
            self.encrypt_secret(raw_upstream_key)
            if raw_upstream_key
            else ""
        )

        data = {
            "user_id": user_id,
            "key_hash": key_hash,
            "key_prefix": key_prefix,
            "encrypted_upstream_key": encrypted_upstream,
            "is_active": True,
        }
        
        self.supabase.table("api_keys").insert(data).execute()
        return raw_proxy_key

    def authenticate_proxy_key(self, raw_proxy_key: str) -> Optional[Dict[str, Any]]:
        """
        Authenticates an incoming proxy key, loads its profile limits,
        and decrypts the customer's upstream OpenAI key.
        """
        key_hash = self.hash_key(raw_proxy_key)

        response = self.supabase.table("api_keys") \
            .select("id, user_id, encrypted_upstream_key, is_active, profiles(*)") \
            .eq("key_hash", key_hash) \
            .eq("is_active", True) \
            .execute()

        if not response.data:
            return None

        record = response.data[0]
        profile = record.get("profiles") or {}
        
        encrypted_upstream_key = record.get("encrypted_upstream_key")
        if encrypted_upstream_key:
            try:
                upstream_key = self.decrypt_secret(encrypted_upstream_key)
            except Exception as exc:
                logger.error(
                    "Unable to decrypt configured upstream key for API key %s (%s).",
                    record.get("id"),
                    type(exc).__name__,
                )
                upstream_key = None
        else:
            upstream_key = None

        return {
            "api_key_id": record["id"],
            "user_id": record["user_id"],
            "upstream_key": upstream_key,
            "tier": profile.get("tier", "free"),
            "hourly_limit": float(profile.get("hourly_budget_cap_usd") or settings.DEFAULT_MAX_HOURLY_BUDGET_USD),
            "daily_limit": float(profile.get("daily_budget_cap_usd") or settings.DEFAULT_MAX_DAILY_BUDGET_USD),
            "webhook_url": profile.get("webhook_url"),
        }

    # --- USAGE & BUDGET TRACKING ---
    def get_user_spend(self, user_id: str) -> Tuple[float, float]:
        """
        Calculates rolling spend from PostgreSQL over the past 1 hour and 24 hours.
        Returns: (hourly_spend, daily_spend)
        """
        now = datetime.now(timezone.utc)
        one_day_ago = (now - timedelta(hours=24)).isoformat()
        one_hour_ago = (now - timedelta(hours=1)).isoformat()

        response = self.supabase.table("request_logs") \
            .select("cost_usd, created_at") \
            .eq("user_id", user_id) \
            .gte("created_at", one_day_ago) \
            .execute()

        records = response.data or []
        daily_spend = sum(float(r["cost_usd"]) for r in records)
        hourly_spend = sum(float(r["cost_usd"]) for r in records if r["created_at"] >= one_hour_ago)

        return round(hourly_spend, 6), round(daily_spend, 6)

    def log_request(
        self,
        user_id: str,
        api_key_id: str,
        session_id: str,
        model: str,
        input_tokens: int,
        output_tokens: int,
        cost_usd: float,
        status_code: int,
        was_blocked: bool = False,
        blocked_reason: Optional[str] = None
    ) -> None:
        """Inserts an immutable audit and spend log record into PostgreSQL."""
        payload = {
            "user_id": user_id,
            "api_key_id": api_key_id,
            "session_id": session_id,
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cost_usd": cost_usd,
            "status_code": status_code,
            "was_blocked": was_blocked,
            "blocked_reason": blocked_reason,
        }
        self.supabase.table("request_logs").insert(payload).execute()


# Global singleton instance
db_service = DatabaseService()


if __name__ == "__main__":
    print("Testing Database & Cryptography Service...")

    # 1. Test AES-256 Encryption & Decryption
    test_secret = "sk-proj-test123456789SecretKey"
    encrypted = db_service.encrypt_secret(test_secret)
    decrypted = db_service.decrypt_secret(encrypted)
    assert decrypted == test_secret, "Decryption does not match original secret!"
    print("-> Cryptography round-trip: OK")

    # 2. Test Supabase Connection & Table Access
    try:
        check = db_service.supabase.table("api_keys").select("id").limit(1).execute()
        print("-> Supabase connection & permissions: OK (Database responded successfully)")
    except Exception as e:
        print(f"-> Supabase connection error: {e}")
        exit(1)

    print("\nALL DATABASE TESTS PASSED.")