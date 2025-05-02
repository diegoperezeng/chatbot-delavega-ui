from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.chat.openai import openai_controller
from app.api.chat.anthropic import anthropic_controller
from app.api.chat.azure import azure_controller
from app.api.chat.google import google_controller
from app.api.chat.groq import groq_controller
from app.api.chat.mistral import mistral_controller
from app.api.chat.openrouter import openrouter_controller
from app.api.chat.custom import custom_controller
from app.api.chat.tools import tools_controller
from app.api.chat.llama import llama_controller
from app.api.keys import keys_controller
from app.api.username import username_controller
from app.api.retrieval import retrieval_controller
from app.api.messages import messages_controller

app = FastAPI(
    title="ChatBot DeLaVega API",
    description="Backend API para o ChatBot DeLaVega",
    version="1.0.0"
)

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique os domínios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas de Chat
app.include_router(openai_controller.router, prefix="/api/chat/openai", tags=["chat"])
app.include_router(anthropic_controller.router, prefix="/api/chat/anthropic", tags=["chat"])
app.include_router(azure_controller.router, prefix="/api/chat/azure", tags=["chat"])
app.include_router(google_controller.router, prefix="/api/chat/google", tags=["chat"])
app.include_router(groq_controller.router, prefix="/api/chat/groq", tags=["chat"])
app.include_router(mistral_controller.router, prefix="/api/chat/mistral", tags=["chat"])
app.include_router(openrouter_controller.router, prefix="/api/chat/openrouter", tags=["chat"])
app.include_router(custom_controller.router, prefix="/api/chat/custom", tags=["chat"])
app.include_router(tools_controller.router, prefix="/api/chat/tools", tags=["chat"])
app.include_router(llama_controller.router, prefix="/api/chat/llama", tags=["chat"])

# Outras rotas
app.include_router(keys_controller.router, prefix="/api/keys", tags=["keys"])
app.include_router(username_controller.router, prefix="/api/username", tags=["username"])
app.include_router(retrieval_controller.router, prefix="/api/retrieval", tags=["retrieval"])
app.include_router(messages_controller.router, prefix="/api/messages", tags=["messages"])

@app.get("/")
async def root():
    return {
        "message": "Bem-vindo à API do ChatBot DeLaVega",
        "docs": "/docs",
        "redoc": "/redoc"
    } 