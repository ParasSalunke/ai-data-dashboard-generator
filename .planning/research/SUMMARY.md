# Research Summary — AI Data Dashboard Generator

## Stack Recommendations

**Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui + Recharts + @dnd-kit/sortable + Zustand + TanStack Query

**Backend:** FastAPI 0.115+ + Pandas 2.2+ (PyArrow engine) + OpenAI 1.x (Structured Outputs) + Uvicorn + chardet

**State architecture:** Zustand for UI/layout state; TanStack Query for all server data. Dataset persistence via Parquet files in `/tmp/datasets/{uuid}/` — no Redis/DB needed for MVP.

## Key Technical Decisions

| Decision | Chosen Approach | Rationale |
|----------|----------------|-----------|
| Pandas CPU ops | `anyio.to_thread.run_sync()` | Avoids blocking event loop |
| File streaming | `shutil.copyfileobj` | Prevents OOM on large files |
| Dataset session | UUID → Parquet on disk | No DB, survives page reload |
| AI output format | OpenAI Structured Outputs (Pydantic) | Zero JSON parsing errors |
| Drag-and-drop | @dnd-kit/sortable + rectSortingStrategy | Best grid sorting UX |
| PDF export | html2canvas + @react-pdf/renderer | Pixel-accurate chart capture |
| Chart performance | Backend downsampling to 200 pts max | Prevents SVG memory issues |

## Table Stakes Features

1. **Drag-and-drop CSV upload** with encoding auto-detection
2. **Automatic column type inference** (numeric / categorical / datetime)
3. **Auto-generated charts** — no manual configuration required
4. **AI-generated insights** in plain business language
5. **Responsive dashboard grid** with sortable chart cards
6. **Loading skeletons** for every async operation
7. **Data preview table** (paginated, sortable)

## Differentiating Features

1. **Natural language Q&A** — ask questions, get answers + charts
2. **Drag-and-drop chart reordering** — personalized dashboard layout
3. **PDF export** — download full report (charts + insights)
4. **Anomaly/trend highlighting** in AI insights

## Top Pitfalls to Prevent

1. **🔴 Event loop blocking** — Always run Pandas in thread pool
2. **🔴 Memory exhaustion** — Stream uploads to disk, never read all bytes
3. **🔴 LLM token overflow** — Build `build_dataset_summary()` → max 2K tokens
4. **🟠 CSV encoding errors** — Use `chardet` before `pd.read_csv()`
5. **🟠 NaN JSON serialization** — Replace NaN/Inf with None before returning
6. **🟠 Recharts SVG lag** — Downsample to 200 data points on backend

## Build Order (Phases)

```
Phase 1: Foundation
  → FastAPI setup (CORS, routing, error handling)
  → CSV upload (streaming, encoding, Parquet storage)
  → Column type detection
  → Next.js upload page + FileUpload.tsx
  → API client (types + axios)

Phase 2: Data Visualization
  → Analyze endpoint (summary stats + chart suggestions)
  → Chart generator service (all 6 chart types)
  → ChartCard + Recharts rendering
  → DashboardGrid layout
  → DataTable component (paginated)
  → Dark mode + base UI polish

Phase 3: AI Insights
  → Dataset summarizer (token-efficient)
  → OpenAI integration (structured outputs)
  → Insights endpoint
  → InsightPanel component
  → Filter bar (basic column filters)

Phase 4: Advanced Interactions
  → NL Q&A endpoint (/ask)
  → AskPanel component
  → @dnd-kit drag-and-drop rearrangement
  → Zustand layout persistence

Phase 5: Polish + Export
  → PDF export (html2canvas + react-pdf)
  → Individual chart PNG download
  → Performance optimizations (React.memo, memoization)
  → Temp file cleanup scheduler
  → Error boundaries + production hardening
```
