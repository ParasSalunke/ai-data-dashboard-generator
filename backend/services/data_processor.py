import os
import math
import logging
import json
from pathlib import Path
from typing import Any, Literal

import chardet
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def _to_python(obj: Any) -> Any:
    """Recursively convert numpy scalars/arrays to native Python types."""
    if isinstance(obj, np.integer):
        return int(obj)
    if isinstance(obj, np.floating):
        v = float(obj)
        return None if (math.isnan(v) or math.isinf(v)) else v
    if isinstance(obj, np.bool_):
        return bool(obj)
    if isinstance(obj, np.ndarray):
        return [_to_python(x) for x in obj.tolist()]
    if isinstance(obj, dict):
        return {k: _to_python(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_to_python(v) for v in obj]
    if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
        return None
    return obj


class DataProcessor:

    def process_csv(self, csv_path: Path, dataset_dir: Path) -> dict:
        """Process uploaded CSV: detect encoding, parse, save as Parquet, return metadata."""
        # Detect encoding from first 10KB sample
        file_size = csv_path.stat().st_size
        with open(csv_path, "rb") as f:
            raw_bytes = f.read(min(10000, file_size))
        detected = chardet.detect(raw_bytes)
        encoding = detected.get("encoding") or "utf-8"
        logger.info(f"Detected encoding: {encoding} (confidence: {detected.get('confidence', 0):.0%})")

        # Read CSV with fallback encoding
        try:
            df = pd.read_csv(csv_path, encoding=encoding, on_bad_lines="skip", low_memory=False)
        except (UnicodeDecodeError, Exception):
            df = pd.read_csv(csv_path, encoding="latin-1", on_bad_lines="skip", low_memory=False)

        # Save as Parquet for fast subsequent reads
        parquet_path = dataset_dir / "data.parquet"
        df.to_parquet(parquet_path, index=False)
        logger.info(f"Saved Parquet: {parquet_path} ({len(df)} rows, {len(df.columns)} cols)")

        # Analyze each column
        columns = []
        for col in df.columns:
            dtype = self._infer_column_type(df[col])
            null_count = int(df[col].isna().sum())
            null_pct = round(null_count / max(len(df), 1) * 100, 2)
            unique_count = int(df[col].nunique())
            sample_values = self._get_sample_values(df[col], dtype)
            columns.append({
                "name": col,
                "dtype": dtype,
                "null_count": null_count,
                "null_pct": null_pct,
                "unique_count": unique_count,
                "sample_values": sample_values,
            })

        # Preview rows (first 50) — NaN-safe JSON
        preview_df = df.head(50)
        preview = json.loads(
            preview_df.where(preview_df.notna(), None).to_json(orient="records", default_handler=str)
        )

        return _to_python({
            "columns": columns,
            "preview": preview,
            "row_count": len(df),
            "col_count": len(df.columns),
        })

    def _infer_column_type(
        self, series: pd.Series
    ) -> Literal["numeric", "categorical", "datetime", "boolean", "unknown"]:
        if series.isna().all():
            return "unknown"

        non_null = series.dropna()

        # Boolean check
        unique_lower = {str(v).lower().strip() for v in non_null.unique()[:20]}
        if unique_lower.issubset({"true", "false", "1", "0", "yes", "no"}):
            return "boolean"

        # Numeric check
        if pd.api.types.is_numeric_dtype(series):
            cardinality_ratio = series.nunique() / max(len(series), 1)
            if series.nunique() <= 10 and cardinality_ratio < 0.05:
                return "categorical"
            return "numeric"

        # Datetime check — test on a sample
        sample = non_null.head(200)
        try:
            parsed = pd.to_datetime(sample, errors="coerce")
            if parsed.notna().mean() >= 0.8:
                return "datetime"
        except Exception:
            pass

        return "categorical"

    def _get_sample_values(self, series: pd.Series, dtype: str) -> list[Any]:
        non_null = series.dropna()
        if len(non_null) == 0:
            return []

        if dtype == "numeric":
            try:
                numeric = pd.to_numeric(non_null, errors="coerce").dropna()
                vals = [
                    numeric.min(),
                    numeric.quantile(0.25),
                    numeric.median(),
                    numeric.quantile(0.75),
                    numeric.max(),
                ]
                return [self._safe_value(v) for v in vals]
            except Exception:
                return []
        elif dtype == "datetime":
            try:
                parsed = pd.to_datetime(non_null, errors="coerce").dropna()
                if len(parsed) > 0:
                    return [str(parsed.min().date()), str(parsed.max().date())]
            except Exception:
                pass
            return []
        else:
            top = non_null.value_counts().head(5).index.tolist()
            return [str(v) for v in top]

    def _safe_value(self, value: Any) -> Any:
        if value is None:
            return None
        # Convert numpy scalars to native Python types
        try:
            import numpy as np
            if isinstance(value, (np.integer,)):
                return int(value)
            if isinstance(value, (np.floating,)):
                v = float(value)
                if math.isnan(v) or math.isinf(v):
                    return None
                return v
            if isinstance(value, (np.bool_,)):
                return bool(value)
        except ImportError:
            pass
        if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
            return None
        return value

    def analyze_dataset(self, parquet_path: Path) -> dict:
        """Load Parquet and compute per-column summary statistics."""
        df = pd.read_parquet(parquet_path)
        column_types: dict[str, str] = {}
        summary_stats = []

        for col in df.columns:
            dtype = self._infer_column_type(df[col])
            column_types[col] = dtype
            stats = self._get_column_stats(df[col], dtype)
            summary_stats.append({"column": col, "dtype": dtype, **stats})

        return _to_python({"column_types": column_types, "summary_stats": summary_stats})

    def _get_column_stats(self, series: pd.Series, dtype: str) -> dict:
        if dtype == "numeric":
            try:
                numeric = pd.to_numeric(series, errors="coerce")
                return {
                    "mean": self._safe_value(float(numeric.mean())),
                    "median": self._safe_value(float(numeric.median())),
                    "min": self._safe_value(float(numeric.min())),
                    "max": self._safe_value(float(numeric.max())),
                    "std": self._safe_value(float(numeric.std())),
                    "percentile_25": self._safe_value(float(numeric.quantile(0.25))),
                    "percentile_75": self._safe_value(float(numeric.quantile(0.75))),
                }
            except Exception:
                return {}

        elif dtype in ("categorical", "boolean"):
            try:
                vc = series.value_counts().head(10)
                total = series.notna().sum()
                top_values = [
                    {"value": str(k), "count": int(v), "pct": round(v / max(total, 1) * 100, 1)}
                    for k, v in vc.items()
                ]
                return {"top_values": top_values, "unique_count": int(series.nunique())}
            except Exception:
                return {}

        elif dtype == "datetime":
            try:
                parsed = pd.to_datetime(series, errors="coerce").dropna()
                if len(parsed) > 0:
                    delta = parsed.max() - parsed.min()
                    return {
                        "min_date": str(parsed.min().date()),
                        "max_date": str(parsed.max().date()),
                        "date_range_days": int(delta.days),
                    }
            except Exception:
                pass

        return {}

    def build_dataset_summary(self, parquet_path: Path) -> dict:
        """Token-efficient dataset summary for LLM prompts. Max ~2000 tokens."""
        df = pd.read_parquet(parquet_path)
        columns_info = []

        for col in df.columns:
            dtype = self._infer_column_type(df[col])
            # Sanitize column name against prompt injection
            safe_name = "".join(c for c in col if c.isalnum() or c in "_ -")[:50]

            col_summary: dict[str, Any] = {
                "name": safe_name,
                "dtype": dtype,
                "null_pct": round(df[col].isna().mean() * 100, 1),
                "unique_count": int(df[col].nunique()),
            }

            if dtype == "numeric":
                try:
                    numeric = pd.to_numeric(df[col], errors="coerce")
                    col_summary["stats"] = {
                        "mean": self._safe_value(round(float(numeric.mean()), 2)),
                        "min": self._safe_value(float(numeric.min())),
                        "max": self._safe_value(float(numeric.max())),
                        "std": self._safe_value(round(float(numeric.std()), 2)),
                    }
                except Exception:
                    pass
            elif dtype in ("categorical", "boolean"):
                top = df[col].value_counts().head(5).to_dict()
                col_summary["top_values"] = {str(k): int(v) for k, v in top.items()}
            elif dtype == "datetime":
                try:
                    parsed = pd.to_datetime(df[col], errors="coerce").dropna()
                    if len(parsed) > 0:
                        col_summary["date_range"] = (
                            f"{parsed.min().date()} to {parsed.max().date()}"
                        )
                except Exception:
                    pass

            columns_info.append(col_summary)

        return _to_python({
            "row_count": len(df),
            "col_count": len(df.columns),
            "columns": columns_info,
        })
