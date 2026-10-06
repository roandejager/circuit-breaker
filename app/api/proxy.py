import json
import logging
import time
from typing import AsyncGenerator
from fastapi import APIRouter, Request, Response, BackgroundTasks
from fastapi.responses import JSONResponse, StreamingResponse
import httpx

from app.core.config import settings
from app.services.cost_engine import cost_engine
from app.services.loop_detector import loop_detector
from app.services.db import db_service

router = APIRouter()
logger = logging.getLogger("circuit_breaker")
logging.basicConfig(level=logging.INFO)


async def graceful_stop_stream(model: str, warning_message: str) -> AsyncGenerator[bytes, None]:
    """Yield a single OpenAI-compatible stop chunk followed by the SSE terminator."""
    created = int(time.time())
    chunk = {
        "id": f"chatcmpl-breaker-{created}",
        "object": "chat.completion.chunk",
        "created": created,
        "model": model,
        "choices": [{
            "index": 0,
            "delta": {"role": "assistant", "content": warning_message},
            "finish_reason": "stop",
        }],
    }
    yield f"data: {json.dumps(chunk)}\n\n".encode("utf-8")
    yield b"data: [DONE]\n\n"


async def sse_stream_generator(
    upstream_response: httpx.Response,
    client: httpx.AsyncClient,
    user_id: str,
    api_key_id: str,
    session_id: str,
    model: str,
    input_tokens: int,
) -> AsyncGenerator[bytes, None]:
    """
    Streams OpenAI SSE chunks directly to the client without buffering,
    accumulates output tokens, and logs the spend to Supabase upon stream end.
    """
    accumulated_content = []

    try:
        async for raw_chunk in upstream_response.aiter_bytes():
            yield raw_chunk

            # Parse SSE lines to accumulate text for spend calculation
            chunk_str = raw_chunk.decode("utf-8", errors="ignore")
            for line in chunk_str.splitlines():
                if line.startswith("data: ") and line.strip() != "data: [DONE]":
                    try:
                        data = json.loads(line[6:])
                        choices = data.get("choices", [])
                        if choices:
                            delta = choices[0].get("delta", {})
                            content = delta.get("content")
                            if content:
                                accumulated_content.append(content)
                    except json.JSONDecodeError:
                        continue
    finally:
        await upstream_response.aclose()
        await client.aclose()

        full_output_text = "".join(accumulated_content)
        output_tokens = cost_engine.count_tokens_from_text(full_output_text, model=model)
        total_cost = cost_engine.calculate_cost(model, input_tokens, output_tokens)

        # Log usage to Supabase
        db_service.log_request(
            user_id=user_id,
            api_key_id=api_key_id,
            session_id=session_id,
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_usd=total_cost,
            status_code=200,
            was_blocked=False
        )

        logger.info(
            f"[STREAM COMPLETED] User: {user_id[:8]} | Model: {model} | "
            f"In: {input_tokens} tok | Out: {output_tokens} tok | Cost: ${total_cost:.6f}"
        )


