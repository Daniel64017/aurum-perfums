import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Aurum Parfums API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "aurum_secret_key_luxury_perfumes_2026_super_secure_hash")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 dias
    
    # Banco de Dados
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./aurum_parfums.db")
    
    # Stripe API Keys (Modo de Teste) - Lidas de variáveis de ambiente (.env em dev, Render em prod)
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_PUBLISHABLE_KEY: str = os.getenv("STRIPE_PUBLISHABLE_KEY", "")

    # Uploads (Armazenados fora da pasta do código Python para evitar auto-reload do uvicorn)
    UPLOAD_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "static_uploads"))
    PRODUCT_UPLOAD_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "static_uploads", "products"))

    class Config:
        case_sensitive = True

settings = Settings()

# Garantir que o diretório de upload exista
os.makedirs(settings.PRODUCT_UPLOAD_DIR, exist_ok=True)
