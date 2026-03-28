# AI Data Dashboard Generator

## What This Is

A full-stack AI-powered data dashboard web application that allows users to upload CSV files, automatically analyze the data, generate interactive charts, and surface AI-powered business insights — akin to a mini Tableau / Power BI with an AI analyst embedded.

## Core Value

**The ONE thing that must work:** A user can drag-and-drop a CSV file and immediately see auto-generated charts and AI insights about their data — no configuration required.

## Context

- **Stage:** Greenfield — building from scratch
- **Team:** Solo developer / AI-assisted
- **Timeline:** MVP-first, iterative delivery
- **Constraints:**
  - OpenAI API key required for AI insights (user-provided)
  - Backend must handle large CSVs without blocking the UI
  - No raw CSV data sent to LLM (only structured summaries)

## Tech Stack

### Frontend
- Next.js 16 (App Router) — already scaffolded in `/frontend`
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- Recharts (chart rendering)
- @dnd-kit/core (drag-and-drop dashboard)
- Axios (API calls)

### Backend
- FastAPI (Python)
- Pandas (data processing)
- NumPy (optional numerical ops)
- OpenAI API (AI insights & Q&A)
- Uvicorn (ASGI server)

## Architecture

```
/frontend (Next.js App Router)
  /app
    page.tsx          — Landing page
    /dashboard
      page.tsx        — Main dashboard
  /components
    FileUpload.tsx
    DataTable.tsx
    ChartCard.tsx
    InsightPanel.tsx
    DashboardGrid.tsx
  /lib
    api.ts

/backend (FastAPI Python)
  main.py
  /routes
    upload.py
    analyze.py
    insights.py
  /services
    data_processor.py
    chart_generator.py
    ai_service.py
```

## API Surface

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/upload` | POST | Upload CSV → return columns, types, preview |
| `/analyze` | POST | Analyze dataset → summary stats, chart suggestions |
| `/insights` | POST | Send dataset summary → AI-generated insights |
| `/ask` | POST | Natural language Q&A about the data |

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can drag-and-drop or click-to-upload a CSV file
- [ ] Backend parses CSV with Pandas and returns column names, data types, and preview rows
- [ ] System auto-detects numeric, categorical, and datetime columns
- [ ] Backend generates summary statistics (mean, median, min, max, std) for numeric columns
- [ ] Backend suggests appropriate chart types per column type
- [ ] Frontend renders charts using Recharts (histogram, bar, line, time-series)
- [ ] AI generates 5 structured business insights from dataset summary
- [ ] Dashboard displays charts in a responsive card grid layout
- [ ] Dashboard displays insights in a side panel
- [ ] User can ask natural language questions about their data
- [ ] AI answers questions with text + optional chart
- [ ] User can drag-and-drop charts to rearrange dashboard layout
- [ ] User can export dashboard as PDF (charts + insights)
- [ ] Loading states (skeletons/spinners) shown during processing
- [ ] Basic filtering support on the dashboard
- [ ] Dark mode support
- [ ] Clean SaaS-quality UI design

### Out of Scope (v1)

- Authentication / user accounts — complexity vs. value tradeoff for MVP
- Saved dashboards (persistent storage) — deferred to v2
- Multi-file upload — single CSV per session for v1
- Real-time data streaming — batch processing only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| FastAPI + Next.js separate services | Clean separation, allows Python data science stack | Pending |
| No raw CSV to LLM | Privacy, cost, context window limits | Decided |
| Recharts over D3 | React-native, easier integration, sufficient capabilities | Decided |
| @dnd-kit over react-beautiful-dnd | Actively maintained, better accessibility | Decided |
| shadcn/ui components | Already installed in frontend scaffold | Decided |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-28 after initialization*
