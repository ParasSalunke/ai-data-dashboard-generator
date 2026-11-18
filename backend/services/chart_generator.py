import math
import random
import logging
import re
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from services.data_processor import _to_python

logger = logging.getLogger(__name__)

CHART_COLORS = [
    "#6366f1",  # violet
    "#10b981",  # emerald
    "#f59e0b",  # amber
    "#3b82f6",  # blue
    "#ec4899",  # pink
    "#8b5cf6",  # purple
    "#ef4444",  # red
    "#14b8a6",  # teal
    "#f97316",  # orange
    "#06b6d4",  # cyan
]

MAX_DATA_POINTS = 200

# Patterns that identify meaningless auto-generated columns (don't chart these)
_ID_PATTERNS = re.compile(
    r"^(id|index|row_?num|serial|uuid|guid|pk|key|_id|rowid)$",
    flags=re.IGNORECASE,
)


def _is_id_column(col: str, series: pd.Series) -> bool:
    """Return True if this column looks like a primary-key/row-number column."""
    clean_col = col.strip().lower()
    if _ID_PATTERNS.match(clean_col):
        return True
    if clean_col.endswith("_id") or clean_col.startswith("id_"):
        return True
    n = len(series.dropna())
    if n > 0 and series.nunique() / n > 0.95:
        if "id" in clean_col or "uuid" in clean_col or "guid" in clean_col:
            return True
    return False


