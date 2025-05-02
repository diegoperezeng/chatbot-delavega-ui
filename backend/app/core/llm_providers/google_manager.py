from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.llm_manager import BaseLLMManager, BaseLLMConfig
from pydantic import BaseModel
from typing import Optional

class GoogleConfig(BaseLLMConfig):
    """Configuração específica para Google Gemini"""
    api_key: str
    safety_settings: Optional[dict] = None
    generation_config: Optional[dict] = None

class GoogleManager(BaseLLMManager):
    """Gerenciador para modelos Google Gemini"""
    def __init__(self, config: GoogleConfig):
        super().__init__(config)
        self.llm = ChatGoogleGenerativeAI(
            model=config.model,
            temperature=config.temperature,
            max_output_tokens=config.max_tokens,
            streaming=config.streaming,
            google_api_key=config.api_key,
            safety_settings=config.safety_settings,
            generation_config=config.generation_config,
            convert_system_message_to_human=True
        ) 