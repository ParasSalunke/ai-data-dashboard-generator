import asyncio, sys, os
from pathlib import Path
from dotenv import load_dotenv

_BASE = Path(__file__).parent / "backend"
load_dotenv(_BASE / ".env")
load_dotenv(_BASE / ".env.local", override=True)

sys.path.insert(0, str(_BASE))
from services.ai_service import AIService

async def test():
    svc = AIService()
    print("Client:", svc.client)
    print("Model:", getattr(svc, "_model", "N/A"))

    summary = {
        "row_count": 30, "col_count": 7,
        "columns": [
            {"name": "age", "dtype": "numeric", "null_pct": 0,
             "stats": {"mean": 37.1, "min": 25, "max": 55, "std": 8.2}},
            {"name": "salary", "dtype": "numeric", "null_pct": 0,
             "stats": {"mean": 95000, "min": 45000, "max": 180000, "std": 32000}},
            {"name": "department", "dtype": "categorical", "null_pct": 0,
             "top_values": {"Engineering": 12, "Marketing": 8, "Sales": 6}},
        ]
    }
    print("\nGenerating insights via Gemini...")
    insights = await svc.generate_insights(summary)
    for ins in insights:
        print(f"  [{ins['type']}] {ins['title']}")
        print(f"     {ins['content'][:80]}")

    print("\nAsking a question via Gemini...")
    qa = await svc.answer_question(summary, "What is the average salary?")
    print("Answer:", qa["answer"][:120])

asyncio.run(test())
