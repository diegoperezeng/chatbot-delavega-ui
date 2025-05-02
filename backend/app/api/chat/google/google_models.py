from enum import Enum

class MessageRole(str, Enum):
    """
    Define os possíveis papéis em uma conversa.
    """
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system" 