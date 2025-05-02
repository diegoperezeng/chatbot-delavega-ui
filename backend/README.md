# Backend Python - ChatBot DeLaVega

Backend em Python do ChatBot DeLaVega, uma plataforma avançada de chat que suporta múltiplos provedores de LLM.

## Características Principais

- **Múltiplos Provedores LLM:**
  - OpenAI (GPT-4, GPT-3.5)
  - Anthropic (Claude 3)
  - Google (Gemini Pro)
  - Llama (Servidor HTTP)
  - Groq
  - Mistral
  - Azure OpenAI
  - OpenRouter

- **Funcionalidades Avançadas:**
  - Streaming de respostas
  - Memória de conversação
  - Function calling (OpenAI)
  - Configurações de segurança (Google)
  - Processamento de documentos
  - Integração com Supabase

## Requisitos

- Python 3.9+
- pip (gerenciador de pacotes Python)
- Chaves de API dos provedores desejados

## Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
cd backend
```

2. Crie um ambiente virtual:
```bash
python -m venv venv
```

3. Ative o ambiente virtual:
- Windows:
```bash
.\venv\Scripts\activate
```
- Linux/Mac:
```bash
source venv/bin/activate
```

4. Instale as dependências:
```bash
pip install -r requirements.txt
```

5. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

6. Edite o arquivo `.env` com suas configurações:
```env
# Configurações do Servidor
PORT=8000
HOST=0.0.0.0
DEBUG=True

# Chave Secreta (Gere uma chave forte)
SECRET_KEY=sua_chave_secreta_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Supabase
SUPABASE_URL=sua_url_supabase
SUPABASE_KEY=sua_chave_supabase

# Chaves de API dos Provedores
OPENAI_API_KEY=sua_chave_openai
ANTHROPIC_API_KEY=sua_chave_anthropic
GOOGLE_API_KEY=sua_chave_google
AZURE_API_KEY=sua_chave_azure
GROQ_API_KEY=sua_chave_groq
MISTRAL_API_KEY=sua_chave_mistral
OPENROUTER_API_KEY=sua_chave_openrouter
```

## Executando o Servidor

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

O servidor estará disponível em `http://localhost:8000`

## Documentação da API

- **Swagger UI:** `http://localhost:8000/docs`
  - Documentação interativa com exemplos
  - Teste os endpoints diretamente
  - Schemas completos dos modelos

- **ReDoc:** `http://localhost:8000/redoc`
  - Documentação mais limpa e organizada
  - Melhor para leitura

## Estrutura do Projeto

```
backend/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   ├── anthropic/
│   │   │   │   ├── anthropic_controller.py  # Rotas e endpoints FastAPI
│   │   │   │   ├── anthropic_models.py      # Entidades e enums básicos
│   │   │   │   ├── anthropic_schemas.py     # DTOs e validação
│   │   │   │   └── anthropic_service.py     # Lógica de negócios
│   │   │   ├── google/
│   │   │   │   ├── google_controller.py     # Rotas e endpoints FastAPI
│   │   │   │   ├── google_models.py         # Entidades e enums básicos
│   │   │   │   ├── google_schemas.py        # DTOs e validação
│   │   │   │   └── google_service.py        # Lógica de negócios
│   │   │   ├── llama/
│   │   │   │   ├── llama_controller.py     # Rotas e endpoints FastAPI
│   │   │   │   ├── llama_models.py         # Entidades e enums básicos
│   │   │   │   ├── llama_schemas.py        # DTOs e validação
│   │   │   │   └── llama_service.py        # Lógica de negócios
│   │   │   └── openai/
│   │   │       ├── openai_controller.py    # Rotas e endpoints FastAPI
│   │   │       ├── openai_models.py        # Entidades e enums básicos
│   │   │       ├── openai_schemas.py       # DTOs e validação
│   │   │       └── openai_service.py       # Lógica de negócios
│   │   ├── keys/
│   │   │   └── keys_controller.py
│   │   ├── messages/
│   │   │   └── messages_controller.py
│   │   ├── retrieval/
│   │   │   ├── process/
│   │   │   │   └── process_controller.py
│   │   │   ├── retrieve/
│   │   │   │   └── retrieve_controller.py
│   │   │   └── retrieval_router.py
│   │   └── username/
│   │       └── username_controller.py
│   ├── core/
│   │   ├── llm_providers/
│   │   │   ├── anthropic_manager.py
│   │   │   ├── google_manager.py
│   │   │   ├── llama_manager.py
│   │   │   └── openai_manager.py
│   │   ├── config.py
│   │   ├── llm_factory.py
│   │   ├── llm_manager.py
│   │   └── security.py
│   ├── lib/
│   │   ├── processing.py
│   │   └── embeddings.py
│   ├── schemas/
│   │   ├── chat.py
│   │   ├── keys.py
│   │   ├── messages.py
│   │   └── retrieval.py
│   ├── __init__.py
│   └── main.py
├── tests/
├── .env.example
├── requirements.txt
└── README.md
```

## Dependências Principais

- **Framework Web:**
  - FastAPI 0.109.2
  - Uvicorn 0.27.1

- **Provedores LLM:**
  - OpenAI 1.12.0
  - Anthropic 0.18.1
  - Google AI Platform 1.43.0
  - Groq 0.4.2
  - Mistral AI 0.0.12

- **LangChain:**
  - langchain 0.1.9
  - langchain-openai 0.0.8
  - langchain-anthropic 0.0.6
  - langchain-google-genai 0.0.9
  - langchain-mistralai 0.0.5
  - langchain-groq 0.0.1

- **Processamento de Dados:**
  - python-docx 1.1.0
  - numpy 1.26.4
  - nltk 3.8.1
  - markdown 3.5.2
  - chromadb 0.4.22

- **Utilitários:**
  - pydantic 2.6.1
  - python-jose 3.3.0
  - passlib 1.7.4
  - httpx 0.26.0
  - tiktoken 0.6.0

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Crie um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes. 