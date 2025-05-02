from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class Message(BaseModel):
    role: str = Field(..., description="Papel do remetente (system, user, assistant)")
    content: str = Field(..., description="Conteúdo da mensagem")
    name: Optional[str] = Field(None, description="Nome opcional do remetente")
    function_call: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    messages: List[Message] = Field(..., description="Lista de mensagens do chat")
    model: Optional[str] = Field(None, description="Modelo de linguagem a ser usado")
    temperature: Optional[float] = Field(0.7, description="Temperatura para geração de texto")
    max_tokens: Optional[int] = Field(None, description="Número máximo de tokens na resposta")
    stream: Optional[bool] = Field(False, description="Se deve usar streaming na resposta")
    tools: Optional[List[Dict[str, Any]]] = Field(None, description="Lista de ferramentas disponíveis")

class ChatResponse(BaseModel):
    message: Message
    usage: Optional[Dict[str, int]] = None
    created: datetime = Field(default_factory=datetime.now)

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    status_code: int 