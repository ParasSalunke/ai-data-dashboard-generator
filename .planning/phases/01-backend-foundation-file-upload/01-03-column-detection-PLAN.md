---
id: "01-03"
phase: 1
wave: 2
plan: Column Detection Service
objective: Implement robust column type detection and summary statistics generation for numeric, categorical, and datetime columns.
requirements: DETECT-01, DETECT-02, DETECT-03, DETECT-04, DETECT-05, ANALYSIS-05
autonomous: true
depends_on: ["01-01"]
---

## Objective

Enhance `backend/services/data_processor.py` with comprehensive column analysis:
- Accurate dtype detection (numeric, categorical, datetime, boolean, unknown)  
- Summary statistics per column type
- NaN/Infinity handling before JSON serialization
- Sample value extraction

## Tasks

### Task 1: Column type detection algorithm
Implement in `DataProcessor._infer_column_type()`:

```python
def _infer_column_type(self, series: pd.Series) -> str:
    # Skip if all null
    if series.isna().all():
        return 'unknown'
    
    non_null = series.dropna()
    
    # Boolean check
    if set(non_null.unique()).issubset({True, False, 0, 1, 'True', 'False', 'true', 'false'}):
        return 'boolean'
    
    # Datetime check — try parsing sample
    if not pd.api.types.is_numeric_dtype(series):
        sample = non_null.head(100)
        try:
            parsed = pd.to_datetime(sample, infer_datetime_format=True)
            if parsed.notna().mean() >= 0.8:
                return 'datetime'
        except:
            pass
    
    # Numeric check
    if pd.api.types.is_numeric_dtype(series):
        # Low cardinality numerics → categorical
        if series.nunique() <= 10 and series.nunique() / len(series) < 0.05:
            return 'categorical'
        return 'numeric'
    
    return 'categorical'
```

### Task 2: Column statistics generation
Implement `DataProcessor.get_column_stats()`:

For **numeric** columns:
```python
{
    'mean': float | None,
    'median': float | None,
    'min': float | None,
    'max': float | None,
    'std': float | None,
    'percentile_25': float | None,
    'percentile_75': float | None
}
```

For **categorical** columns:
```python
{
    'top_values': [{'value': str, 'count': int, 'pct': float}],  # top 10
    'unique_count': int
}
```

For **datetime** columns:
```python
{
    'min_date': str | None,
    'max_date': str | None,
    'date_range_days': int | None
}
```

### Task 3: NaN/Infinity serialization guard
Implement `DataProcessor._safe_stats()`:

```python
def _safe_stats(self, value):
    """Replace NaN, Infinity, -Infinity with None for JSON safety."""
    if value is None:
        return None
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        return None
    return value
```

Apply recursively to all stats dicts before returning.

### Task 4: Sample values extraction
For the ColumnInfo.sample_values field:
- Numeric: [min, p25, median, p75, max] — up to 5 representative values
- Categorical: top 5 most frequent values (as strings)
- Datetime: [earliest, latest] as ISO strings

### Task 5: Update UploadResponse to include stats
Integrate column stats into the upload response so the frontend gets everything in one call.

## Key Files to Modify
- `backend/services/data_processor.py` — column inference, stats, NaN handling
