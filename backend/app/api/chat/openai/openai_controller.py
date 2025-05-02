from fastapi import APIRouter, HTTPException, Depends, Body
from app.core.security import get_api_key
from .openai_schemas import ChatRequest, ChatResponse
from .openai_service import OpenAIChatService

router = APIRouter(
    prefix="/chat",
    tags=["OpenAI Chat"],
    description="Endpoints para interação com modelos GPT da OpenAI"
)

@router.post(
    "/",
    response_model=ChatResponse,
    summary="Gerar resposta usando GPT da OpenAI",
    description="""
    Endpoint para gerar respostas usando os modelos GPT da OpenAI.
    
    **Funcionalidades:**
    - Suporta todos os modelos GPT (GPT-4, GPT-3.5)
    - Processa múltiplas mensagens mantendo contexto da conversa
    - Suporta chamadas de função (function calling)
    - Permite streaming de respostas
    
    **Exemplos de uso:**
    
    1. Pergunta simples:
    ```json
    {
        "messages": [
            {"role": "user", "content": "Qual é a capital do Brasil?"}
        ],
        "model": "gpt-3.5-turbo",
        "temperature": 0.7
    }
    ```
    
    2. Com contexto de sistema:
    ```json
    {
        "messages": [
            {"role": "system", "content": "Você é um professor de história do Brasil"},
            {"role": "user", "content": "Quem foi Dom Pedro I?"}
        ],
        "model": "gpt-4-turbo-preview",
        "temperature": 0.7
    }
    ```
    
    3. Com function calling:
    ```json
    {
        "messages": [
            {"role": "user", "content": "Qual é a previsão do tempo em São Paulo?"}
        ],
        "model": "gpt-4-turbo-preview",
        "functions": [
            {
                "name": "get_weather",
                "description": "Obtém a previsão do tempo",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "Cidade para obter a previsão"
                        }
                    },
                    "required": ["location"]
                }
            }
        ]
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
                    "model": "gpt-3.5-turbo",
                    "temperature": 0.7
                }
            },
            "com_contexto": {
                "summary": "Com contexto de sistema",
                "description": "Exemplo usando mensagem de sistema",
                "value": {
                    "messages": [
                        {"role": "system", "content": "Você é um professor de história do Brasil"},
                        {"role": "user", "content": "Quem foi Dom Pedro I?"}
                    ],
                    "model": "gpt-4-turbo-preview",
                    "temperature": 0.7
                }
            },
            "com_funcoes": {
                "summary": "Com function calling",
                "description": "Exemplo usando chamadas de função",
                "value": {
                    "messages": [
                        {"role": "user", "content": "Qual é a previsão do tempo em São Paulo?"}
                    ],
                    "model": "gpt-4-turbo-preview",
                    "temperature": 0.7,
                    "functions": [
                        {
                            "name": "get_weather",
                            "description": "Obtém a previsão do tempo",
                            "parameters": {
                                "type": "object",
                                "properties": {
                                    "location": {
                                        "type": "string",
                                        "description": "Cidade para obter a previsão"
                                    }
                                },
                                "required": ["location"]
                            }
                        }
                    ]
                }
            }
        }
    ),
    api_key: str = Depends(get_api_key)
):
    try:
        return await OpenAIChatService.process_chat(request, api_key)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar chat: {str(e)}"
        ) 