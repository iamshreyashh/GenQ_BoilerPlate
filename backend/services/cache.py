from langchain_community.cache import SQLiteCache
from langchain.globals import set_llm_cache
from backend.config import SQLITE_DB_PATH
import os

def setup_cache():
    """Configures the global LLM cache to use SQLite."""
    # Ensure directory exists if path has one
    db_dir = os.path.dirname(SQLITE_DB_PATH)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir)
        
    set_llm_cache(SQLiteCache(database_path=SQLITE_DB_PATH))
    print(f"LLM Cache configured with SQLite at {SQLITE_DB_PATH}")
