from typing import Optional
from langchain_openai import ChatOpenAI
from app.core.llm_manager import BaseLLMManager, BaseLLMConfig
from pydantic import BaseModel

class OpenAIConfig(BaseLLMConfig):
    """Configuração específica para OpenAI"""
    api_key: str
    organization_id: Optional[str] = None

class OpenAIManager(BaseLLMManager):
    """Gerenciador para modelos OpenAI"""
    def __init__(self, config: OpenAIConfig):
        super().__init__(config)
        self.llm = ChatOpenAI(
            model_name=config.model,
            temperature=config.temperature,
            max_tokens=config.max_tokens,
            streaming=config.streaming,
            openai_api_key=config.api_key,
            openai_organization=config.organization_id
        ) 