import logging
import json

import anyio
import pandas as pd
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from services.chart_generator import ChartGenerator
from services.data_processor import DataProcessor, _to_python
from utils.file_utils import get_dataset_dir

logger = logging.getLogger(__name__)
router = APIRouter()
processor = DataProcessor()
chart_gen = ChartGenerator()


class AnalyzeRequest(BaseModel):
    dataset_id: str


@router.post("/analyze")
async def analyze_dataset(request: AnalyzeRequest):
    """Compute summary stats + chart suggestions for an uploaded dataset."""
    dataset_dir = get_dataset_dir(request.dataset_id)
    parquet_path = dataset_dir / "data.parquet"

    if not parquet_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found. Upload a CSV file first.",
        )

    try:
        analysis = await anyio.to_thread.run_sync(
            lambda: processor.analyze_dataset(parquet_path)
        )
        charts = await anyio.to_thread.run_sync(
            lambda: chart_gen.generate_suggestions(parquet_path, analysis["column_types"])
        )
        return {
            "dataset_id": request.dataset_id,
            "summary_stats": analysis["summary_stats"],
            "chart_suggestions": charts,
        }
    except Exception as exc:
        logger.error(f"Analysis error: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {exc}",
        )


@router.post("/preview")
async def get_preview(request: AnalyzeRequest):
    """Return column metadata and first 100 preview rows for a dataset."""
    dataset_dir = get_dataset_dir(request.dataset_id)
    parquet_path = dataset_dir / "data.parquet"

    if not parquet_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found.",
        )

    def _load_preview():
        df = pd.read_parquet(parquet_path)
        preview_df = df.head(100)
        preview = json.loads(
            preview_df.where(preview_df.notna(), None).to_json(
                orient="records", default_handler=str
            )
        )
        # Re-infer column types
        columns = [
            {
                "name": col,
                "dtype": processor._infer_column_type(df[col]),
                "null_pct": round(float(df[col].isna().mean() * 100), 2),
                "null_count": int(df[col].isna().sum()),
                "unique_count": int(df[col].nunique()),
                "sample_values": [],
            }
            for col in df.columns
        ]
        meta_path = dataset_dir / "meta.json"
        file_name = "Uploaded Dataset"
        if meta_path.exists():
            try:
                meta = json.loads(meta_path.read_text(encoding="utf-8"))
                file_name = meta.get("fileName", file_name)
            except Exception:
                pass

        return _to_python({
            "dataset_id": request.dataset_id,
            "columns": columns,
            "preview": preview,
            "row_count": len(df),
            "col_count": len(df.columns),
            "fileName": file_name,
        })

    try:
        data = await anyio.to_thread.run_sync(_load_preview)
        return data
    except Exception as exc:
        logger.error(f"Preview error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Preview failed: {exc}")

