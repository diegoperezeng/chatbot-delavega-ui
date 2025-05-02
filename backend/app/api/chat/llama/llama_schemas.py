from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional
from .llama_models import MessageRole

class ChatMessage(BaseModel):
    """
    Representa uma mensagem na conversa.
    """
    role: MessageRole = Field(
        ...,
        description="Papel do remetente da mensagem",
        example="user"
    )
    content: str = Field(
        ...,
        description="Conteúdo da mensagem",
        example="Qual é a capital do Brasil?",
        min_length=1
    )

    class Config:
        json_schema_extra = {
            "example": {
                "role": "user",
                "content": "Qual é a capital do Brasil?"
            }
        }

class LlamaServerConfig(BaseModel):
    """
    Configurações avançadas para o servidor Llama.
    """
    request_timeout: Optional[int] = Field(
        default=120,
        ge=1,
        description="Tempo máximo em segundos para aguardar resposta do servidor",
        example=120
    )
    n_ctx: Optional[int] = Field(
        default=2048,
        ge=512,
        description="Tamanho do contexto em tokens. Aumentar permite processar mensagens mais longas",
        example=2048
    )
    n_batch: Optional[int] = Field(
        default=512,
        ge=1,
        description="Tamanho do batch para processamento. Valores maiores podem ser mais rápidos, mas usam mais memória",
        example=512
    )
    repeat_penalty: Optional[float] = Field(
        default=1.1,
        ge=0.0,
        description="Penalidade para repetição de tokens. Valores maiores reduzem repetições",
        example=1.1
    )
    top_k: Optional[int] = Field(
        default=40,
        ge=1,
        description="Número de tokens mais prováveis a considerar para amostragem",
        example=40
    )
    top_p: Optional[float] = Field(
        default=0.95,
        ge=0.0,
        le=1.0,
        description="Probabilidade cumulativa para amostragem núcleo. Controla a diversidade das respostas",
        example=0.95
    )
    stop_words: Optional[List[str]] = Field(
        default=None,
        description="Lista de palavras que fazem o modelo parar de gerar",
        example=["###", "Fim"]
    )

class ChatRequest(BaseModel):
    """
    Requisição para o endpoint de chat.
    """
    messages: List[ChatMessage] = Field(
        ...,
        description="Lista de mensagens da conversa. A última mensagem deve ser do usuário",
        min_items=1
    )
    server_url: HttpUrl = Field(
        ...,
        description="URL do servidor Llama (ex: http://localhost:8000)",
        example="http://localhost:8000"
    )
    temperature: float = Field(
        default=0.7,
        ge=0,
        le=1,
        description="Controla a aleatoriedade das respostas. 0 = determinístico, 1 = muito aleatório",
        example=0.7
    )
    max_tokens: Optional[int] = Field(
        default=None,
        ge=1,
        description="Número máximo de tokens na resposta",
        example=1000
    )
    stream: bool = Field(
        default=True,
        description="Se verdadeiro, retorna a resposta token por token",
        example=True
    )
    server_config: Optional[LlamaServerConfig] = Field(
        default=None,
        description="Configurações avançadas para o servidor Llama"
    )

class ChatResponse(BaseModel):
    """
    Resposta do chat.
    """
    message: ChatMessage = Field(
        ...,
        description="Mensagem gerada pelo modelo"
    ) 