import csv
import json
import docx
import markdown
import io
from typing import List
import tiktoken
from app.schemas.retrieval import FileItemChunk

async def count_tokens(text: str) -> int:
    """Conta o número de tokens em um texto usando o tokenizador da OpenAI."""
    encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))

async def process_csv(content: bytes) -> List[FileItemChunk]:
    """Processa um arquivo CSV."""
    text = content.decode('utf-8')
    reader = csv.reader(io.StringIO(text))
    chunks = []
    
    for row in reader:
        content = ','.join(row)
        if content.strip():
            tokens = await count_tokens(content)
            chunks.append(FileItemChunk(content=content, tokens=tokens))
    
    return chunks

async def process_json(content: bytes) -> List[FileItemChunk]:
    """Processa um arquivo JSON."""
    text = content.decode('utf-8')
    data = json.loads(text)
    chunks = []
    
    def process_value(value, path=""):
        if isinstance(value, dict):
            return json.dumps(value, ensure_ascii=False)
        elif isinstance(value, list):
            return json.dumps(value, ensure_ascii=False)
        else:
            return str(value)
    
    for key, value in data.items():
        content = f"{key}: {process_value(value)}"
        tokens = await count_tokens(content)
        chunks.append(FileItemChunk(content=content, tokens=tokens))
    
    return chunks

async def process_markdown(content: bytes) -> List[FileItemChunk]:
    """Processa um arquivo Markdown."""
    text = content.decode('utf-8')
    html = markdown.markdown(text)
    
    # Divide por parágrafos
    paragraphs = html.split('\n\n')
    chunks = []
    
    for para in paragraphs:
        if para.strip():
            tokens = await count_tokens(para)
            chunks.append(FileItemChunk(content=para, tokens=tokens))
    
    return chunks

async def process_txt(content: bytes) -> List[FileItemChunk]:
    """Processa um arquivo de texto."""
    text = content.decode('utf-8')
    paragraphs = text.split('\n\n')
    chunks = []
    
    for para in paragraphs:
        if para.strip():
            tokens = await count_tokens(para)
            chunks.append(FileItemChunk(content=para, tokens=tokens))
    
    return chunks

async def process_docx(text: str) -> List[FileItemChunk]:
    """Processa um documento DOCX."""
    # No caso do DOCX, o texto já vem pré-processado do frontend
    paragraphs = text.split('\n\n')
    chunks = []
    
    for para in paragraphs:
        if para.strip():
            tokens = await count_tokens(para)
            chunks.append(FileItemChunk(content=para, tokens=tokens))
    
    return chunks

async def process_file(content: bytes | str, file_extension: str) -> List[FileItemChunk]:
    """Processa um arquivo baseado em sua extensão."""
    processors = {
        'csv': process_csv,
        'json': process_json,
        'md': process_markdown,
        'txt': process_txt,
        'docx': process_docx
    }
    
    if file_extension not in processors:
        raise ValueError(f"Extensão de arquivo não suportada: {file_extension}")
    
    processor = processors[file_extension]
    return await processor(content) 