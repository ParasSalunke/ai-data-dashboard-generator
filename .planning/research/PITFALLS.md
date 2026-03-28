# Pitfalls Research — AI Data Dashboard Generator

## 🔴 Critical Pitfalls (Address in Phase 1-2)

### 1. Event Loop Blocking (FastAPI)
- **Warning sign:** API becomes unresponsive while processing CSV; all requests queue behind one analysis
- **Prevention:** Wrap ALL Pandas/NumPy operations in `anyio.to_thread.run_sync()`:
  ```python
  result = await anyio.to_thread.run_sync(
      lambda: process_csv(file_path), cancellable=True
  )
  ```
- **Phase:** Phase 1 (Upload endpoint)

### 2. Memory Exhaustion on Large CSVs
- **Warning sign:** `MemoryError` or OOM kill on server for files >100MB
- **Prevention:** 
  - Stream upload to disk using `shutil.copyfileobj` (never use `await file.read()`)
  - Use `pd.read_csv(chunksize=10000)` for very large files
  - Convert to Parquet after initial load (5-10x smaller, faster subsequent reads)
  ```python
  import shutil
  with open(dest_path, 'wb') as f:
      shutil.copyfileobj(file.file, f)
  ```
- **Phase:** Phase 1

### 3. LLM Token Limit Exceeded
- **Warning sign:** `openai.BadRequestError: This model's maximum context length is 4097 tokens`
- **Prevention:** Build a dedicated `build_dataset_summary()` function:
  - Column names + types: ~5 tokens each
  - Stats per numeric column: ~50 tokens each
  - Top 5 values for categorical: ~30 tokens each
  - Cap total to 2000 tokens per prompt; truncate stats for wide datasets
- **Phase:** Phase 3 (AI service)

## 🟠 High-Impact Pitfalls (Address in Phase 2-3)

### 4. CSV Encoding Issues
- **Warning sign:** `UnicodeDecodeError: 'utf-8' codec can't decode byte` on European datasets
- **Prevention:** Detect encoding before reading:
  ```python
  import chardet
  with open(path, 'rb') as f:
      raw = f.read(10000)  # sample first 10KB
  encoding = chardet.detect(raw)['encoding']
  df = pd.read_csv(path, encoding=encoding or 'utf-8', on_bad_lines='skip')
  ```
- **Phase:** Phase 1

### 5. Pandas Dtype Inference Failures
- **Warning sign:** ZIP codes treated as numeric (05024 → 5024), IDs treated as floats
- **Prevention:** Use `pd.api.types` checks AFTER loading; never trust raw dtype for business logic:
  ```python
  # Treat low-cardinality integers as potentially categorical
  if col.nunique() / len(col) < 0.05:
      inferred_type = 'categorical'
  ```
- **Phase:** Phase 1 (data_processor.py)

### 6. NaN Handling in Statistics
- **Warning sign:** `json.JSONEncoder cannot serialize NaN/Infinity`; FastAPI 500 errors
- **Prevention:** Replace NaN before JSON serialization:
  ```python
  stats_dict = df.describe().replace({float('nan'): None, float('inf'): None})
  ```
- **Phase:** Phase 2

### 7. Date Parsing Ambiguity
- **Warning sign:** European dates (01/02/2024 = Feb 1 or Jan 2?) parsed incorrectly
- **Prevention:** Tell users which format was detected; offer correction UI:
  ```python
  df[col] = pd.to_datetime(df[col], infer_datetime_format=True, dayfirst=False)
  ```
- **Phase:** Phase 1 (flag ambiguous datetime columns)

## 🟡 Medium-Impact Pitfalls (Address in Phase 4-5)

### 8. Recharts SVG Performance with Many Data Points
- **Warning sign:** Browser freezes or drops frames with >500 SVG nodes
- **Prevention:** 
  - Downsample data on backend before sending to frontend (max 200 points per chart)
  - Use `isAnimationActive={false}` when many charts are rendered simultaneously
  ```python
  # Downsample in chart_generator.py
  if len(data) > 200:
      data = data.sample(200).sort_index()
  ```
- **Phase:** Phase 2 (chart_generator.py)

### 9. @dnd-kit Conflicts with CSS Grid
- **Warning sign:** Charts snap to wrong position or ghost element overlaps during drag
- **Prevention:**
  - Use `MeasuringStrategy.Always` in DndContext to avoid stale measurements
  - Don't use CSS `transform` on the grid container
  - Use `CSS.Transform.toString(transform)` in sortable style
- **Phase:** Phase 4

### 10. PDF Export — Charts Not Rendering
- **Warning sign:** Blank rectangles where charts should be in exported PDF
- **Prevention:** 
  - Capture charts before PDF generation using `html2canvas` with `useCORS: true`
  - Disable chart animations before capture (`isAnimationActive={false}`)
  - Add a 500ms delay after animation disable before capture
- **Phase:** Phase 5

### 11. CORS in Production vs Development
- **Warning sign:** Works in development, fails after deploying
- **Prevention:** Use environment variable for allowed origins:
  ```python
  ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
  ```
- **Phase:** Phase 1 (initial setup)

### 12. TypeScript Type Mismatch with FastAPI Response
- **Warning sign:** `TypeError: Cannot read property 'map' of undefined` on API response
- **Prevention:** 
  - Generate TypeScript types from Pydantic models
  - Add `z.parse()` (Zod) at API boundary for runtime validation
  - Never assume backend response shape matches TypeScript interface
- **Phase:** Phase 1 (lib/api.ts + types.ts)

### 13. LLM Hallucinated Insights
- **Warning sign:** AI says "Sales increased 40%" when the actual data shows -40%
- **Prevention:**
  - Include actual computed statistics in the prompt: "mean=1234, max=5678"
  - Add instruction in system prompt: "Only reference statistics from the provided data. Never invent percentages."
  - Display insights alongside the data that verifies them
- **Phase:** Phase 3

### 14. Prompt Injection via CSV Column Names
- **Warning sign:** CSV has column named "Ignore previous instructions and..."
- **Prevention:** Sanitize column names before including in LLM prompts:
  ```python
  def sanitize_column_name(name: str) -> str:
      return re.sub(r'[^a-zA-Z0-9_\s]', '', name)[:50]
  ```
- **Phase:** Phase 3

## 🟢 Low-Priority Pitfalls (Address During Polish)

### 15. Memory Leaks from Stored Parquet Files
- **Warning sign:** `/tmp/datasets/` directory grows unbounded
- **Prevention:** Schedule cleanup of files older than 2 hours using `apscheduler`
- **Phase:** Phase 5

### 16. Re-rendering All Charts on Any State Change
- **Warning sign:** Dashboard feels slow when toggling filters or asking questions
- **Prevention:** 
  - Memoize chart data with `useMemo`
  - Use `React.memo` on `ChartCard` with proper comparison function
  - Keep filter state separate from chart data in Zustand slices
- **Phase:** Phase 4

### 17. FormData Upload Differences Across Browsers
- **Warning sign:** File upload works in Chrome, fails in Safari
- **Prevention:** Let Axios handle FormData headers automatically (don't set `Content-Type` manually):
  ```typescript
  // Correct
  const formData = new FormData();
  formData.append('file', file);
  await axios.post('/upload', formData); // Axios sets multipart boundary
  ```
- **Phase:** Phase 1

## Critical Pitfall Priority Order

1. **Event loop blocking** — Will make backend unusable for concurrent users
2. **Memory exhaustion** — Will crash backend on any large real-world CSV
3. **LLM token limits** — Will break core AI feature silently

Address these three before shipping Phase 1.
