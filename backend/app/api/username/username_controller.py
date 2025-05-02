from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.config import get_settings
from typing import Dict
import httpx

router = APIRouter()

class UsernameCheck(BaseModel):
    username: str
    available: bool

@router.get("/available/{username}", response_model=UsernameCheck)
async def check_username_available(username: str):
    if not username or len(username) < 3:
        raise HTTPException(
            status_code=400,
            detail="Nome de usuário deve ter pelo menos 3 caracteres"
        )
    
    # Aqui você implementaria a lógica real de verificação no banco de dados
    # Este é apenas um exemplo
    try:
        settings = get_settings()
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.SUPABASE_URL}/rest/v1/users",
                headers={
                    "apikey": settings.SUPABASE_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_KEY}"
                },
                params={"username": f"eq.{username}"}
            )
            
            exists = len(response.json()) > 0
            return UsernameCheck(
                username=username,
                available=not exists
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao verificar username: {str(e)}"
        )

@router.get("/get/{user_id}", response_model=Dict[str, str])
async def get_username(user_id: str):
    try:
        settings = get_settings()
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.SUPABASE_URL}/rest/v1/users",
                headers={
                    "apikey": settings.SUPABASE_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_KEY}"
                },
                params={"id": f"eq.{user_id}"}
            )
            
            users = response.json()
            if not users:
                raise HTTPException(
                    status_code=404,
                    detail="Usuário não encontrado"
                )
                
            return {"username": users[0]["username"]}
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao buscar username: {str(e)}"
        ) 