from pydantic import BaseModel, Field
from typing import List, Optional
from .anthropic_models import MessageRole

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
        example="Explique o que é inteligência artificial em termos simples",
        min_length=1
    )

    class Config:
        json_schema_extra = {
            "example": {
                "role": "user",
                "content": "Explique o que é inteligência artificial em termos simples"
            }
        }

class ChatRequest(BaseModel):
    """
    Requisição para o endpoint de chat do Claude.
    """
    messages: List[ChatMessage] = Field(
        ...,
        description="Lista de mensagens da conversa. A última mensagem deve ser do usuário",
        min_items=1
    )
    model: str = Field(
        default="claude-3-opus-20240229",
        description="""
        Modelo Claude a ser usado:
        - claude-3-opus-20240229 (mais capaz)
        - claude-3-sonnet-20240229 (equilibrado)
        - claude-3-haiku-20240229 (mais rápido)
        """,
        example="claude-3-opus-20240229"
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
    system_prompt: Optional[str] = Field(
        default=None,
        description="Instruções de sistema para definir o comportamento do modelo",
        example="Você é um assistente especializado em explicar conceitos complexos de forma simples"
    )
    metadata: Optional[dict] = Field(
        default=None,
        description="Metadados adicionais para a conversa",
        example={"user_id": "123", "session_id": "abc"}
    )

    class Config:
        json_schema_extra = {
            "example": {
                "messages": [
                    {
                        "role": "user",
                        "content": "Explique o que é inteligência artificial"
                    }
                ],
                "model": "claude-3-opus-20240229",
                "temperature": 0.7
            }
        }

class ChatResponse(BaseModel):
    """
    Resposta do chat.
    """
    message: ChatMessage = Field(
        ...,
        description="Mensagem gerada pelo modelo"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "message": {
                    "role": "assistant",
                    "content": "Inteligência Artificial (IA) é como um programa de computador que pode aprender e tomar decisões parecidas com as dos humanos. Imagine um programa que pode reconhecer rostos em fotos, conversar com pessoas ou até mesmo jogar xadrez. É como ensinar um computador a 'pensar' e resolver problemas, mas de uma forma diferente dos humanos."
                }
            }
        } 