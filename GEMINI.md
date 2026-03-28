<!-- GSD:project-start source:PROJECT.md -->
## Project

**AI Data Dashboard Generator**

A full-stack AI-powered data dashboard web application that allows users to upload CSV files, automatically analyze the data, generate interactive charts, and surface AI-powered business insights — akin to a mini Tableau / Power BI with an AI analyst embedded.

**Core Value:** **The ONE thing that must work:** A user can drag-and-drop a CSV file and immediately see auto-generated charts and AI insights about their data — no configuration required.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

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
- Use `ResponsiveContainer` for responsive chart sizing
- Use `Tooltip`, `Legend`, `CartesianGrid` for polish
- Disable animations (`isAnimationActive={false}`) for PDF export
- Keep data points ≤ 500 per chart; downsample on backend if needed
## Drag-and-Drop Architecture
- `SortableContext` with `rectSortingStrategy` for grid layouts
- Each `ChartCard` wrapped in `useSortable` hook
- Store order as array of chart IDs in Zustand
- Tailwind grid handles visual layout; dnd-kit tracks logical order
## FastAPI Patterns
### File Upload
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
- Renders React component tree to proper PDF (not browser print hack)
- Works with chart images captured via `html2canvas`
- Flow: `html2canvas(chartRef)` → base64 image → `<Image>` in react-pdf document
## CORS Configuration
## Memory Optimization (Pandas)
# Explicit dtypes to save 50-70% memory
# Downcast numerics after loading
## What NOT to Use
| Avoid | Reason |
|-------|--------|
| `react-beautiful-dnd` | Deprecated, maintenance halted |
| Redux Toolkit | Overkill for this app's state complexity |
| `html2pdf.js` | Poor chart rendering quality |
| WebSockets for insights | SSE is simpler and sufficient |
| Raw `@dnd-kit/core` | Sortable provides better grid UX |
| `/tmp` in-memory dict | Lost on server restart; use disk |
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
