from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.db import db_service

router = APIRouter(prefix="/v1/keys", tags=["keys"])


class CreateKeyRequest(BaseModel):
    user_id: str = Field(..., description="Supabase Auth User UUID")
    upstream_key: str = Field(..., min_length=10, description="Customer raw OpenAI API key")


class CreateKeyResponse(BaseModel):
    proxy_key: str
    key_prefix: str
    message: str


@router.post("/create", response_model=CreateKeyResponse)
async def create_api_key(payload: CreateKeyRequest):
    """
    Securely encrypts the customer's OpenAI key using AES-256
    and provisions a new cb_live_... Circuit Breaker proxy key.
    """
    if not payload.upstream_key.strip().startswith("sk-"):
        raise HTTPException(
            status_code=400,
            detail="Invalid OpenAI key format. Upstream key must begin with 'sk-'."
        )

    try:
        raw_proxy_key = db_service.generate_proxy_key(
            user_id=payload.user_id,
            raw_upstream_key=payload.upstream_key.strip()
        )
        return CreateKeyResponse(
            proxy_key=raw_proxy_key,
            key_prefix=raw_proxy_key[:12],
            message="Circuit Breaker key generated successfully."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate API key: {str(e)}"
        )