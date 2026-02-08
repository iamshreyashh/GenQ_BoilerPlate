import os
from typing import List
from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter, CharacterTextSplitter

class IngestionService:
    def list_collections(self):
        # Placeholder for actual collection listing logic from DB
        # For now, this might just return potential collection names based on directories or DB
        return []

    async def load_document(self, file_path: str) -> List[Document]:
        """Loads a document based on its file extension."""
        ext = os.path.splitext(file_path)[1].lower()
        
        if ext == ".pdf":
            loader = PyPDFLoader(file_path)
        elif ext == ".docx":
            loader = Docx2txtLoader(file_path)
        elif ext == ".txt":
            loader = TextLoader(file_path)
        else:
            raise ValueError(f"Unsupported file type: {ext}")
            
        return await loader.aload()

    def chunk_document(self, documents: List[Document], strategy: str = "recursive", chunk_size: int = 1000, chunk_overlap: int = 200) -> List[Document]:
        """Chunks documents based on the specified strategy."""
        
        if strategy == "recursive":
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
                separators=["\n\n", "\n", " ", ""]
            )
        elif strategy == "fixed":
            splitter = CharacterTextSplitter(
                separator="\n",
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap
            )
        else:
            # Fallback to recursive
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap
            )
            
        return splitter.split_documents(documents)
