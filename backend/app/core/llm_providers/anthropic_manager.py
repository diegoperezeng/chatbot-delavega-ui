from langchain_anthropic import ChatAnthropic
from app.core.llm_manager import BaseLLMManager, BaseLLMConfig
from pydantic import BaseModel

class AnthropicConfig(BaseLLMConfig):
    """Configuração específica para Anthropic"""
    api_key: str

class AnthropicManager(BaseLLMManager):
    """Gerenciador para modelos Anthropic"""
    def __init__(self, config: AnthropicConfig):
        super().__init__(config)
        self.llm = ChatAnthropic(
            model_name=config.model,
            temperature=config.temperature,
            max_tokens=config.max_tokens,
            streaming=config.streaming,
            anthropic_api_key=config.api_key
        ) 