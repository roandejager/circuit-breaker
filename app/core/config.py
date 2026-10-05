from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Proxy Metadata
    PROJECT_NAME: str = "AI Circuit Breaker Proxy"
    VERSION: str = "0.1.0"
    DEBUG: bool = True

    # Upstream Provider Defaults
    UPSTREAM_OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    
    # Circuit Breaker Default Rules (USD)
    DEFAULT_MAX_HOURLY_BUDGET_USD: float = 5.00
    DEFAULT_MAX_DAILY_BUDGET_USD: float = 20.00
    
    # Infinite-Loop Detection Rules
    LOOP_DETECTION_WINDOW_SIZE: int = 5
    LOOP_DETECTION_SIMILARITY_THRESHOLD: int = 3

    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    
    # Master Key for Encrypting Upstream Customer Keys (Fernet 32-byte base64)
    MASTER_ENCRYPTION_KEY: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()