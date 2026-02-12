import os
import shutil
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager

from backend.services.ingestion import IngestionService
from backend.services.vector_db import VectorService
from backend.services.llm_service import get_llm
from backend.services.cache import setup_cache
from backend.utils.guardrails import Guardrails

from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

# --- Models ---
class QueryRequest(BaseModel):
    collection_name: str
    query: str

class QueryResponse(BaseModel):
    answer: str
    sources: List[str]

# --- Lifecycle ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_cache()
    yield
    # Shutdown

app = FastAPI(title="GenQ RAG Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Dependencies ---
# Simple singleton-like dependency injection for this scale
ingestion_service = IngestionService()
vector_service = VectorService()
guardrails = Guardrails()

# --- Endpoints ---

@app.get("/")
async def root():
    return {"message": "GenQ RAG Backend is running"}

@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    collection_name: str = Form(...),
    chunking_strategy: str = Form("recursive"),
    chunk_size: int = Form(1000),
    chunk_overlap: int = Form(200)
):
    try:
        # 1. Save temp file
        os.makedirs("temp_uploads", exist_ok=True)
        temp_path = f"temp_uploads/{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 2. Load
        documents = await ingestion_service.load_document(temp_path)
        
        # 3. Chunk
        chunks = ingestion_service.chunk_document(
            documents, 
            strategy=chunking_strategy, 
            chunk_size=chunk_size, 
            chunk_overlap=chunk_overlap
        )
        
        # 4. Index
        await vector_service.add_documents(collection_name, chunks)
        
        # 5. Cleanup
        os.remove(temp_path)
        
        return {"message": f"Successfully processed {file.filename} into collection '{collection_name}'", "chunks_count": len(chunks)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query", response_model=QueryResponse)
async def query_rag(request: QueryRequest):
    # 1. Input Guardrails
    if not guardrails.validate_input(request.query):
        raise HTTPException(status_code=400, detail="Invalid input detected.")

    try:
        # 2. Setup Retrieval
        llm = get_llm()
        vectorstore = vector_service.get_vectorstore(request.collection_name)
        retriever = vectorstore.as_retriever()
        
        # 3. Create Chain
        system_prompt = (
            # "you only will be answering questions based on the medical queries"
            # "You are an assistant for question-answering tasks. "
            # "Use the following pieces of retrieved context to answer "
            # "the question. If the answer is not in the context, say that you "
            # "don't know. Do not use your internal knowledge. "
            # "Keep the answer concise."
            "\n\n"
            "{context}"
        )
        
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("human", "{input}"),
            ]
        )
        
        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        rag_chain = create_retrieval_chain(retriever, question_answer_chain)
        
        # 4. Invoke
        response = await rag_chain.ainvoke({"input": request.query})
        answer = response["answer"]
        
        # 5. Output Guardrails
        if not guardrails.validate_output(answer):
             answer = "I cannot provide an answer based on the current context."

        # Extract sources
        sources = list(set([doc.metadata.get("source", "unknown") for doc in response.get("context", [])]))
        
        return QueryResponse(answer=answer, sources=sources)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/collections")
async def list_collections():
    try:
        collections = vector_service.list_collections()
        return {"collections": collections}
    except Exception as e:
        return {"collections": [], "error": str(e)}
