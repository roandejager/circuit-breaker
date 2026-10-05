from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.proxy import router as proxy_router
from app.api.keys import router as keys_router
from app.api.billing import router as billing_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url=None,
)

# Enable CORS for dashboard communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all endpoints
app.include_router(proxy_router)
app.include_router(keys_router)
app.include_router(billing_router)


# Accepts both GET and HEAD for uptime monitors
@app.api_route("/health", methods=["GET", "HEAD"])
async def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }


@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {
        "message": "AI Circuit Breaker Proxy is active.",
        "docs": "/docs" if settings.DEBUG else "disabled"
    }