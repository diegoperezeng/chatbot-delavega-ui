from enum import Enum

class MessageRole(str, Enum):
    """
    Define os possíveis papéis em uma conversa com o Claude.
    """
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system" 