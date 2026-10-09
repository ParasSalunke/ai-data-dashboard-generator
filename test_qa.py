import asyncio
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

from backend.services.ai_service import AIService

async def test():
    service = AIService()
    summary = {
        "row_count": 100,
        "col_count": 2,
        "columns": [
            {"name": "test", "dtype": "numeric", "stats": {"mean": 5}}
        ]
    }
    question = "What is the mean of test?"
    raw_csv = "test\n5\n5\n"
    
    try:
        res = await service.answer_question(summary, question, raw_csv)
        print("Result:", res)
    except Exception as e:
        print("Exception:", e)

if __name__ == "__main__":
    asyncio.run(test())
