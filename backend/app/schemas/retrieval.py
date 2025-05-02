from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class FileItemChunk(BaseModel):
    content: str
    tokens: int

class FileItem(BaseModel):
    file_id: str
    user_id: str
    content: str
    tokens: int
    openai_embedding: Optional[List[float]] = None
    local_embedding: Optional[List[float]] = None

class RetrievalRequest(BaseModel):
    user_input: str
    file_ids: List[str]
    embeddings_provider: str
    source_count: int

class ProcessRequest(BaseModel):
    file_id: str
    embeddings_provider: str
    file_extension: str

class DocxProcessRequest(BaseModel):
    text: str
    file_id: str
    embeddings_provider: str
    file_extension: str

class FileMetadata(BaseModel):
    id: str
    user_id: str
    name: str
    file_path: str
    tokens: Optional[int] = None

class EmbeddingResponse(BaseModel):
    results: List[Dict[str, Any]]

class ProcessResponse(BaseModel):
    message: str
    status: int = 200 