from fastapi import APIRouter, HTTPException, Depends, Query
from app.schemas.messages import (
    Message,
    MessageCreate,
    MessageUpdate,
    MessageResponse,
    MessagesResponse
)
from app.core.config import get_settings
from app.core.security import get_api_key
from supabase import create_client, Client
from typing import List, Optional
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/", response_model=MessageResponse)
async def create_message(
    message: MessageCreate,
    api_key: str = Depends(get_api_key)
):
    try:
        settings = get_settings()
        supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )

        message_data = {
            "id": str(uuid.uuid4()),
            "role": message.role,
            "content": message.content,
            "created_at": datetime.now().isoformat(),
            "metadata": message.metadata
        }

        response = supabase.table('messages').insert(message_data).execute()
        
        if response.error:
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao criar mensagem: {response.error.message}"
            )

        return MessageResponse(message=Message(**response.data[0]))

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/{message_id}", response_model=MessageResponse)
async def get_message(
    message_id: str,
    api_key: str = Depends(get_api_key)
):
    try:
        settings = get_settings()
        supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )

        response = supabase.table('messages').select('*').eq('id', message_id).single().execute()
        
        if response.error:
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao buscar mensagem: {response.error.message}"
            )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Mensagem não encontrada"
            )

        return MessageResponse(message=Message(**response.data))

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/", response_model=MessagesResponse)
async def list_messages(
    api_key: str = Depends(get_api_key),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    role: Optional[str] = None
):
    try:
        settings = get_settings()
        supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )

        query = supabase.table('messages').select('*', count='exact')
        
        if role:
            query = query.eq('role', role)

        # Aplica paginação
        query = query.range(skip, skip + limit - 1).order('created_at', desc=True)
        
        response = query.execute()
        
        if response.error:
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao listar mensagens: {response.error.message}"
            )

        messages = [Message(**msg) for msg in response.data]
        total = response.count if response.count is not None else len(messages)

        return MessagesResponse(messages=messages, total=total)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.patch("/{message_id}", response_model=MessageResponse)
async def update_message(
    message_id: str,
    message: MessageUpdate,
    api_key: str = Depends(get_api_key)
):
    try:
        settings = get_settings()
        supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )

        update_data = message.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.now().isoformat()

        response = supabase.table('messages').update(
            update_data
        ).eq('id', message_id).execute()
        
        if response.error:
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao atualizar mensagem: {response.error.message}"
            )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Mensagem não encontrada"
            )

        return MessageResponse(message=Message(**response.data[0]))

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.delete("/{message_id}")
async def delete_message(
    message_id: str,
    api_key: str = Depends(get_api_key)
):
    try:
        settings = get_settings()
        supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )

        response = supabase.table('messages').delete().eq('id', message_id).execute()
        
        if response.error:
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao deletar mensagem: {response.error.message}"
            )

        return {"message": "Mensagem deletada com sucesso"}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        ) 