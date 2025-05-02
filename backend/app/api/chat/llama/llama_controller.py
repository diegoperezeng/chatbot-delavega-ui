from fastapi import APIRouter, HTTPException, Body
from .llama_schemas import ChatRequest, ChatResponse
from .llama_service import LlamaChatService

router = APIRouter(
    prefix="/chat",
    tags=["Llama Chat"],
    description="Endpoints para interação com servidor Llama em execução remota"
)

@router.post(
    "/",
    response_model=ChatResponse,
    summary="Gerar resposta usando servidor Llama",
    description="""
    Endpoint para gerar respostas usando um servidor Llama remoto.
    
    **Funcionalidades:**
    - Processa múltiplas mensagens mantendo contexto da conversa
    - Suporta streaming de respostas
    - Permite configuração detalhada do comportamento do modelo
    
    **Exemplos de uso:**
    
    1. Pergunta simples:
    ```json
    {
        "messages": [
            {"role": "user", "content": "Qual é a capital do Brasil?"}
        ],
        "server_url": "http://localhost:8000",
        "temperature": 0.7
    }
    ```
    
    2. Com histórico de conversa:
    ```json
    {
        "messages": [
            {"role": "user", "content": "Quem foi Santos Dumont?"},
            {"role": "assistant", "content": "Santos Dumont foi um inventor brasileiro..."},
            {"role": "user", "content": "Qual sua principal invenção?"}
        ],
        "server_url": "http://localhost:8000",
        "temperature": 0.7
    }
    ```
    
    3. Com configurações avançadas:
    ```json
    {
        "messages": [
            {"role": "user", "content": "Escreva um poema sobre programação"}
        ],
        "server_url": "http://localhost:8000",
        "temperature": 0.9,
        "max_tokens": 2000,
        "server_config": {
            "n_ctx": 4096,
            "top_p": 0.95,
            "repeat_penalty": 1.2,
            "stop_words": ["###"]
        }
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
                        {"role": "user", "content": "Qual é a capital do Brasil?"}
                    ],
                    "server_url": "http://localhost:8000",
                    "temperature": 0.7
                }
            },
            "com_historico": {
                "summary": "Com histórico",
                "description": "Exemplo com histórico de conversa",
                "value": {
                    "messages": [
                        {"role": "user", "content": "Quem foi Santos Dumont?"},
                        {"role": "assistant", "content": "Santos Dumont foi um inventor brasileiro..."},
                        {"role": "user", "content": "Qual sua principal invenção?"}
                    ],
                    "server_url": "http://localhost:8000",
                    "temperature": 0.7
                }
            },
            "configuracao_avancada": {
                "summary": "Configuração avançada",
                "description": "Exemplo com configurações avançadas do modelo",
                "value": {
                    "messages": [
                        {"role": "user", "content": "Escreva um poema sobre programação"}
                    ],
                    "server_url": "http://localhost:8000",
                    "temperature": 0.9,
                    "max_tokens": 2000,
                    "server_config": {
                        "n_ctx": 4096,
                        "top_p": 0.95,
                        "repeat_penalty": 1.2,
                        "stop_words": ["###"]
                    }
                }
            }
        }
    )
):
    try:
        return await LlamaChatService.process_chat(request)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar chat: {str(e)}"
        ) 