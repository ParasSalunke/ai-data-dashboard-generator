---
id: "01-02"
phase: 1
wave: 2
plan: CSV Upload Endpoint
objective: Implement the POST /upload endpoint with streaming CSV upload to disk, chardet encoding detection, UUID-based dataset sessions, and Parquet storage.
requirements: UPLOAD-01, UPLOAD-02, UPLOAD-03, UPLOAD-04, UPLOAD-05, UPLOAD-06, UPLOAD-07, PERF-01, PERF-02
autonomous: true
depends_on: ["01-01"]
---

## Objective

Implement the complete `/upload` endpoint in `backend/routes/upload.py` and the CSV processing logic in `backend/services/data_processor.py`.

The endpoint must:
1. Accept multipart/form-data with a CSV `file` field
2. Validate content type (CSV only) and file size (≤100MB)
3. Stream the file directly to disk (never `await file.read()`)
4. Detect encoding with chardet
5. Parse CSV into Pandas DataFrame in a thread pool
6. Return `{ dataset_id, columns, types, preview, null_counts }`

## Tasks

### Task 1: Implement upload route (backend/routes/upload.py)
```python
POST /upload
- Input: UploadFile (multipart form)
- Validates: content_type is text/csv or application/vnd.ms-excel
- Validates: file size ≤ MAX_FILE_SIZE_MB (from env)
- Streams to disk: /tmp/datasets/{uuid}/original.csv using shutil.copyfileobj
- Calls DataProcessor.process_csv() in thread pool
- Returns: UploadResponse (dataset_id, columns info, preview rows)
```

Response model:
```python
class ColumnInfo(BaseModel):
    name: str
    dtype: Literal['numeric', 'categorical', 'datetime', 'boolean', 'unknown']
    null_count: int
    null_pct: float
    unique_count: int
    sample_values: list[Any]

class UploadResponse(BaseModel):
    dataset_id: str
    columns: list[ColumnInfo]
    preview: list[dict]  # first 50 rows
    row_count: int
    col_count: int
    file_size_bytes: int
```

### Task 2: Implement DataProcessor.process_csv() (backend/services/data_processor.py)
```python
def process_csv(self, file_path: Path, dataset_dir: Path) -> DatasetInfo:
    # 1. Detect encoding with chardet (sample first 10KB)
    # 2. Read CSV: pd.read_csv(engine='pyarrow', encoding=detected, on_bad_lines='skip')
    # 3. Infer column types (numeric/categorical/datetime)
    # 4. Save as Parquet: dataset_dir / 'data.parquet'
    # 5. Return DatasetInfo with all column metadata
```

Column type inference rules:
- `pd.api.types.is_numeric_dtype` AND cardinality > 10 → numeric
- `pd.api.types.is_numeric_dtype` AND cardinality ≤ 10 → categorical
- Successful `pd.to_datetime()` on ≥80% non-null values → datetime  
- Otherwise → categorical
- Boolean columns → boolean

### Task 3: Implement file utilities (backend/utils/file_utils.py)
```python
def get_dataset_dir(dataset_id: str) -> Path
def ensure_dataset_storage() -> None
def cleanup_old_datasets(ttl_hours: int) -> int
```

### Task 4: Add thread pool execution with anyio
Wrap all Pandas operations:
```python
result = await anyio.to_thread.run_sync(
    lambda: processor.process_csv(file_path, dataset_dir)
)
```

### Task 5: Error handling
- `UnsupportedFileType` → 400 with clear message
- `FileTooLarge` → 413 with size info
- `CSVParseError` → 422 with details
- All unexpected errors → 500 with logged traceback

## Key Files to Modify
- `backend/routes/upload.py` — full implementation
- `backend/services/data_processor.py` — process_csv() + DataProcessor class
- `backend/utils/file_utils.py` — dataset directory utilities
