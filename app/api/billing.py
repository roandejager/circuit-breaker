import hmac
import hashlib
import json
import logging
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.services.db import db_service

router = APIRouter(prefix="/v1/billing", tags=["billing"])
logger = logging.getLogger("circuit_breaker_billing")


@router.post("/webhook")
async def polar_webhook(request: Request):
    """
    Receives Polar.sh subscription events and activates PRO tier in Supabase.
    """
    raw_body = await request.body()
    webhook_secret = getattr(settings, "POLAR_WEBHOOK_SECRET", "")

    # Optional signature check: verify if secret is configured in .env
    signature = request.headers.get("webhook-signature")
    if webhook_secret and signature:
        expected = hmac.new(webhook_secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, signature):
            logger.warning("[POLAR WEBHOOK] Invalid signature received.")
            raise HTTPException(status_code=401, detail="Invalid signature")

    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Malformed JSON")

    event_type = payload.get("type", "")
    data = payload.get("data", {})
    customer = data.get("customer", {})
    
    customer_email = customer.get("email") or data.get("customer_email")
    metadata = data.get("metadata", {})
    user_id = metadata.get("user_id")

    logger.info(f"[POLAR WEBHOOK] Event: {event_type} | Email: {customer_email} | User: {user_id}")

    # Subscriptions created or activated
    if event_type in ["subscription.created", "subscription.active", "order.created"]:
        query = db_service.supabase.table("profiles").update({
            "tier": "pro",
            "monthly_budget_cap_usd": 1000.00,
            "hourly_budget_cap_usd": 50.00,
            "daily_budget_cap_usd": 200.00,
        })
        
        if user_id:
            query = query.eq("id", user_id)
        elif customer_email:
            query = query.eq("email", customer_email)
        else:
            return JSONResponse(status_code=200, content={"status": "ignored_no_identifier"})

        query.execute()
        logger.info(f"[PRO ACTIVATED] Upgraded customer ({customer_email or user_id}) to PRO tier.")

    # Subscription cancelled or revoked
    elif event_type in ["subscription.canceled", "subscription.revoked"]:
        query = db_service.supabase.table("profiles").update({
            "tier": "free",
            "monthly_budget_cap_usd": 15.00,
            "hourly_budget_cap_usd": 2.00,
            "daily_budget_cap_usd": 10.00,
        })

        if user_id:
            query = query.eq("id", user_id)
        elif customer_email:
            query = query.eq("email", customer_email)
        else:
            return JSONResponse(status_code=200, content={"status": "ignored_no_identifier"})

        query.execute()
        logger.info(f"[PRO DEACTIVATED] Reverted customer ({customer_email or user_id}) to free tier.")

    return JSONResponse(status_code=200, content={"status": "received"})