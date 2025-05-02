from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from app.schemas.retrieval import ProcessRequest, ProcessResponse, FileItemChunk
from app.core.config import get_settings
from app.core.security import get_api_key
from app.lib.embeddings import generate_local_embedding
from app.lib.processing import process_file
import openai
from supabase import create_client, Client
from typing import List
import json

router = APIRouter()

@router.post("/", response_model=ProcessResponse)
async def process_and_embed(
    file: UploadFile = File(...),
    file_id: str = Form(...),
    embeddings_provider: str = Form(...)
):
    try:
        settings = get_settings()
        supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )

        # Busca metadados do arquivo
        response = supabase.table('files').select('*').eq('id', file_id).single().execute()
        if response.error:
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao buscar metadados: {response.error.message}"
            )
        
        file_metadata = response.data
        if not file_metadata:
            raise HTTPException(status_code=404, detail="Arquivo não encontrado")

        # Processa o arquivo
        file_content = await file.read()
        file_extension = file_metadata['name'].split('.')[-1].lower()
        chunks = await process_file(file_content, file_extension)

        # Gera embeddings
        embeddings = []
        if embeddings_provider == "openai":
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            response = await client.embeddings.create(
                model="text-embedding-3-small",
                input=[chunk.content for chunk in chunks]
            )
            embeddings = [item.embedding for item in response.data]
        elif embeddings_provider == "local":
            embeddings = [
                await generate_local_embedding(chunk.content)
                for chunk in chunks
            ]
        else:
            raise HTTPException(
                status_code=400,
                detail="Provedor de embeddings não suportado"
            )

        # Prepara os items para inserção
        file_items = [
            {
                "file_id": file_id,
                "user_id": file_metadata['user_id'],
                "content": chunk.content,
                "tokens": chunk.tokens,
                "openai_embedding": emb if embeddings_provider == "openai" else None,
                "local_embedding": emb if embeddings_provider == "local" else None
            }
            for chunk, emb in zip(chunks, embeddings)
        ]

        # Insere os items
        response = supabase.table('file_items').upsert(file_items).execute()
        if response.error:
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao inserir items: {response.error.message}"
            )

        # Atualiza o total de tokens
        total_tokens = sum(item['tokens'] for item in file_items)
        response = supabase.table('files').update(
            {"tokens": total_tokens}
        ).eq('id', file_id).execute()

        if response.error:
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao atualizar tokens: {response.error.message}"
            )

        return ProcessResponse(message="Processamento concluído com sucesso")

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/docx", response_model=ProcessResponse)
async def process_docx(request: ProcessRequest):
    try:
        if request.file_extension != "docx":
            raise HTTPException(
                status_code=400,
                detail="Tipo de arquivo não suportado"
            )

        settings = get_settings()
        supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )

        # Processa o documento
        chunks = await process_file(request.text, "docx")

        # Gera embeddings
        embeddings = []
        if request.embeddings_provider == "openai":
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            response = await client.embeddings.create(
                model="text-embedding-3-small",
                input=[chunk.content for chunk in chunks]
            )
            embeddings = [item.embedding for item in response.data]
        elif request.embeddings_provider == "local":
            embeddings = [
                await generate_local_embedding(chunk.content)
                for chunk in chunks
            ]
        else:
            raise HTTPException(
                status_code=400,
                detail="Provedor de embeddings não suportado"
            )

        # Prepara os items para inserção
        file_items = [
            {
                "file_id": request.file_id,
                "content": chunk.content,
                "tokens": chunk.tokens,
                "openai_embedding": emb if request.embeddings_provider == "openai" else None,
                "local_embedding": emb if request.embeddings_provider == "local" else None
            }
            for chunk, emb in zip(chunks, embeddings)
        ]

        # Insere os items
        response = supabase.table('file_items').upsert(file_items).execute()
        if response.error:
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao inserir items: {response.error.message}"
            )

        # Atualiza o total de tokens
        total_tokens = sum(item['tokens'] for item in file_items)
        response = supabase.table('files').update(
            {"tokens": total_tokens}
        ).eq('id', request.file_id).execute()

        if response.error:
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao atualizar tokens: {response.error.message}"
            )

        return ProcessResponse(message="Processamento concluído com sucesso")

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        ) 