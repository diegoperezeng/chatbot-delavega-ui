from fastapi import APIRouter
from app.schemas.keys import KeysResponse, ValidEnvKeys
from app.core.config import get_settings

router = APIRouter()

def is_using_environment_key(key: str) -> bool:
    settings = get_settings()
    return hasattr(settings, key) and getattr(settings, key) is not None

@router.get("/", response_model=KeysResponse)
async def get_keys():
    env_key_map = {
        "azure": ValidEnvKeys.AZURE_OPENAI_API_KEY,
        "openai": ValidEnvKeys.OPENAI_API_KEY,
        "google": ValidEnvKeys.GOOGLE_GEMINI_API_KEY,
        "anthropic": ValidEnvKeys.ANTHROPIC_API_KEY,
        "mistral": ValidEnvKeys.MISTRAL_API_KEY,
        "groq": ValidEnvKeys.GROQ_API_KEY,
        "perplexity": ValidEnvKeys.PERPLEXITY_API_KEY,
        "openrouter": ValidEnvKeys.OPENROUTER_API_KEY,
        "openai_organization_id": ValidEnvKeys.OPENAI_ORGANIZATION_ID,
        "azure_openai_endpoint": ValidEnvKeys.AZURE_OPENAI_ENDPOINT,
        "azure_gpt_35_turbo_name": ValidEnvKeys.AZURE_GPT_35_TURBO_NAME,
        "azure_gpt_45_vision_name": ValidEnvKeys.AZURE_GPT_45_VISION_NAME,
        "azure_gpt_45_turbo_name": ValidEnvKeys.AZURE_GPT_45_TURBO_NAME,
        "azure_embeddings_name": ValidEnvKeys.AZURE_EMBEDDINGS_NAME
    }

    is_using_env_key_map = {
        provider: is_using_environment_key(key)
        for provider, key in env_key_map.items()
    }

    return KeysResponse(is_using_env_key_map=is_using_env_key_map) 