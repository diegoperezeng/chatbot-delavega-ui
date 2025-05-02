from typing import Optional, Dict, Any
from app.core.llm_manager import BaseLLMManager, BaseLLMConfig
from pydantic import BaseModel, Field, HttpUrl
import httpx
from langchain.llms.base import LLM
from langchain.callbacks.manager import CallbackManager
import json

class LlamaServerConfig(BaseLLMConfig):
    """Configuração específica para servidor Llama"""
    server_url: HttpUrl  # URL do servidor Llama
    request_timeout: int = Field(default=120, ge=1)  # Timeout em segundos
    n_ctx: int = Field(default=2048, ge=512)  # Tamanho do contexto
    n_batch: int = Field(default=512, ge=1)  # Tamanho do batch
    repeat_penalty: float = Field(default=1.1, ge=0.0)  # Penalidade para repetição
    top_k: int = Field(default=40, ge=1)  # Top K tokens para amostragem
    top_p: float = Field(default=0.95, ge=0.0, le=1.0)  # Top P para amostragem
    stop_words: Optional[list[str]] = None  # Palavras para parar a geração

class LlamaServerLLM(LLM):
    """Implementação personalizada do LLM para servidor Llama"""
    
    server_url: str
    request_timeout: int
    temperature: float
    max_tokens: Optional[int]
    streaming: bool
    n_ctx: int
    n_batch: int
    repeat_penalty: float
    top_k: int
    top_p: float
    stop_words: Optional[list[str]]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.client = httpx.AsyncClient(timeout=self.request_timeout)
        
    async def _call(self, prompt: str, stop=None) -> str:
        """Faz a chamada para o servidor Llama"""
        try:
            payload = {
                "prompt": prompt,
                "temperature": self.temperature,
                "max_tokens": self.max_tokens,
                "stream": self.streaming,
                "n_ctx": self.n_ctx,
                "n_batch": self.n_batch,
                "repeat_penalty": self.repeat_penalty,
                "top_k": self.top_k,
                "top_p": self.top_p,
                "stop": stop or self.stop_words
            }
            
            response = await self.client.post(
                f"{self.server_url}/v1/completions",
                json=payload
            )
            response.raise_for_status()
            
            result = response.json()
            return result["choices"][0]["text"]
            
        except Exception as e:
            raise Exception(f"Erro ao chamar servidor Llama: {str(e)}")
            
    @property
    def _llm_type(self) -> str:
        return "llama_server"

class LlamaManager(BaseLLMManager):
    """Gerenciador para servidor Llama"""
    def __init__(self, config: LlamaServerConfig):
        super().__init__(config)
        
        self.llm = LlamaServerLLM(
            server_url=str(config.server_url),
            request_timeout=config.request_timeout,
            temperature=config.temperature,
            max_tokens=config.max_tokens,
            streaming=config.streaming,
            n_ctx=config.n_ctx,
            n_batch=config.n_batch,
            repeat_penalty=config.repeat_penalty,
            top_k=config.top_k,
            top_p=config.top_p,
            stop_words=config.stop_words
        )
        
    async def generate_response(self, message: str) -> str:
        """
        Sobrescreve o método de geração de resposta para adicionar formatação específica do Llama
        """
        if not self.chain:
            self.chain = self._create_chain()
            
        # Formata a mensagem no estilo que o Llama espera
        formatted_message = f"### Instrução: {message}\n\n### Resposta:"
        
        response = await self.chain.arun(input=formatted_message)
        return response.strip() 