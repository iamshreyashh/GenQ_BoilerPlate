import requests
import os
import time

# Create a dummy file for testing
with open("test_doc.txt", "w") as f:
    f.write("Shreyash is a software engineer and a cook. H likes to play badminton and he wants to become a prime minister. his phone number is 1234567891.")

def test_backend():
    base_url = "http://localhost:8000"
    
    # 1. Test Root
    try:
        resp = requests.get(f"{base_url}/")
        print(f"Root endpoint: {resp.status_code} - {resp.json()}")
    except Exception as e:
        print(f"Failed to connect to backend: {e}")
        return

    # 2. Test Upload
    try:
        files = {"file": ("test_doc.txt", open("test_doc.txt", "rb"), "text/plain")}
        data = {"collection_name": "test_collection"}
        resp = requests.post(f"{base_url}/upload", files=files, data=data)
        print(f"Upload endpoint: {resp.status_code} - {resp.json()}")
    except Exception as e:
        print(f"Failed to upload: {e}")

    # 3. Test Query
    try:
        data = {"collection_name": "test_collection", "query": "What does Shreyash want to become?"}
        resp = requests.post(f"{base_url}/query", json=data)
        print(f"Query endpoint: {resp.status_code} - {resp.json()}")
    except Exception as e:
        print(f"Failed to query: {e}")

if __name__ == "__main__":
    print("Running backend tests...")
    # Give the server a moment to start if run consecutively
    time.sleep(2)
    test_backend()
    
    # # Cleanup
    # if os.path.exists("test_doc.txt"):
    #     os.remove("test_doc.txt")
