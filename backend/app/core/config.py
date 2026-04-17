from pydantic import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "FocusFlow"
    DEBUG: bool = True
    
    # Database (use SQLite for testing)
    DATABASE_URL: str = "sqlite:///./focusflow.db"
    REDIS_URL: str = ""  # Empty = use memory broker
    
    # Security
    SECRET_KEY: str = "dev-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OpenAI
    OPENAI_API_KEY: str = ""
    
    # Hugging Face
    HUGGINGFACE_API_KEY: str = ""
    
    # Email
    EMAIL_IMAP_SERVER: str = "imap.gmail.com"
    EMAIL_IMAP_PORT: int = 993
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
