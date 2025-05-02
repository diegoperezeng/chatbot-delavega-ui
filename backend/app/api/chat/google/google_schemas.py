from pydantic import BaseModel, Field
from typing import List, Optional
from .google_models import MessageRole

class ChatMessage(BaseModel):
    """
    Representa uma mensagem na conversa.
    """
    role: MessageRole = Field(
        ...,
        description="Papel do remetente da mensagem (user, assistant ou system)",
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

class SafetySettings(BaseModel):
    """
    Configurações de segurança do modelo Gemini.
    
    Permite controlar o comportamento do modelo em relação a diferentes categorias de conteúdo.
    """
    category: str = Field(
        ...,
        description="""
        Categoria de conteúdo a ser controlada:
        - HARM_CATEGORY_HARASSMENT: Conteúdo de assédio
        - HARM_CATEGORY_HATE_SPEECH: Discurso de ódio
        - HARM_CATEGORY_SEXUALLY_EXPLICIT: Conteúdo sexual explícito
        - HARM_CATEGORY_DANGEROUS_CONTENT: Conteúdo perigoso
        """,
        example="HARM_CATEGORY_HARASSMENT"
    )
    threshold: str = Field(
        ...,
        description="""
        Nível de tolerância para a categoria:
        - BLOCK_NONE: Permite todo conteúdo
        - BLOCK_LOW: Bloqueia conteúdo extremo
        - BLOCK_MEDIUM: Bloqueia conteúdo moderado
        - BLOCK_HIGH: Bloqueia qualquer conteúdo suspeito
        """,
        example="BLOCK_HIGH"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_HIGH"
            }
        }

class GenerationConfig(BaseModel):
    """
    Configurações avançadas para geração de texto.
    """
    candidate_count: Optional[int] = Field(
        default=1,
        ge=1,
        le=8,
        description="Número de respostas alternativas a gerar (1-8)",
        example=1
    )
    stop_sequences: Optional[List[str]] = Field(
        default=None,
        description="""
        Lista de sequências que fazem o modelo parar de gerar.
        Útil para controlar onde a resposta deve terminar.
        """,
        example=["###", "Fim:"]
    )
    top_k: Optional[int] = Field(
        default=40,
        ge=1,
        description="""
        Número de tokens mais prováveis a considerar para cada próximo token.
        Valores maiores = mais diversidade, valores menores = mais foco.
        """,
        example=40
    )
    top_p: Optional[float] = Field(
        default=0.95,
        ge=0,
        le=1,
        description="""
        Probabilidade cumulativa para amostragem núcleo.
        0.1 = muito focado, 1.0 = muito diverso.
        """,
        example=0.95
    )

    class Config:
        json_schema_extra = {
            "example": {
                "candidate_count": 1,
                "stop_sequences": ["###", "Fim:"],
                "top_k": 40,
                "top_p": 0.95
            }
        }

class ChatRequest(BaseModel):
    """
    Requisição para o endpoint de chat do Gemini.
    """
    messages: List[ChatMessage] = Field(
        ...,
        description="Lista de mensagens da conversa. A última mensagem deve ser do usuário",
        min_items=1
    )
    model: str = Field(
        default="gemini-pro",
        description="""
        Modelo Gemini a ser usado:
        - gemini-pro: Modelo mais capaz, ideal para tarefas complexas
        - gemini-pro-vision: Modelo com suporte a imagens (em breve)
        """,
        example="gemini-pro"
    )
    temperature: float = Field(
        default=0.7,
        ge=0,
        le=1,
        description="""
        Controla a aleatoriedade das respostas:
        - 0.0: Muito focado/determinístico
        - 0.7: Equilibrado (recomendado)
        - 1.0: Muito criativo/aleatório
        """,
        example=0.7
    )
    max_tokens: Optional[int] = Field(
        default=None,
        ge=1,
        description="""
        Número máximo de tokens na resposta.
        1 token ≈ 4 caracteres em português.
        Exemplo: 2000 tokens ≈ 8000 caracteres.
        """,
        example=1000
    )
    stream: bool = Field(
        default=True,
        description="""
        Se verdadeiro, retorna a resposta token por token.
        Recomendado para melhor experiência do usuário.
        """,
        example=True
    )
    safety_settings: Optional[List[SafetySettings]] = Field(
        default=None,
        description="Configurações de segurança para controlar o conteúdo gerado"
    )
    generation_config: Optional[GenerationConfig] = Field(
        default=None,
        description="Configurações avançadas para controle fino da geração"
    )

    class Config:
        json_schema_extra = {
            "examples": {
                "simples": {
                    "summary": "Pergunta simples",
                    "description": "Exemplo básico de uso do chat",
                    "value": {
                        "messages": [
                            {
                                "role": "user",
                                "content": "Explique o que é inteligência artificial em termos simples"
                            }
                        ],
                        "model": "gemini-pro",
                        "temperature": 0.7
                    }
                },
                "com_historico": {
                    "summary": "Com histórico de conversa",
                    "description": "Exemplo mantendo contexto da conversa",
                    "value": {
                        "messages": [
                            {
                                "role": "user",
                                "content": "O que é machine learning?"
                            },
                            {
                                "role": "assistant",
                                "content": "Machine Learning é uma técnica que permite aos computadores aprenderem com exemplos..."
                            },
                            {
                                "role": "user",
                                "content": "Quais são suas aplicações práticas?"
                            }
                        ],
                        "model": "gemini-pro",
                        "temperature": 0.7
                    }
                },
                "configuracao_avancada": {
                    "summary": "Com configurações avançadas",
                    "description": "Exemplo com todas as configurações disponíveis",
                    "value": {
                        "messages": [
                            {
                                "role": "user",
                                "content": "Gere um texto criativo sobre o futuro da tecnologia"
                            }
                        ],
                        "model": "gemini-pro",
                        "temperature": 0.9,
                        "max_tokens": 2000,
                        "safety_settings": [
                            {
                                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                                "threshold": "BLOCK_HIGH"
                            }
                        ],
                        "generation_config": {
                            "candidate_count": 1,
                            "stop_sequences": ["###"],
                            "top_k": 40,
                            "top_p": 0.95
                        }
                    }
                }
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
                    "content": "Inteligência Artificial (IA) é como um programa de computador que pode aprender e tomar decisões parecidas com as dos humanos. Por exemplo, quando você usa o reconhecimento facial para desbloquear seu celular, está usando IA. É como ensinar um computador a 'pensar', mas de uma forma diferente dos humanos."
                }
            }
        } 