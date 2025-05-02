from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader
from app.core.config import get_settings, Settings
from typing import Optional

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def get_api_key(
    api_key: Optional[str] = Depends(api_key_header),
    settings: Settings = Depends(get_settings)
) -> str:
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key não fornecida"
        )
    return api_key

def verify_api_key(api_key: str, provider: str) -> bool:
    settings = get_settings()
    provider_keys = {
        "OpenAI": settings.OPENAI_API_KEY,
        "Anthropic": settings.ANTHROPIC_API_KEY,
        "Azure": settings.AZURE_API_KEY,
        "Google": settings.GOOGLE_API_KEY,
        "Groq": settings.GROQ_API_KEY,
        "Mistral": settings.MISTRAL_API_KEY,
        "OpenRouter": settings.OPENROUTER_API_KEY
    }
    
    if provider not in provider_keys:
        raise ValueError(f"Provedor {provider} não suportado")
        
    return api_key == provider_keys[provider] 