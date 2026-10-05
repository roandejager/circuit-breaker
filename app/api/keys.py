import logging
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, Field
from app.services.db import db_service

router = APIRouter(prefix="/v1/keys", tags=["keys"])
logger = logging.getLogger("circuit_breaker_keys")


class CreateKeyRequest(BaseModel):
    upstream_key: str = Field(..., min_length=10, description="Customer raw OpenAI API key starting with sk-")


class CreateKeyResponse(BaseModel):
    proxy_key: str
    key_prefix: str
    message: str


@router.post("/create", response_model=CreateKeyResponse)
async def create_api_key(
    payload: CreateKeyRequest,
    authorization: str = Header(None, description="Supabase Auth JWT Token (Bearer <token>)")
):
    """
    Securely encrypts customer OpenAI keys and provisions a cb_live_... key.
    STRICT SECURITY: Requires valid Supabase user JWT.
    """
    # 1. Enforce Bearer Token
    if not authorization or not authorization.startswith("Bearer "):
        logger.warning("[AUTH BLOCKED] Attempt to create API key without Bearer token.")
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid Authorization header. Valid Supabase session required."
        )

    token = authorization.replace("Bearer ", "").strip()

    # 2. Cryptographically verify the token with Supabase Auth
    try:
        user_response = db_service.supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Session expired or invalid. Please re-authenticate.")
        
        # User ID extracted directly from cryptographically verified token (prevents spoofing)
        authenticated_user_id = user_response.user.id
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[AUTH ERROR] Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid session token.")

    # 3. Validate OpenAI key format
    cleaned_key = payload.upstream_key.strip()
    if not cleaned_key.startswith("sk-"):
        raise HTTPException(
            status_code=400,
            detail="Invalid OpenAI key format. Key must begin with 'sk-'."
        )

    # 4. Encrypt with AES-256 and store
    try:
        raw_proxy_key = db_service.generate_proxy_key(
            user_id=authenticated_user_id,
            raw_upstream_key=cleaned_key
        )
        logger.info(f"[KEY GENERATED] New proxy key generated for user: {authenticated_user_id}")
        return CreateKeyResponse(
            proxy_key=raw_proxy_key,
            key_prefix=raw_proxy_key[:12],
            message="Circuit Breaker key generated successfully."
        )
    except Exception as e:
        logger.error(f"[KEY ERROR] Failed to encrypt or save key: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate API key: {str(e)}"
        )