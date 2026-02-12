import chromadb
import os
from backend.config import CHROMA_DB_DIR

def inspect_db():
    print(f"Checking Database at: {CHROMA_DB_DIR}")
    if not os.path.exists(CHROMA_DB_DIR):
        print("Chroma DB directory does not exist!")
        return

    try:
        client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
        collections = client.list_collections()
        print(f"Found {len(collections)} collections.")

        for col in collections:
            print(f"\n--- Collection: {col.name} ---")
            count = col.count()
            print(f"Item count: {count}")
            if count > 0:
                peek = col.peek(limit=3)
                print("Top 3 items metadata:")
                for meta in peek['metadatas']:
                    print(meta)
                print("Top 3 items documents (first 100 chars):")
                for doc in peek['documents']:
                    print(doc[:100] + "...")
    except Exception as e:
        print(f"Error inspecting DB: {e}")

if __name__ == "__main__":
    inspect_db()
