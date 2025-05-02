from fastapi import APIRouter, HTTPException, Depends, Body
from app.core.security import get_api_key
from app.core.config import get_settings
from .anthropic_schemas import ChatRequest, ChatResponse
from .anthropic_service import AnthropicChatService

router = APIRouter(
    prefix="/chat",
    tags=["Anthropic Chat"],
    description="Endpoints para interação com modelos Claude da Anthropic"
)

@router.post(
    "/",
    response_model=ChatResponse,
    summary="Gerar resposta usando Claude da Anthropic",
    description="""
    Endpoint para gerar respostas usando os modelos Claude da Anthropic.
    
    **Funcionalidades:**
    - Suporta todos os modelos Claude 3 (Opus, Sonnet e Haiku)
    - Processa múltiplas mensagens mantendo contexto da conversa
    - Permite configuração de system prompt
    - Suporta streaming de respostas
    
    **Exemplos de uso:**
    
    1. Pergunta simples:
    ```json
    {
        "messages": [
            {"role": "user", "content": "Explique o que é inteligência artificial"}
        ],
        "model": "claude-3-opus-20240229",
        "temperature": 0.7
    }
    ```
    
    2. Com system prompt:
    ```json
    {
        "messages": [
            {"role": "user", "content": "O que é machine learning?"}
        ],
        "model": "claude-3-opus-20240229",
        "temperature": 0.7,
        "system_prompt": "Você é um professor universitário explicando conceitos para alunos iniciantes"
    }
    ```
    
    3. Com histórico de conversa:
    ```json
    {
        "messages": [
            {"role": "user", "content": "O que é deep learning?"},
            {"role": "assistant", "content": "Deep Learning é uma subárea do Machine Learning..."},
            {"role": "user", "content": "Quais são suas aplicações práticas?"}
        ],
        "model": "claude-3-opus-20240229",
        "temperature": 0.7
    }
    ```
    """
)
async def chat(
    request: ChatRequest = Body(
        ...,
        description="Dados da requisição de chat",
        examples={
            "pergunta_simples": {
                "summary": "Pergunta simples",
                "description": "Exemplo de uma pergunta básica",
                "value": {
                    "messages": [
                        {"role": "user", "content": "Explique o que é inteligência artificial"}
                    ],
                    "model": "claude-3-opus-20240229",
                    "temperature": 0.7
                }
            },
            "com_system_prompt": {
                "summary": "Com system prompt",
                "description": "Exemplo usando system prompt para definir comportamento",
                "value": {
                    "messages": [
                        {"role": "user", "content": "O que é machine learning?"}
                    ],
                    "model": "claude-3-opus-20240229",
                    "temperature": 0.7,
                    "system_prompt": "Você é um professor universitário explicando conceitos para alunos iniciantes"
                }
            },
            "conversa_completa": {
                "summary": "Conversa completa",
                "description": "Exemplo com histórico de conversa",
                "value": {
                    "messages": [
                        {"role": "user", "content": "O que é deep learning?"},
                        {"role": "assistant", "content": "Deep Learning é uma subárea do Machine Learning..."},
                        {"role": "user", "content": "Quais são suas aplicações práticas?"}
                    ],
                    "model": "claude-3-opus-20240229",
                    "temperature": 0.7,
                    "max_tokens": 2000
                }
            }
        }
    ),
    api_key: str = Depends(get_api_key)
):
    try:
        settings = get_settings()
        return await AnthropicChatService.process_chat(request, api_key)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar chat: {str(e)}"
        ) 