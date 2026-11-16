import os
import math
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from dotenv import load_dotenv

_BASE = Path(__file__).parent
load_dotenv(_BASE / ".env")                    # base defaults
load_dotenv(_BASE / ".env.local", override=True)  # local overrides (gitignored)

from typing import Any

import numpy as np
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from routes import upload, analyze, insights, docs
from utils.file_utils import ensure_dataset_storage

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def numpy_safe(obj: Any) -> Any:
    """Recursively convert numpy scalars to native Python types."""
    if isinstance(obj, np.integer):
        return int(obj)
    if isinstance(obj, np.floating):
        v = float(obj)
        return None if (math.isnan(v) or math.isinf(v)) else v
    if isinstance(obj, np.bool_):
        return bool(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, dict):
        return {k: numpy_safe(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [numpy_safe(v) for v in obj]
    return obj

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting AI Dashboard API...")
    ensure_dataset_storage()
    logger.info("Dataset storage initialized")
    yield
    logger.info("Shutting down AI Dashboard API...")


app = FastAPI(
    title="AI Data Dashboard API",
    description="Backend API for AI-powered data dashboard generator",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

# CORS
allowed_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001,https://datovo.vercel.app").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, tags=["upload"])
app.include_router(analyze.router, tags=["analyze"])
app.include_router(insights.router, tags=["insights"])
app.include_router(docs.router)


@app.get("/health", tags=["health"])
async def health_check():
    storage_path = Path(os.getenv("DATASET_STORAGE_PATH", "/tmp/datasets"))
    return {
        "status": "healthy",
        "version": "1.0.0",
        "storage": str(storage_path),
        "storage_exists": storage_path.exists(),
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error", "error_code": "INTERNAL_ERROR"},
    )
