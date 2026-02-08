import os
from langchain_google_genai import ChatGoogleGenerativeAI
from backend.config import GOOGLE_API_KEY

def get_llm():
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY is not set in environment variables")
        
    return ChatGoogleGenerativeAI(
        model="gemini-flash-latest",
        google_api_key=GOOGLE_API_KEY,
        temperature=0.0
    )
