from app.core.llm_factory import LLMFactory, ProviderType
from .llama_schemas import ChatRequest, ChatMessage, ChatResponse
from typing import List

class LlamaChatService:
    """
    Serviço responsável pela lógica de negócios do chat com Llama.
    """
    @staticmethod
    async def process_chat(request: ChatRequest) -> ChatResponse:
        """
        Processa uma requisição de chat usando o servidor Llama.
        """
        # Prepara as configurações específicas do servidor
        server_kwargs = {}
        if request.server_config:
            server_kwargs = request.server_config.dict(exclude_none=True)
        
        # Adiciona a URL do servidor aos kwargs
        server_kwargs["server_url"] = request.server_url
        
        # Cria o gerenciador usando a factory
        manager = LLMFactory.create_manager(
            provider=ProviderType.LLAMA,
            model="server",  # Não é necessário especificar o modelo, pois está no servidor
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            streaming=request.stream,
            **server_kwargs
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
        
        response = await manager.generate_response(last_message)
        
        return ChatResponse(
            message=ChatMessage(
                role="assistant",
                content=response
            )
        ) 