from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class Message(BaseModel):
    id: str = Field(..., description="ID único da mensagem")
    role: str = Field(..., description="Papel do remetente (system, user, assistant)")
    content: str = Field(..., description="Conteúdo da mensagem")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

class MessageCreate(BaseModel):
    role: str
    content: str
    metadata: Optional[Dict[str, Any]] = None

class MessageUpdate(BaseModel):
    content: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class MessageResponse(BaseModel):
    message: Message

class MessagesResponse(BaseModel):
    messages: List[Message]
    total: int 