class ChartGenerator:

    def generate_suggestions(
        self, parquet_path: Path, column_types: dict[str, str]
    ) -> list[dict]:
        """Generate chart configs for each column based on detected types."""
        df = pd.read_parquet(parquet_path)
        suggestions: list[dict] = []
        datetime_cols = [c for c, t in column_types.items() if t == "datetime"]

        color_idx = 0

        for col, dtype in column_types.items():
            # Skip ID-like columns (not interesting to chart individually)
            if _is_id_column(col, df[col]):
                logger.info(f"Skipping ID-like column: {col!r}")
                continue

            color = CHART_COLORS[color_idx % len(CHART_COLORS)]
            color_idx += 1

            if dtype == "numeric":
                # Histogram for distribution
                chart = self._make_histogram(df, col, color)
                if chart:
                    suggestions.append(chart)

                # Area chart for time-series (richer than line)
                for dt_col in datetime_cols[:1]:
                    ts = self._make_area_chart(df, col, dt_col, color)
                    if ts:
                        suggestions.append(ts)

            elif dtype in ("categorical", "boolean"):
                n_unique = df[col].nunique()
                n_total = len(df[col].dropna())
                # Skip high-cardinality unique text columns (like customer names, emails) where each entry has count 1
                if n_total > 10 and n_unique / n_total > 0.8:
                    logger.info(f"Skipping high-cardinality column: {col!r}")
                    continue

                bar = self._make_bar_chart(df, col, color)
                if bar:
                    suggestions.append(bar)
                # Pie only for low-cardinality columns (max 8 slices, meaningful)
                if 2 <= n_unique <= 8:
                    pie = self._make_pie_chart(df, col, CHART_COLORS)
                    if pie:
                        suggestions.append(pie)

            elif dtype == "datetime":
                # Group-by-month count chart for datetime columns
                ts = self._make_datetime_histogram(df, col, color)
                if ts:
                    suggestions.append(ts)

        # Scatter: pick the two most meaningful numeric columns (highest variance)
        numeric_cols = [
            c for c, t in column_types.items()
            if t == "numeric" and not _is_id_column(c, df[c])
        ]
        if len(numeric_cols) >= 2:
            stds = {
                c: float(pd.to_numeric(df[c], errors="coerce").std())
                for c in numeric_cols
            }
            sorted_cols = sorted(stds, key=lambda c: stds[c], reverse=True)
            scatter = self._make_scatter(df, sorted_cols[0], sorted_cols[1])
            if scatter:
                suggestions.append(scatter)

        # Radar: multi-numeric comparison across a categorical grouping
        if len(numeric_cols) >= 3:
            cat_cols = [c for c, t in column_types.items() if t == "categorical"]
            if cat_cols:
                radar = self._make_radar(df, numeric_cols[:5], cat_cols[0])
                if radar:
                    suggestions.append(radar)

        # Radial bar: categorical/boolean with small unique count → good for % view
        radial_candidates = [
            c for c, t in column_types.items()
            if t in ("categorical", "boolean") and 2 <= df[c].nunique() <= 6
        ]
        if radial_candidates:
            radial = self._make_radialbar(df, radial_candidates[0], CHART_COLORS)
            if radial:
                suggestions.append(radial)

        # Stacked Area: Count by categorical grouping over time
        cat_cols = [c for c, t in column_types.items() if t == "categorical"]
        if datetime_cols and cat_cols:
            stacked = self._make_stacked_area_chart(df, datetime_cols[0], cat_cols[0], CHART_COLORS)
            if stacked:
                suggestions.append(stacked)

        # Cap total charts at 14 to avoid overwhelming the dashboard
        return _to_python(suggestions[:14])

    # ── helpers ────────────────────────────────────────────────────────────

    def _safe(self, v: Any) -> Any:
        if isinstance(v, np.integer):
            return int(v)
        if isinstance(v, np.floating):
            v2 = float(v)
            return None if (math.isnan(v2) or math.isinf(v2)) else v2
        if isinstance(v, np.bool_):
            return bool(v)
        if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
            return None
        return v

    def _make_histogram(self, df: pd.DataFrame, col: str, color: str) -> dict | None:
        try:
            numeric = pd.to_numeric(df[col], errors="coerce").dropna()
            if len(numeric) < 5:
                return None
            n_unique = numeric.nunique()
            n_bins = min(30, max(5, n_unique))
            binned = pd.cut(numeric, bins=n_bins, precision=2)
            vc = binned.value_counts().sort_index()
            data = [
                {"x": round(float((iv.left + iv.right) / 2), 4), "count": int(cnt)}
                for iv, cnt in vc.items()
            ]
            if len(data) > MAX_DATA_POINTS:
                step = len(data) // MAX_DATA_POINTS
                data = data[::step]
            # Format title nicely
            label = col.replace("_", " ").title()
            return {
                "id": f"histogram_{col}",
                "type": "histogram",
                "title": f"Distribution of {label}",
                "column": col,
                "data": data,
                "options": {"responsive": True, "showLegend": False, "showGrid": True, "colors": [color]},
            }
        except Exception as e:
            logger.warning(f"Histogram failed for {col!r}: {e}")
            return None

    def _make_bar_chart(self, df: pd.DataFrame, col: str, color: str) -> dict | None:
        try:
            vc = df[col].value_counts().head(20)
            if len(vc) == 0:
                return None
            data = [{"category": str(k), "count": int(v)} for k, v in vc.items()]
            label = col.replace("_", " ").title()
            return {
                "id": f"bar_{col}",
                "type": "bar",
                "title": f"{label} by Count",
                "column": col,
                "data": data,
                "options": {"responsive": True, "showLegend": False, "showGrid": True, "colors": [color]},
            }
        except Exception as e:
            logger.warning(f"Bar chart failed for {col!r}: {e}")
            return None

    def _make_pie_chart(self, df: pd.DataFrame, col: str, colors: list[str]) -> dict | None:
        try:
            vc = df[col].value_counts().head(8)
            if len(vc) < 2:
                return None
            data = [{"name": str(k), "value": int(v)} for k, v in vc.items()]
            label = col.replace("_", " ").title()
            return {
                "id": f"pie_{col}",
                "type": "pie",
                "title": f"{label} Breakdown",
                "column": col,
                "data": data,
                "options": {
                    "responsive": True,
                    "showLegend": True,
                    "showGrid": False,
                    "colors": colors[: len(data)],
                },
            }
        except Exception as e:
            logger.warning(f"Pie chart failed for {col!r}: {e}")
            return None

    def _make_timeseries(
        self, df: pd.DataFrame, value_col: str, date_col: str, color: str
    ) -> dict | None:
        try:
            tmp = df[[date_col, value_col]].copy()
            tmp[date_col] = pd.to_datetime(tmp[date_col], errors="coerce")
            tmp[value_col] = pd.to_numeric(tmp[value_col], errors="coerce")
            tmp = tmp.dropna().sort_values(date_col)
            if len(tmp) < 5:
                return None
            # Group by date if many rows (aggregates to daily/weekly/monthly)
            if len(tmp) > 365:
                tmp = tmp.set_index(date_col).resample("W")[value_col].mean().reset_index()
                tmp.columns = [date_col, value_col]
            elif len(tmp) > 60:
                tmp = tmp.set_index(date_col).resample("D")[value_col].mean().reset_index()
                tmp.columns = [date_col, value_col]
            if len(tmp) > MAX_DATA_POINTS:
                step = max(1, len(tmp) // MAX_DATA_POINTS)
                tmp = tmp.iloc[::step]
            data = [
                {"date": str(row[date_col])[:10], "value": self._safe(row[value_col])}
                for _, row in tmp.iterrows()
            ]
            val_label = value_col.replace("_", " ").title()
            date_label = date_col.replace("_", " ").title()
            return {
                "id": f"timeseries_{date_col}_{value_col}",
                "type": "timeseries",
                "title": f"{val_label} Over {date_label}",
                "column": value_col,
                "x_column": date_col,
                "data": data,
                "options": {"responsive": True, "showLegend": True, "showGrid": True, "colors": [color]},
            }
        except Exception as e:
            logger.warning(f"Timeseries failed for {value_col!r}: {e}")
            return None

    def _make_datetime_histogram(self, df: pd.DataFrame, col: str, color: str) -> dict | None:
        """Group datetime column into monthly counts for a trend chart."""
        try:
            parsed = pd.to_datetime(df[col], errors="coerce").dropna()
            if len(parsed) < 5:
                return None
            monthly = parsed.dt.to_period("M").value_counts().sort_index()
            if len(monthly) > MAX_DATA_POINTS:
                monthly = monthly.tail(MAX_DATA_POINTS)
            data = [
                {"date": str(period), "value": int(count)}
                for period, count in monthly.items()
            ]
            label = col.replace("_", " ").title()
            return {
                "id": f"datetime_hist_{col}",
                "type": "timeseries",
                "title": f"Records per Month ({label})",
                "column": col,
                "data": data,
                "options": {"responsive": True, "showLegend": False, "showGrid": True, "colors": [color]},
            }
        except Exception as e:
            logger.warning(f"Datetime histogram failed for {col!r}: {e}")
            return None

    def _make_scatter(
        self, df: pd.DataFrame, x_col: str, y_col: str
    ) -> dict | None:
        try:
            tmp = df[[x_col, y_col]].copy()
            tmp[x_col] = pd.to_numeric(tmp[x_col], errors="coerce")
            tmp[y_col] = pd.to_numeric(tmp[y_col], errors="coerce")
            tmp = tmp.dropna()
            if len(tmp) < 5:
                return None
            if len(tmp) > MAX_DATA_POINTS:
                tmp = tmp.sample(MAX_DATA_POINTS, random_state=42)
            data = [
                {"x": self._safe(float(r[x_col])), "y": self._safe(float(r[y_col]))}
                for _, r in tmp.iterrows()
            ]
            x_label = x_col.replace("_", " ").title()
            y_label = y_col.replace("_", " ").title()
            return {
                "id": f"scatter_{x_col}_{y_col}",
                "type": "scatter",
                "title": f"{x_label} vs {y_label}",
                "column": x_col,
                "x_column": x_col,
                "y_columns": [y_col],
                "data": data,
                "options": {"responsive": True, "showLegend": True, "showGrid": True, "colors": ["#6366f1"]},
            }
        except Exception as e:
            logger.warning(f"Scatter failed for {x_col!r} vs {y_col!r}: {e}")
            return None

    def _make_area_chart(
        self, df: pd.DataFrame, value_col: str, date_col: str, color: str
    ) -> dict | None:
        """Area chart (filled line) over a datetime axis."""
        try:
            tmp = df[[date_col, value_col]].copy()
            tmp[date_col] = pd.to_datetime(tmp[date_col], errors="coerce")
            tmp[value_col] = pd.to_numeric(tmp[value_col], errors="coerce")
            tmp = tmp.dropna().sort_values(date_col)
            if len(tmp) < 5:
                return None
            if len(tmp) > 365:
                tmp = tmp.set_index(date_col).resample("W")[value_col].mean().reset_index()
                tmp.columns = [date_col, value_col]
            elif len(tmp) > 60:
                tmp = tmp.set_index(date_col).resample("D")[value_col].mean().reset_index()
                tmp.columns = [date_col, value_col]
            if len(tmp) > MAX_DATA_POINTS:
                step = max(1, len(tmp) // MAX_DATA_POINTS)
                tmp = tmp.iloc[::step]
            data = [
                {"date": str(row[date_col])[:10], "value": self._safe(row[value_col])}
                for _, row in tmp.iterrows()
            ]
            val_label = value_col.replace("_", " ").title()
            date_label = date_col.replace("_", " ").title()
            return {
                "id": f"area_{date_col}_{value_col}",
                "type": "area",
                "title": f"{val_label} Trend Over {date_label}",
                "column": value_col,
                "x_column": date_col,
                "data": data,
                "options": {
                    "responsive": True,
                    "showLegend": True,
                    "showGrid": True,
                    "colors": [color],
                    "variant": random.choice(["gradient", "linear", "step"]),
                },
            }
        except Exception as e:
            logger.warning(f"Area chart failed for {value_col!r}: {e}")
            return None

    def _make_radar(
        self, df: pd.DataFrame, numeric_cols: list[str], group_col: str
    ) -> dict | None:
        """Radar chart comparing normalized numeric metrics per category group."""
        try:
            cats = df[group_col].dropna().unique()
            if len(cats) < 2 or len(cats) > 8:
                return None
            # Normalize columns to 0-100 range for radar comparability
            norms: dict[str, dict] = {}
            for col in numeric_cols:
                series = pd.to_numeric(df[col], errors="coerce")
                mn, mx = series.min(), series.max()
                if mx == mn:
                    continue
                norms[col] = {"min": float(mn), "max": float(mx)}

            if not norms:
                return None

            # Build rows per category — mean of each normalized metric
            data = []
            for cat in cats:
                mask = df[group_col] == cat
                row: dict = {"category": str(cat)}
                for col, info in norms.items():
                    mean_val = pd.to_numeric(df.loc[mask, col], errors="coerce").mean()
                    if pd.isna(mean_val):
                        row[col] = 0
                    else:
                        row[col] = round(
                            (float(mean_val) - info["min"]) / (info["max"] - info["min"]) * 100,
                            2,
                        )
                data.append(row)

            labels = [c.replace("_", " ").title() for c in norms.keys()]
            group_label = group_col.replace("_", " ").title()
            return {
                "id": f"radar_{group_col}",
                "type": "radar",
                "title": f"Metrics by {group_label} (Radar)",
                "column": group_col,
                "y_columns": list(norms.keys()),
                "data": data,
                "options": {
                    "responsive": True,
                    "showLegend": True,
                    "showGrid": True,
                    "colors": CHART_COLORS[: len(cats)],
                },
            }
        except Exception as e:
            logger.warning(f"Radar chart failed: {e}")
            return None

    def _make_radialbar(
        self, df: pd.DataFrame, col: str, colors: list[str]
    ) -> dict | None:
        """Radial bar chart showing category proportions as percentage of total."""
        try:
            vc = df[col].value_counts().head(6)
            if len(vc) < 2:
                return None
            total = int(vc.sum())
            data = [
                {
                    "name": str(k),
                    "value": int(v),
                    "pct": round(float(v) / total * 100, 1),
                    "fill": colors[i % len(colors)],
                }
                for i, (k, v) in enumerate(vc.items())
            ]
            label = col.replace("_", " ").title()
            return {
                "id": f"radialbar_{col}",
                "type": "radialbar",
                "title": f"{label} Share (Radial)",
                "column": col,
                "data": data,
                "options": {
                    "responsive": True,
                    "showLegend": True,
                    "showGrid": False,
                    "colors": colors[: len(data)],
                },
            }
        except Exception as e:
            logger.warning(f"Radial bar failed for {col!r}: {e}")
            return None

    def _make_stacked_area_chart(
        self, df: pd.DataFrame, date_col: str, cat_col: str, colors: list[str]
    ) -> dict | None:
        try:
            tmp = df[[date_col, cat_col]].copy()
            tmp[date_col] = pd.to_datetime(tmp[date_col], errors="coerce")
            tmp = tmp.dropna()
            if len(tmp) < 5:
                return None
            
            # Keep top 4 categories max to prevent chart from being messy
            top_cats = tmp[cat_col].value_counts().nlargest(4).index
            tmp[cat_col] = tmp[cat_col].where(tmp[cat_col].isin(top_cats), "Other")
            
            # Resample by Month
            grouped = tmp.groupby([pd.Grouper(key=date_col, freq="ME"), cat_col]).size().unstack(fill_value=0)
            if grouped.empty:
                return None
            
            data = []
            for date_idx, row in grouped.iterrows():
                item = {"date": str(date_idx)[:10]}
                for c in grouped.columns:
                    item[str(c)] = int(row[c])
                data.append(item)
            
            y_cols = [str(c) for c in grouped.columns]
            
            return {
                "id": f"area_stacked_{date_col}_{cat_col}",
                "type": "area",
                "title": f"Count by {cat_col.replace('_', ' ').title()} Over Time",
                "column": cat_col,
                "x_column": date_col,
                "y_columns": y_cols,
                "data": data,
                "options": {
                    "responsive": True,
                    "showLegend": True,
                    "showGrid": True,
                    "colors": colors[:len(y_cols)],
                    "variant": "stacked",
                },
            }
        except Exception as e:
            logger.warning(f"Stacked area failed for {date_col}, {cat_col}: {e}")
            return None

