import os
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document
from typing import List
from backend.config import GOOGLE_API_KEY, CHROMA_DB_DIR

class VectorService:
    def __init__(self):
        if not GOOGLE_API_KEY:
             raise ValueError("GOOGLE_API_KEY is not set in environment variables")
             
        self.embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001", google_api_key=GOOGLE_API_KEY)
        self.persist_directory = CHROMA_DB_DIR

    def get_vectorstore(self, collection_name: str):
        return Chroma(
            collection_name=collection_name,
            embedding_function=self.embeddings,
            persist_directory=self.persist_directory
        )

    async def add_documents(self, collection_name: str, documents: List[Document]):
        vectorstore = self.get_vectorstore(collection_name)
        await vectorstore.aadd_documents(documents)

    async def similarity_search(self, collection_name: str, query: str, k: int = 4):
        vectorstore = self.get_vectorstore(collection_name)
        return await vectorstore.asimilarity_search(query, k=k)
    
    def list_collections(self):
         # This is a bit tricky with LangChain's Chroma wrapper directly.
         # We might need to access the underlying client.
         import chromadb
         client = chromadb.PersistentClient(path=self.persist_directory)
         return [col.name for col in client.list_collections()]
