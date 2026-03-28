import logging

import anyio
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from services.ai_service import AIService
from services.data_processor import DataProcessor
from utils.file_utils import get_dataset_dir

logger = logging.getLogger(__name__)
router = APIRouter()
ai_service = AIService()
processor = DataProcessor()


class InsightsRequest(BaseModel):
    dataset_id: str


class AskRequest(BaseModel):
    dataset_id: str
    question: str


@router.post("/insights")
async def get_insights(request: InsightsRequest):
    """Generate AI-powered insights for a dataset."""
    parquet_path = get_dataset_dir(request.dataset_id) / "data.parquet"
    if not parquet_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found.")

    try:
        summary = await anyio.to_thread.run_sync(
            lambda: processor.build_dataset_summary(parquet_path)
        )
        insights = await ai_service.generate_insights(summary)
        return {"dataset_id": request.dataset_id, "insights": insights}
    except Exception as exc:
        logger.error(f"Insights error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Insights generation failed: {exc}")


@router.post("/ask")
async def ask_question(request: AskRequest):
    """Answer a natural language question about the dataset."""
    parquet_path = get_dataset_dir(request.dataset_id) / "data.parquet"
    if not parquet_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found.")

    try:
        summary = await anyio.to_thread.run_sync(
            lambda: processor.build_dataset_summary(parquet_path)
        )
        result = await ai_service.answer_question(summary, request.question)
        return {"answer": result["answer"], "chart": result.get("chart")}
    except Exception as exc:
        logger.error(f"Q&A error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Q&A failed: {exc}")
