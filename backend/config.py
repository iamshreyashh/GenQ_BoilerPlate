import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
CHROMA_DB_DIR = os.getenv("CHROMA_DB_DIR", "./chroma_db")
SQLITE_DB_PATH = os.getenv("SQLITE_DB_PATH", "prompt_cache.db")