@router.post("/v1/chat/completions")
async def chat_completions_proxy(request: Request, background_tasks: BackgroundTasks):
    """
    Reverse proxy endpoint with Supabase authentication, loop-killing, and budget caps.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=401,
            content={"error": {"message": "Missing or malformed Authorization header. Expected 'Bearer cb_live_...'", "type": "auth_error", "code": "unauthorized"}}
        )

    raw_proxy_key = auth_header.replace("Bearer ", "").strip()

    # 1. AUTHENTICATE PROXY KEY VIA SUPABASE
    key_context = db_service.authenticate_proxy_key(raw_proxy_key)
    if not key_context:
        return JSONResponse(
            status_code=401,
            content={"error": {"message": "Invalid or revoked Circuit Breaker API key.", "type": "auth_error", "code": "invalid_api_key"}}
        )

    user_id = key_context["user_id"]
    api_key_id = key_context["api_key_id"]
    upstream_key = key_context["upstream_key"]
    hourly_limit = key_context["hourly_limit"]
    daily_limit = key_context["daily_limit"]

    session_id = request.headers.get("x-session-id", f"sess_{raw_proxy_key[-8:]}")

    try:
        body = await request.json()
    except Exception:
        return JSONResponse(
            status_code=400,
            content={"error": {"message": "Invalid JSON payload.", "type": "invalid_request_error", "code": "bad_request"}}
        )

    messages = body.get("messages", [])
    model = body.get("model", "gpt-4o")
    is_stream = body.get("stream", False)

    # 2. CIRCUIT BREAKER CHECK: Budget Caps (from PostgreSQL)
    hourly_spend, daily_spend = db_service.get_user_spend(user_id)
    if hourly_spend >= hourly_limit or daily_spend >= daily_limit:
        reason = (
            f"Hourly spend cap of ${hourly_limit:.2f} reached (Current: ${hourly_spend:.4f})"
            if hourly_spend >= hourly_limit
            else f"Daily spend cap of ${daily_limit:.2f} reached (Current: ${daily_spend:.4f})"
        )
        logger.warning(f"[CIRCUIT BREAKER] Spend limit breached for user {user_id}. {reason}")

        background_tasks.add_task(
            db_service.log_request,
            user_id=user_id,
            api_key_id=api_key_id,
            session_id=session_id,
            model=model,
            input_tokens=0,
            output_tokens=0,
            cost_usd=0.0,
            status_code=429,
            was_blocked=True,
            blocked_reason=reason
        )
        return JSONResponse(
            status_code=429,
            content={"error": {"message": reason, "type": "circuit_breaker_budget_exceeded", "code": "budget_limit_breached"}}
        )

    input_tokens = cost_engine.count_tokens_from_messages(messages, model=model)

    # 3. CIRCUIT BREAKER CHECK: Infinite Loop Detection
    is_loop, loop_reason = loop_detector.check_and_record(session_id=session_id, messages=messages)
    if is_loop:
        logger.warning(f"[CIRCUIT BREAKER] Infinite loop caught for user {user_id}. {loop_reason}")
        warning_message = (
            "⚡ [CIRCUIT BREAKER ALERT]: Autonomous agent execution halted. "
            f"{loop_reason} Stream terminated to prevent runaway API spend."
        )

        background_tasks.add_task(
            db_service.log_request,
            user_id=user_id,
            api_key_id=api_key_id,
            session_id=session_id,
            model=model,
            input_tokens=input_tokens,
            output_tokens=0,
            cost_usd=0.0,
            status_code=400,
            was_blocked=True,
            blocked_reason=loop_reason
        )

        if is_stream:
            return StreamingResponse(
                graceful_stop_stream(model, warning_message),
                media_type="text/event-stream",
                background=background_tasks,
            )

        created = int(time.time())
        return JSONResponse(
            status_code=200,
            content={
                "id": f"chatcmpl-breaker-{created}",
                "object": "chat.completion",
                "created": created,
                "model": model,
                "choices": [{
                    "index": 0,
                    "message": {"role": "assistant", "content": warning_message},
                    "finish_reason": "stop",
                }],
                "usage": {
                    "prompt_tokens": input_tokens,
                    "completion_tokens": 0,
                    "total_tokens": input_tokens,
                },
                "circuit_breaker": {"triggered": True, "reason": loop_reason},
            },
            background=background_tasks,
        )

    # 4. FORWARD TO UPSTREAM OPENAI USING DECRYPTED USER KEY
    upstream_url = f"{settings.UPSTREAM_OPENAI_BASE_URL.rstrip('/')}/chat/completions"
    client = httpx.AsyncClient(timeout=60.0)

    forward_headers = {
        "Authorization": f"Bearer {upstream_key}",
        "Content-Type": "application/json",
    }

    try:
        if is_stream:
            upstream_req = client.build_request("POST", upstream_url, json=body, headers=forward_headers)
            upstream_res = await client.send(upstream_req, stream=True)

            if upstream_res.status_code != 200:
                error_body = await upstream_res.aread()
                await upstream_res.aclose()
                await client.aclose()
                return Response(content=error_body, status_code=upstream_res.status_code, media_type="application/json")

            return StreamingResponse(
                sse_stream_generator(upstream_res, client, user_id, api_key_id, session_id, model, input_tokens),
                media_type="text/event-stream"
            )

        # Non-streaming forward
        upstream_res = await client.post(upstream_url, json=body, headers=forward_headers)
        await client.aclose()

        if upstream_res.status_code != 200:
            return Response(content=upstream_res.content, status_code=upstream_res.status_code, media_type="application/json")

        data = upstream_res.json()
        output_tokens = data.get("usage", {}).get("completion_tokens", 0)
        total_cost = cost_engine.calculate_cost(model, input_tokens, output_tokens)

        # Record spend in background to avoid blocking the response
        background_tasks.add_task(
            db_service.log_request,
            user_id=user_id,
            api_key_id=api_key_id,
            session_id=session_id,
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_usd=total_cost,
            status_code=200,
            was_blocked=False
        )

        logger.info(
            f"[REQUEST COMPLETED] User: {user_id[:8]} | Model: {model} | "
            f"In: {input_tokens} tok | Out: {output_tokens} tok | Cost: ${total_cost:.6f}"
        )

        return JSONResponse(status_code=200, content=data)

    except httpx.RequestError as exc:
        await client.aclose()
        logger.error(f"[UPSTREAM ERROR] Failed to connect to OpenAI: {exc}")
        return JSONResponse(
            status_code=502,
            content={"error": {"message": "Upstream OpenAI service timed out or unavailable.", "type": "bad_gateway", "code": "upstream_error"}}
        )