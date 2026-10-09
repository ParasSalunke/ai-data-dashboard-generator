import os
import asyncio
from dotenv import load_dotenv
import pandas as pd

load_dotenv("backend/.env")
api_key = os.getenv("GEMINI_API_KEY")

from google import genai
client = genai.Client(api_key=api_key)

async def test():
    # create dummy csv with large sum
    df = pd.DataFrame({
        "name": ["A"] * 1000 + ["B"] * 1000,
        "value": [10] * 1000 + [20] * 1000
    })
    df.to_csv("dummy_large.csv", index=False)
    
    file = client.files.upload(file="dummy_large.csv")
    print("File uploaded:", file.name)
    
    try:
        from google.genai import types
        # ask a question that requires aggregating all rows
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[file, "What is the total sum of the 'value' column?"],
            config=types.GenerateContentConfig(
                tools=[{"code_execution": {}}]
            )
        )
        print("Response:", response.text)
    finally:
        client.files.delete(name=file.name)
    
asyncio.run(test())
