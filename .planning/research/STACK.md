# Tech Stack Recommendations — AI Data Dashboard Generator

## Library Version Matrix

| Library | Recommended Version | Rationale | Confidence |
|---------|---------------------|-----------|------------|
| Next.js | 16.x (App Router) | Already scaffolded; App Router gives RSC, streaming, nested layouts | High |
| TypeScript | 5.x | Type safety across frontend; required for shadcn/ui | High |
| Tailwind CSS | 4.x | Already installed; utility-first, JIT, excellent DX | High |
| shadcn/ui | Latest | Already installed; built on Radix; unstyled accessible components | High |
| Recharts | 2.x / 3.x | Native React, TypeScript support, works with shadcn chart wrappers | High |
| @dnd-kit/sortable | 8.x | More suitable than `@dnd-kit/core` alone for grid sorting | High |
| Zustand | 5.x | Lightweight global state for dashboard layout + session data | High |
| TanStack Query | 5.x | Server state management — caching, loading, polling | High |
| Axios | 1.x | HTTP client; interceptors useful for auth/error handling | Medium |
| @react-pdf/renderer | 3.x | Programmatic PDF generation of charts + insights | Medium |
| FastAPI | 0.115+ | Async Python web framework, pydantic v2, excellent file upload | High |
| Pandas | 2.2+ | Data processing; use PyArrow engine for performance | High |
| NumPy | 2.x | Statistics support alongside Pandas | High |
| Uvicorn | 0.30+ | ASGI server; use with gunicorn in production | High |
| python-multipart | 0.0.9+ | Required for FastAPI file upload (UploadFile) | High |
| chardet | 5.x | CSV encoding detection (handles UTF-8 / Latin-1 / Windows-1252) | High |
| openai | 1.x | Official Python client; supports structured outputs, streaming | High |

## Component Recommendations

### shadcn/ui for Dashboard
- `Card`, `CardHeader`, `CardContent` — chart card wrappers
- `Table`, `TableHeader`, `TableRow`, `TableCell` — data preview table
- `Sidebar` — navigation sidebar (optional)
- `Skeleton` — loading placeholders
- `Badge` — column type indicators
- `Button`, `Input`, `Select` — filter controls
- `ScrollArea` — insight panel scrolling
- `Separator`, `Tabs` — dashboard layout sections
- `Sheet` — slide-over panels (mobile-friendly filters)

### Recharts Chart Types
| Data Pattern | Chart Type | Recharts Component |
|-------------|-----------|-------------------|
| Numeric distribution | Histogram | `BarChart` (bucketed) |
| Category counts | Bar chart | `BarChart` |
| Two numerics | Scatter plot | `ScatterChart` |
| Datetime + numeric | Time-series | `LineChart` with DateAxisTick |
| Part-of-whole | Pie chart | `PieChart` |
| Trend over index | Line chart | `LineChart` |

**Best practices:**
- Use `ResponsiveContainer` for responsive chart sizing
- Use `Tooltip`, `Legend`, `CartesianGrid` for polish
- Disable animations (`isAnimationActive={false}`) for PDF export
- Keep data points ≤ 500 per chart; downsample on backend if needed

## Drag-and-Drop Architecture

**Use `@dnd-kit/sortable`** (not raw `@dnd-kit/core`) for grid rearrangement:
- `SortableContext` with `rectSortingStrategy` for grid layouts
- Each `ChartCard` wrapped in `useSortable` hook
- Store order as array of chart IDs in Zustand
- Tailwind grid handles visual layout; dnd-kit tracks logical order

## FastAPI Patterns

### File Upload
```python
@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    # 1. Validate content type
    # 2. Save to /tmp/datasets/{uuid}.csv using shutil.copyfileobj (streaming!)
    # 3. Process with Pandas in thread pool (run_in_executor)
    # 4. Return dataset_id + column info
```

### Large File Handling
- Use `anyio.to_thread.run_sync()` for CPU-bound Pandas operations
- Never use `await file.read()` for large files — stream to disk instead
- Use `pd.read_csv(engine='pyarrow', dtype_backend='numpy_nullable')` for performance

### Session / State
- Upload returns `dataset_id` (UUID4)
- Files stored at `/tmp/datasets/{dataset_id}.parquet` (converted from CSV for fast reloading)
- All subsequent endpoints accept `dataset_id` in request body
- No Redis/DB needed for MVP; temp files cleaned up after X hours

## OpenAI Integration Strategy

### Structured Outputs (preferred over function calling)
```python
response = client.beta.chat.completions.parse(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": prompt}],
    response_format=InsightsResponse  # Pydantic model
)
```

### Prompt Strategy (per PRD requirements)
- Never send raw CSV data
- Send: column names, inferred types, summary stats, sample trends
- Use `gpt-4o-mini` for insights (cost-effective), `gpt-4o` for complex Q&A

### Token Budget for Dataset Summary
- Column names: ~5 tokens per column
- Summary stats: ~50 tokens per numeric column
- Value samples (categorical): ~30 tokens per column
- Total for typical 10-column dataset: ~500 tokens input → safe for all models

## PDF Export

**Recommended: `@react-pdf/renderer`**
- Renders React component tree to proper PDF (not browser print hack)
- Works with chart images captured via `html2canvas`
- Flow: `html2canvas(chartRef)` → base64 image → `<Image>` in react-pdf document

**Alternative: `react-to-print`** for simple browser-native print-to-PDF

## CORS Configuration

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Memory Optimization (Pandas)

```python
# Explicit dtypes to save 50-70% memory
df = pd.read_csv(
    path,
    engine='pyarrow',
    dtype_backend='numpy_nullable',
    on_bad_lines='skip',
)
# Downcast numerics after loading
for col in df.select_dtypes('number'):
    df[col] = pd.to_numeric(df[col], downcast='float')
```

## What NOT to Use

| Avoid | Reason |
|-------|--------|
| `react-beautiful-dnd` | Deprecated, maintenance halted |
| Redux Toolkit | Overkill for this app's state complexity |
| `html2pdf.js` | Poor chart rendering quality |
| WebSockets for insights | SSE is simpler and sufficient |
| Raw `@dnd-kit/core` | Sortable provides better grid UX |
| `/tmp` in-memory dict | Lost on server restart; use disk |
