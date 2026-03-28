# Roadmap — AI Data Dashboard Generator

## Milestone 1: Full-Stack AI Dashboard MVP

**Goal:** Ship a working full-stack application where users can upload a CSV, get auto-generated charts, and receive AI-powered insights — the core value proposition.

**Requirements covered:** All v1 requirements (UPLOAD, DETECT, ANALYSIS, CHART, INSIGHT, QA, UI, EXPORT, PERF)

---

## Phase 1: Backend Foundation + File Upload

**Goal:** Stand up a production-ready FastAPI backend with CSV upload, streaming to disk, encoding detection, column type inference, and a working Next.js upload page connected to the API.

**Requirements:** UPLOAD-01–07, DETECT-01–05, PERF-01–03

**UI hint:** yes (Landing page + FileUpload component)

**Success criteria:**
1. User can drag a CSV onto the upload zone and see file progress indicator
2. Backend receives the file, detects encoding, parses column names and types
3. API returns `{ dataset_id, columns, types, preview }` JSON response
4. Frontend navigates to `/dashboard?id={dataset_id}` after successful upload
5. Upload fails gracefully for non-CSV files or files exceeding 100MB
6. Pandas processing runs in thread pool — no event loop blocking

**Plans:**
- 1.1: FastAPI project setup (main.py, CORS, routing, env config, requirements.txt)
- 1.2: CSV upload endpoint (streaming, chardet, Parquet storage, dataset_id)
- 1.3: Column detection service (dtype inference: numeric/categorical/datetime)
- 1.4: Next.js foundation (layout, globals, Zustand store, API client types)
- 1.5: FileUpload component (drag-and-drop, axios upload, progress, error states)

---

## Phase 2: Data Analysis + Chart Generation

**Goal:** Implement the analyze endpoint, chart suggestion engine, and full dashboard UI with Recharts rendering all chart types in a responsive card grid.

**Requirements:** ANALYSIS-01–05, CHART-01–09, UI-01, UI-02, UI-06

**UI hint:** yes (Dashboard page, ChartCard, DashboardGrid, DataTable)

**Success criteria:**
1. `/analyze` endpoint returns summary stats for numeric columns and top values for categorical
2. Backend suggests appropriate chart type per column (histogram/bar/line/scatter/pie/timeseries)
3. Dashboard renders all suggested charts as interactive Recharts cards
4. Charts are responsive and have tooltips showing exact values
5. All async operations show skeleton loaders while data loads
6. Dashboard works correctly across mobile (1-col), tablet (2-col), and desktop (3-col) layouts
7. Data preview table shows first 50 rows with column headers

**Plans:**
- 2.1: Analyze endpoint (summary stats by column type, PERF guards)
- 2.2: Chart generator service (ChartConfig schema, all 6 types, 200-pt downsampling)
- 2.3: ChartCard component (Recharts dynamic rendering by chart type)
- 2.4: DashboardGrid component (responsive Tailwind grid, skeleton loaders)
- 2.5: DataTable component (paginated table with TanStack Table)
- 2.6: Dark mode + global design system (shadcn theme, color palette, typography)

---

## Phase 3: AI Insights + Filtering

**Goal:** Integrate OpenAI to generate 5 structured business insights from dataset summaries, display them in an InsightPanel, and add basic column-level filtering to the dashboard.

**Requirements:** INSIGHT-01–06, UI-03, UI-04, UI-05

**UI hint:** yes (InsightPanel, InsightCard, FilterBar)

**Success criteria:**
1. `/insights` endpoint returns 5 AI-generated insights (OpenAI Structured Outputs)
2. Insights reference specific data values (not generic statements)
3. No raw CSV data is sent to OpenAI — only the structured summary
4. Dataset summary is capped at ~2000 tokens; prompt injection is sanitized
5. InsightPanel renders insights alongside the chart grid
6. User can filter dashboard charts by selecting column values in FilterBar
7. Loading skeleton shown in InsightPanel while AI generates

**Plans:**
- 3.1: Dataset summarizer service (token-efficient; column stats extraction; prompt injection guard)
- 3.2: AI service + insights endpoint (OpenAI client, Pydantic structured output, error handling)
- 3.3: InsightPanel + InsightCard components (type badge, content, animations)
- 3.4: FilterBar component (column-level filters stored in Zustand)

---

## Phase 4: AI Q&A + Drag-and-Drop

**Goal:** Add natural language question answering and @dnd-kit drag-and-drop chart reordering to complete the core interactive experience.

**Requirements:** QA-01–03, CHART-10

**UI hint:** yes (AskPanel, sortable DashboardGrid)

**Success criteria:**
1. User can type a question in the AskPanel and receive a text answer grounded in data
2. Answer optionally includes a chart rendered inline in AskPanel
3. User can drag chart cards to reorder them; order persists in Zustand
4. Drag-and-drop works correctly on mobile and desktop (touch + mouse)
5. `/ask` endpoint returns `{ answer, chart?: ChartConfig }` with structured output

**Plans:**
- 4.1: Ask endpoint (NL question → dataset context + OpenAI → answer + optional chart)
- 4.2: AskPanel component (question input, answer display, optional inline chart)
- 4.3: @dnd-kit/sortable integration in DashboardGrid (rectSortingStrategy, Zustand order)

---

## Phase 5: Export + Polish

**Goal:** Add PDF/PNG export, refine performance, add error boundaries, and ensure production-quality polish throughout the application.

**Requirements:** EXPORT-01–02, remaining UI polish

**UI hint:** yes (Export buttons, error boundary UI)

**Success criteria:**
1. User can click "Export PDF" and download a report with all charts and insights
2. User can download any individual chart as a PNG image
3. All charts render correctly in PDF (no blank rectangles)
4. Application has proper error boundaries — a failed chart doesn't crash the dashboard
5. React.memo applied to ChartCard; charts don't re-render unnecessarily
6. Temp file cleanup runs for datasets older than 2 hours

**Plans:**
- 5.1: Chart PNG export (html2canvas capture per ChartCard)
- 5.2: PDF export (html2canvas captures → @react-pdf/renderer document)
- 5.3: Error boundaries + production hardening (error UI, retry buttons, API error codes)
- 5.4: Performance pass (React.memo on ChartCard, useMemo for chart data, temp file cleanup)

---

## Requirement Traceability

| Phase | Requirements |
|-------|-------------|
| Phase 1 | UPLOAD-01–07, DETECT-01–05, PERF-01–03 |
| Phase 2 | ANALYSIS-01–05, CHART-01–09, UI-01, UI-02, UI-06 |
| Phase 3 | INSIGHT-01–06, UI-03, UI-04, UI-05 |
| Phase 4 | QA-01–03, CHART-10 |
| Phase 5 | EXPORT-01–02, UI polish |

**Coverage:** 100% of all v1 requirements mapped ✓

---

*Created: 2026-03-28 | Milestone 1 | 5 phases | 18 plans*
