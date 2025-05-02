from typing import Optional
from app.core.llm_factory import LLMFactory, ProviderType
from .anthropic_schemas import ChatRequest, ChatMessage, ChatResponse

class AnthropicChatService:
    """
    Serviço responsável pela lógica de negócios do chat com Claude.
    """
    
    @staticmethod
    async def process_chat(
        request: ChatRequest,
        api_key: str,
        organization_id: Optional[str] = None
    ) -> ChatResponse:
        """
        Processa uma requisição de chat usando o modelo Claude.
        
        Args:
            request: Dados da requisição
            api_key: Chave de API da Anthropic
            organization_id: ID da organização (opcional)
            
        Returns:
            ChatResponse com a mensagem gerada pelo modelo
        """
        # Cria o gerenciador usando a factory
        manager = LLMFactory.create_manager(
            provider=ProviderType.ANTHROPIC,
            model=request.model,
            api_key=api_key,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            streaming=request.stream
        )
        
        # Configura o system prompt se fornecido
        AnthropicChatService._setup_system_prompt(manager, request.system_prompt)
        
        # Processa o histórico de mensagens
        AnthropicChatService._process_message_history(manager, request.messages)
        
        # Obtém a última mensagem do usuário
        last_message = request.messages[-1].content
        
        # Gera a resposta
        response = await manager.generate_response(last_message)
        
        return ChatResponse(
            message=ChatMessage(
                role="assistant",
                content=response
            )
        )
    
    @staticmethod
    def _setup_system_prompt(manager: any, system_prompt: Optional[str]) -> None:
        """
        Configura o system prompt no gerenciador se fornecido.
        """
        if system_prompt:
            manager.memory.chat_memory.system_message = system_prompt
    
    @staticmethod
    def _process_message_history(manager: any, messages: list[ChatMessage]) -> None:
        """
        Processa o histórico de mensagens e adiciona à memória do gerenciador.
        """
        for msg in messages[:-1]:
            if msg.role == "user":
                manager.memory.save_context(
                    {"input": msg.content},
                    {"output": ""}  # Será preenchido pela próxima mensagem
                )
            elif msg.role == "assistant":
                manager.memory.chat_memory.messages[-1].output = msg.content 