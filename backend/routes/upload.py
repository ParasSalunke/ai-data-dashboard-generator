import os
import logging
from pathlib import Path
from typing import Any, Literal

import anyio
from fastapi import APIRouter, File, HTTPException, UploadFile, status
from pydantic import BaseModel

from services.data_processor import DataProcessor
from utils.file_utils import ensure_dataset_storage, get_dataset_dir

import uuid
import shutil

logger = logging.getLogger(__name__)
router = APIRouter()
processor = DataProcessor()

MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "100"))
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
CHUNK_SIZE = 64 * 1024  # 64 KB


class ColumnInfo(BaseModel):
    name: str
    dtype: Literal["numeric", "categorical", "datetime", "boolean", "unknown"]
    null_count: int
    null_pct: float
    unique_count: int
    sample_values: list[Any]


class UploadResponse(BaseModel):
    dataset_id: str
    columns: list[ColumnInfo]
    preview: list[dict]
    row_count: int
    col_count: int
    file_size_bytes: int


@router.post("/upload", response_model=UploadResponse)
async def upload_csv(file: UploadFile = File(...)):
    """Upload a CSV file. Returns dataset_id + column metadata + preview rows."""

    # Accept both text/csv and generic octet-stream (some browsers send the latter)
    is_csv_type = (file.content_type or "").startswith(("text/csv", "application/vnd.ms-excel", "text/plain"))
    is_csv_name = (file.filename or "").lower().endswith(".csv")
    if not is_csv_type and not is_csv_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are supported. Please upload a .csv file.",
        )

    ensure_dataset_storage()
    dataset_id = str(uuid.uuid4())
    dataset_dir = get_dataset_dir(dataset_id)
    dataset_dir.mkdir(parents=True, exist_ok=True)
    csv_path = dataset_dir / "original.csv"
    file_size = 0

    try:
        # Stream to disk in chunks — never buffer entire file in memory
        with open(csv_path, "wb") as out:
            while True:
                chunk = await file.read(CHUNK_SIZE)
                if not chunk:
                    break
                file_size += len(chunk)
                if file_size > MAX_FILE_SIZE_BYTES:
                    out.close()
                    csv_path.unlink(missing_ok=True)
                    dataset_dir.rmdir()
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds {MAX_FILE_SIZE_MB}MB limit.",
                    )
                out.write(chunk)

        # Process in thread pool — never block event loop with CPU-bound work
        result = await anyio.to_thread.run_sync(
            lambda: processor.process_csv(csv_path, dataset_dir)
        )

        return UploadResponse(
            dataset_id=dataset_id,
            columns=[ColumnInfo(**col) for col in result["columns"]],
            preview=result["preview"],
            row_count=result["row_count"],
            col_count=result["col_count"],
            file_size_bytes=file_size,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Upload error: {exc}", exc_info=True)
        shutil.rmtree(dataset_dir, ignore_errors=True)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not parse CSV: {exc}",
        )
