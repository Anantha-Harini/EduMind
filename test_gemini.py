import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print(f"Key loaded: {bool(GEMINI_API_KEY)}")

try:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-pro")
    resp = model.generate_content("Hello, world!")
    print("Response:", resp.text)
except Exception as e:
    print("Error:", e)
