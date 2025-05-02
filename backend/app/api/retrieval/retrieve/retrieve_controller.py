from fastapi import APIRouter, HTTPException, Depends
from app.schemas.retrieval import RetrievalRequest, EmbeddingResponse
from app.core.config import get_settings
from app.core.security import get_api_key
from app.lib.embeddings import generate_local_embedding
import openai
from supabase import create_client, Client
from typing import List

router = APIRouter()

@router.post("/", response_model=EmbeddingResponse)
async def retrieve_similar_chunks(
    request: RetrievalRequest,
    api_key: str = Depends(get_api_key)
):
    try:
        settings = get_settings()
        supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )

        unique_file_ids = list(set(request.file_ids))

        if request.embeddings_provider == "openai":
            client = openai.OpenAI(api_key=api_key)
            response = await client.embeddings.create(
                model="text-embedding-3-small",
                input=request.user_input
            )
            embedding = response.data[0].embedding

            # Chamada RPC para match_file_items_openai
            response = supabase.rpc(
                'match_file_items_openai',
                {
                    'query_embedding': embedding,
                    'match_count': request.source_count,
                    'file_ids': unique_file_ids
                }
            ).execute()

            if hasattr(response, 'error') and response.error:
                raise HTTPException(
                    status_code=500,
                    detail=f"Erro Supabase: {response.error.message}"
                )

            chunks = response.data

        elif request.embeddings_provider == "local":
            local_embedding = await generate_local_embedding(request.user_input)

            # Chamada RPC para match_file_items_local
            response = supabase.rpc(
                'match_file_items_local',
                {
                    'query_embedding': local_embedding,
                    'match_count': request.source_count,
                    'file_ids': unique_file_ids
                }
            ).execute()

            if hasattr(response, 'error') and response.error:
                raise HTTPException(
                    status_code=500,
                    detail=f"Erro Supabase: {response.error.message}"
                )

            chunks = response.data

        else:
            raise HTTPException(
                status_code=400,
                detail="Provedor de embeddings não suportado"
            )

        # Ordena os chunks por similaridade
        most_similar_chunks = sorted(
            chunks,
            key=lambda x: x.get('similarity', 0),
            reverse=True
        )

        return EmbeddingResponse(results=most_similar_chunks)

    except openai.AuthenticationError:
        raise HTTPException(
            status_code=401,
            detail="Chave de API OpenAI inválida"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        ) 