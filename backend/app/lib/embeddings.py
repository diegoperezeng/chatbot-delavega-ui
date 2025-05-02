import numpy as np
from typing import List
import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import asyncio

# Download recursos necessários do NLTK
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

def preprocess_text(text: str) -> str:
    """Pré-processa o texto para geração de embeddings."""
    # Remove caracteres especiais e converte para minúsculas
    text = re.sub(r'[^\w\s]', '', text.lower())
    
    # Tokeniza e remove stopwords
    stop_words = set(stopwords.words('english'))
    tokens = word_tokenize(text)
    tokens = [t for t in tokens if t not in stop_words]
    
    return ' '.join(tokens)

async def generate_local_embedding(text: str) -> List[float]:
    """
    Gera um embedding local para o texto usando uma técnica simples de hashing.
    Esta é uma implementação básica e deve ser substituída por um modelo mais robusto em produção.
    """
    # Simula uma operação assíncrona
    await asyncio.sleep(0)
    
    # Pré-processa o texto
    processed_text = preprocess_text(text)
    
    # Usa um vetor de 1536 dimensões (mesmo tamanho do OpenAI text-embedding-3-small)
    embedding_size = 1536
    
    # Inicializa o vetor de embedding
    embedding = np.zeros(embedding_size)
    
    # Para cada palavra, gera um hash e usa para preencher o vetor
    for word in processed_text.split():
        # Gera um hash da palavra
        word_hash = hash(word)
        
        # Usa o hash para determinar posições e valores no vetor
        for i in range(10):  # Cada palavra afeta 10 posições
            position = abs(hash(word + str(i))) % embedding_size
            value = (word_hash * (i + 1)) / 1e10  # Normaliza o valor
            embedding[position] += value
    
    # Normaliza o vetor para ter norma unitária
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm
    
    return embedding.tolist() 