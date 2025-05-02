from fastapi import APIRouter, HTTPException, Depends, Body
from app.core.security import get_api_key
from app.core.config import get_settings
from .google_schemas import ChatRequest, ChatResponse
from .google_service import GoogleChatService

router = APIRouter(
    prefix="/chat",
    tags=["Google Chat"],
    description="""
    Endpoints para interação com modelos Gemini da Google.
    
    O Gemini é a mais recente família de modelos de IA da Google, oferecendo:
    - Compreensão avançada de contexto
    - Respostas detalhadas e precisas
    - Suporte a múltiplos idiomas
    - Configurações de segurança personalizáveis
    """
)

@router.post(
    "/",
    response_model=ChatResponse,
    summary="Gerar resposta usando Gemini da Google",
    description="""
    Endpoint para gerar respostas usando os modelos Gemini da Google.
    
    **Funcionalidades Principais:**
    - Suporte ao modelo Gemini Pro
    - Processamento de múltiplas mensagens com contexto
    - Configurações de segurança personalizáveis
    - Controle fino da geração de texto
    - Suporte a streaming de respostas
    
    **Guia Rápido:**
    
    1. **Uso Básico:**
    ```json
    {
        "messages": [
            {"role": "user", "content": "O que é inteligência artificial?"}
        ],
        "model": "gemini-pro"
    }
    ```
    
    2. **Com Histórico:**
    ```json
    {
        "messages": [
            {"role": "user", "content": "O que é Python?"},
            {"role": "assistant", "content": "Python é uma linguagem de programação..."},
            {"role": "user", "content": "Quais são suas principais características?"}
        ]
    }
    ```
    
    3. **Com Segurança:**
    ```json
    {
        "messages": [
            {"role": "user", "content": "Me ajude com um projeto"}
        ],
        "safety_settings": [
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_HIGH"
            }
        ]
    }
    ```
    
    **Dicas de Uso:**
    - Use `temperature` baixo (0.3-0.5) para respostas mais precisas
    - Use `temperature` alto (0.7-0.9) para respostas mais criativas
    - Ative `stream: true` para melhor experiência do usuário
    - Use `safety_settings` para controlar conteúdo inadequado
    - Ajuste `generation_config` para controle fino da saída
    
    **Observações:**
    - Respostas são limitadas a 30k tokens
    - O modelo entende e responde em múltiplos idiomas
    - O contexto é mantido entre mensagens
    - Erros de API retornam código 500 com detalhes
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
                        {"role": "user", "content": "O que é inteligência artificial?"}
                    ],
                    "model": "gemini-pro",
                    "temperature": 0.7
                }
            },
            "com_historico": {
                "summary": "Com histórico",
                "description": "Exemplo com histórico de conversa",
                "value": {
                    "messages": [
                        {"role": "user", "content": "O que é Python?"},
                        {"role": "assistant", "content": "Python é uma linguagem de programação..."},
                        {"role": "user", "content": "Quais são suas principais características?"}
                    ],
                    "model": "gemini-pro",
                    "temperature": 0.7
                }
            },
            "configuracao_completa": {
                "summary": "Configuração completa",
                "description": "Exemplo com todas as configurações disponíveis",
                "value": {
                    "messages": [
                        {"role": "user", "content": "Gere um texto criativo sobre tecnologia"}
                    ],
                    "model": "gemini-pro",
                    "temperature": 0.9,
                    "max_tokens": 2000,
                    "stream": true,
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
    ),
    api_key: str = Depends(get_api_key)
):
    try:
        settings = get_settings()
        return await GoogleChatService.process_chat(request, api_key)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar chat: {str(e)}"
        ) 