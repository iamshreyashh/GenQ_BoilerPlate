import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("API Key not found!")
    exit(1)

genai.configure(api_key=api_key)

try:
    print("Listing available models...")
    for model in genai.list_models():
        if 'embedContent' in model.supported_generation_methods:
            print(f"Embedding Model: {model.name}")
        elif 'generateContent' in model.supported_generation_methods:
            print(f"Generation Model: {model.name}")
except Exception as e:
    print(f"Error listing models: {e}")
