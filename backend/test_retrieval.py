import asyncio
from backend.services.vector_db import VectorService

async def test_retrieval():
    vs = VectorService()
    
    # query = "What does Shreyash want to become?"
    # collection = "test_collection"

    collections = ["test_collection", "test_collection_v2"]
    queries = ["What does Shreyash want to become?", "Who is Shreyash?", "LangChain framework"]

    for col in collections:
        print(f"\n--- Testing Collection: {col} ---")
        for q in queries:
            print(f"\nQuery: {q}")
            try:
                docs = await vs.similarity_search(col, q, k=3)
                if not docs:
                    print("  No documents found.")
                for i, doc in enumerate(docs):
                    print(f"  Result {i+1}: {doc.page_content[:100]}... (Source: {doc.metadata.get('source')})")
            except Exception as e:
                print(f"  Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_retrieval())
