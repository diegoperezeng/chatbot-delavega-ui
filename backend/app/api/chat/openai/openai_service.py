from app.core.llm_factory import LLMFactory, ProviderType
from app.core.config import get_settings
from .openai_schemas import ChatRequest, ChatMessage, ChatResponse

class OpenAIChatService:
    """
    Serviço responsável pela lógica de negócios do chat com OpenAI.
    """
    @staticmethod
    async def process_chat(request: ChatRequest, api_key: str) -> ChatResponse:
        """
        Processa uma requisição de chat usando os modelos da OpenAI.
        """
        settings = get_settings()
        
        # Cria o gerenciador usando a factory
        manager = LLMFactory.create_manager(
            provider=ProviderType.OPENAI,
            model=request.model,
            api_key=api_key,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            streaming=request.stream,
            organization_id=settings.OPENAI_ORGANIZATION_ID
        )
        
        # Obtém a última mensagem do usuário
        last_message = request.messages[-1].content
        
        # Adiciona mensagens anteriores à memória
        for msg in request.messages[:-1]:
            if msg.role == "user":
                manager.memory.save_context(
                    {"input": msg.content},
                    {"output": ""}  # Será preenchido pela próxima mensagem
                )
            elif msg.role == "assistant":
                manager.memory.chat_memory.messages[-1].output = msg.content
            elif msg.role == "system":
                manager.memory.chat_memory.system_message = msg.content
        
        response = await manager.generate_response(last_message)
        
        return ChatResponse(
            message=ChatMessage(
                role="assistant",
                content=response
            )
        ) 