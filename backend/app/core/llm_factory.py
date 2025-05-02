from enum import Enum
from typing import Optional, Union
from app.core.llm_providers.openai_manager import OpenAIManager, OpenAIConfig
from app.core.llm_providers.anthropic_manager import AnthropicManager, AnthropicConfig
from app.core.llm_providers.google_manager import GoogleManager, GoogleConfig
from app.core.llm_providers.llama_manager import LlamaManager, LlamaServerConfig
from app.core.llm_manager import BaseLLMManager

class ProviderType(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    AZURE = "azure"
    GOOGLE = "google"
    GROQ = "groq"
    MISTRAL = "mistral"
    OPENROUTER = "openrouter"
    LLAMA = "llama"

class LLMFactory:
    """Factory para criar instâncias de gerenciadores LLM"""
    
    @staticmethod
    def create_manager(
        provider: ProviderType,
        model: str,
        api_key: str = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        streaming: bool = True,
        **kwargs
    ) -> BaseLLMManager:
        """
        Cria uma instância do gerenciador LLM apropriado baseado no provedor
        
        Args:
            provider: Tipo do provedor LLM
            model: Nome do modelo a ser usado ou identificador do servidor
            api_key: Chave de API do provedor (não necessária para Llama)
            temperature: Temperatura para geração (0-1)
            max_tokens: Número máximo de tokens na resposta
            streaming: Se deve usar streaming
            **kwargs: Argumentos adicionais específicos do provedor
        
        Returns:
            Uma instância do gerenciador LLM apropriado
        """
        
        if provider == ProviderType.OPENAI:
            config = OpenAIConfig(
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                streaming=streaming,
                api_key=api_key,
                organization_id=kwargs.get('organization_id')
            )
            return OpenAIManager(config)
            
        elif provider == ProviderType.ANTHROPIC:
            config = AnthropicConfig(
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                streaming=streaming,
                api_key=api_key
            )
            return AnthropicManager(config)
            
        elif provider == ProviderType.GOOGLE:
            config = GoogleConfig(
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                streaming=streaming,
                api_key=api_key,
                safety_settings=kwargs.get('safety_settings'),
                generation_config=kwargs.get('generation_config')
            )
            return GoogleManager(config)
            
        elif provider == ProviderType.LLAMA:
            config = LlamaServerConfig(
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                streaming=streaming,
                server_url=kwargs.get('server_url'),
                request_timeout=kwargs.get('request_timeout', 120),
                n_ctx=kwargs.get('n_ctx', 2048),
                n_batch=kwargs.get('n_batch', 512),
                repeat_penalty=kwargs.get('repeat_penalty', 1.1),
                top_k=kwargs.get('top_k', 40),
                top_p=kwargs.get('top_p', 0.95),
                stop_words=kwargs.get('stop_words')
            )
            return LlamaManager(config)
            
        # TODO: Implementar outros provedores
            
        raise ValueError(f"Provedor não suportado: {provider}") 