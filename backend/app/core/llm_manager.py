from typing import Dict, Any, Optional
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from pydantic import BaseModel

class BaseLLMConfig(BaseModel):
    """Configuração base para modelos LLM"""
    model: str
    temperature: float = 0.7
    max_tokens: Optional[int] = None
    streaming: bool = True

class BaseLLMManager:
    """Gerenciador base para modelos LLM"""
    def __init__(self, config: BaseLLMConfig):
        self.config = config
        self.llm = None
        self.chain = None
        self.memory = ConversationBufferMemory()
        
    def _create_chain(self) -> ConversationChain:
        """Cria uma cadeia de conversação com memória"""
        if not self.llm:
            raise ValueError("LLM não inicializado")
            
        prompt = PromptTemplate.from_template(
            """O histórico da conversa é:
            {history}
            
            Humano: {input}
            Assistente:"""
        )
        
        return ConversationChain(
            llm=self.llm,
            memory=self.memory,
            prompt=prompt,
            verbose=True
        )
    
    async def generate_response(self, message: str) -> str:
        """Gera uma resposta usando o modelo configurado"""
        if not self.chain:
            self.chain = self._create_chain()
            
        response = await self.chain.arun(input=message)
        return response

    def clear_memory(self):
        """Limpa a memória da conversação"""
        self.memory.clear() 