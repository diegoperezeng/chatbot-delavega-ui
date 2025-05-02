from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from .openai_models import MessageRole

class FunctionCall(BaseModel):
    """
    Representa uma chamada de função pelo modelo.
    """
    name: str = Field(
        ...,
        description="Nome da função a ser chamada",
        example="get_weather"
    )
    arguments: str = Field(
        ...,
        description="Argumentos da função em formato JSON string",
        example='{"location": "São Paulo", "unit": "celsius"}'
    )

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
        example="Qual é a previsão do tempo para hoje?",
        min_length=1
    )
    name: Optional[str] = Field(
        None,
        description="Nome da função ou assistente que enviou a mensagem",
        example="weather_assistant"
    )
    function_call: Optional[FunctionCall] = None

    class Config:
        json_schema_extra = {
            "example": {
                "role": "user",
                "content": "Qual é a previsão do tempo para hoje em São Paulo?"
            }
        }

class FunctionDefinition(BaseModel):
    """
    Define uma função que o modelo pode chamar.
    """
    name: str = Field(
        ...,
        description="Nome da função",
        example="get_weather"
    )
    description: str = Field(
        ...,
        description="Descrição do que a função faz",
        example="Obtém a previsão do tempo para uma localização específica"
    )
    parameters: Dict[str, Any] = Field(
        ...,
        description="Esquema JSON dos parâmetros da função",
        example={
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "Cidade para obter a previsão"
                },
                "unit": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "description": "Unidade de temperatura"
                }
            },
            "required": ["location"]
        }
    )

class ChatRequest(BaseModel):
    """
    Requisição para o endpoint de chat da OpenAI.
    """
    messages: List[ChatMessage] = Field(
        ...,
        description="Lista de mensagens da conversa. A última mensagem deve ser do usuário",
        min_items=1
    )
    model: str = Field(
        default="gpt-4-turbo-preview",
        description="""
        Modelo GPT a ser usado:
        - gpt-4-turbo-preview (mais recente e capaz)
        - gpt-4 (mais preciso)
        - gpt-3.5-turbo (mais rápido e econômico)
        """,
        example="gpt-4-turbo-preview"
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
    functions: Optional[List[FunctionDefinition]] = Field(
        default=None,
        description="Lista de funções que o modelo pode chamar",
        example=[{
            "name": "get_weather",
            "description": "Obtém a previsão do tempo",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "Cidade para obter a previsão"
                    }
                },
                "required": ["location"]
            }
        }]
    )

    class Config:
        json_schema_extra = {
            "example": {
                "messages": [
                    {
                        "role": "system",
                        "content": "Você é um assistente especializado em previsão do tempo."
                    },
                    {
                        "role": "user",
                        "content": "Qual é a previsão do tempo para São Paulo hoje?"
                    }
                ],
                "model": "gpt-4-turbo-preview",
                "temperature": 0.7,
                "max_tokens": 1000,
                "stream": True
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
                    "content": "Deixe-me verificar a previsão do tempo para São Paulo.",
                    "function_call": {
                        "name": "get_weather",
                        "arguments": '{"location": "São Paulo"}'
                    }
                }
            }
        } 