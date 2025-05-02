from typing import Dict, Any, Optional
from app.core.llm_factory import LLMFactory, ProviderType
from .google_schemas import ChatRequest, ChatMessage, ChatResponse

class GoogleChatService:
    """
    Serviço responsável pela lógica de negócios do chat com Gemini.
    """
    
    @staticmethod
    async def process_chat(
        request: ChatRequest,
        api_key: str,
        organization_id: Optional[str] = None
    ) -> ChatResponse:
        """
        Processa uma requisição de chat usando o modelo Gemini.
        
        Args:
            request: Dados da requisição
            api_key: Chave de API do Google
            organization_id: ID da organização (opcional)
            
        Returns:
            ChatResponse com a mensagem gerada pelo modelo
        """
        # Converte as configurações para o formato esperado pelo Google
        safety_settings = GoogleChatService._prepare_safety_settings(request)
        generation_config = GoogleChatService._prepare_generation_config(request)
        
        # Cria o gerenciador usando a factory
        manager = LLMFactory.create_manager(
            provider=ProviderType.GOOGLE,
            model=request.model,
            api_key=api_key,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            streaming=request.stream,
            safety_settings=safety_settings,
            generation_config=generation_config
        )
        
        # Processa o histórico de mensagens
        GoogleChatService._process_message_history(manager, request.messages)
        
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
    def _prepare_safety_settings(request: ChatRequest) -> Optional[Dict[str, str]]:
        """
        Prepara as configurações de segurança para o formato esperado pelo Google.
        """
        if not request.safety_settings:
            return None
            
        return {
            setting.category: setting.threshold
            for setting in request.safety_settings
        }
    
    @staticmethod
    def _prepare_generation_config(request: ChatRequest) -> Optional[Dict[str, Any]]:
        """
        Prepara as configurações de geração para o formato esperado pelo Google.
        """
        if not request.generation_config:
            return None
            
        return request.generation_config.dict(exclude_none=True)
    
    @staticmethod
    def _process_message_history(manager: Any, messages: list[ChatMessage]) -> None:
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