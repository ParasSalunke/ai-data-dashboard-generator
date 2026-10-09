import os
import asyncio
from pathlib import Path
from dotenv import load_dotenv
from google import genai

load_dotenv("backend/.env")
api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)

async def test():
    csv_path = "dummy.csv"
    with open(csv_path, "w") as f:
        f.write("name,age,city\nAlice,30,NYC\nBob,25,LA\nCharlie,35,NYC\n")
    
    file = client.files.upload(file=csv_path)
    print("File uploaded:", file.name)
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[file, "What is the average age in NYC?"]
    )
    print("Response:", response.text)
    
asyncio.run(test())
