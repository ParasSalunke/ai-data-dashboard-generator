import os
import shutil
import logging
import tempfile
from pathlib import Path
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

_default_storage = Path(tempfile.gettempdir()) / "ai_datasets"
DATASET_STORAGE_PATH = Path(os.getenv("DATASET_STORAGE_PATH", str(_default_storage)))


def get_dataset_dir(dataset_id: str) -> Path:
    return DATASET_STORAGE_PATH / dataset_id


def ensure_dataset_storage() -> None:
    DATASET_STORAGE_PATH.mkdir(parents=True, exist_ok=True)
    logger.info(f"Dataset storage ready: {DATASET_STORAGE_PATH}")


def cleanup_old_datasets(ttl_hours: int = 2) -> int:
    if not DATASET_STORAGE_PATH.exists():
        return 0
    cutoff = datetime.now() - timedelta(hours=ttl_hours)
    removed = 0
    for dataset_dir in DATASET_STORAGE_PATH.iterdir():
        if not dataset_dir.is_dir():
            continue
        try:
            mtime = datetime.fromtimestamp(dataset_dir.stat().st_mtime)
            if mtime < cutoff:
                shutil.rmtree(dataset_dir)
                removed += 1
                logger.info(f"Removed old dataset: {dataset_dir.name}")
        except Exception as e:
            logger.warning(f"Could not remove {dataset_dir}: {e}")
    return removed
