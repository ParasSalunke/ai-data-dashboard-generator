# Requirements — AI Data Dashboard Generator

## v1 Requirements

### Upload (UPLOAD)

- [ ] **UPLOAD-01**: User can drag-and-drop a CSV file onto the upload zone
- [ ] **UPLOAD-02**: User can click the upload zone to browse and select a CSV file
- [ ] **UPLOAD-03**: System validates file type (CSV only) and rejects non-CSV files with clear error
- [ ] **UPLOAD-04**: System validates file size (reject >100MB) with friendly message
- [ ] **UPLOAD-05**: System streams upload to backend without loading entire file into memory
- [ ] **UPLOAD-06**: System detects CSV encoding automatically (UTF-8, Latin-1, Windows-1252)
- [ ] **UPLOAD-07**: System returns `dataset_id` (UUID) to identify the session

### Data Detection (DETECT)

- [ ] **DETECT-01**: System auto-detects numeric columns from uploaded CSV
- [ ] **DETECT-02**: System auto-detects categorical columns from uploaded CSV
- [ ] **DETECT-03**: System auto-detects datetime columns from uploaded CSV
- [ ] **DETECT-04**: System returns column names, inferred types, null counts, and unique counts
- [ ] **DETECT-05**: System returns first 50 rows as preview data

### Analysis (ANALYSIS)

- [ ] **ANALYSIS-01**: System computes mean, median, min, max, std for all numeric columns
- [ ] **ANALYSIS-02**: System computes top-N value counts for categorical columns
- [ ] **ANALYSIS-03**: System generates chart type suggestions per column (histogram/bar/line/scatter/pie/timeseries)
- [ ] **ANALYSIS-04**: All Pandas operations run in a thread pool (not blocking async event loop)
- [ ] **ANALYSIS-05**: NaN and Infinity values are replaced with null before JSON serialization

### Charts (CHART)

- [ ] **CHART-01**: Frontend renders bar charts for categorical columns
- [ ] **CHART-02**: Frontend renders histogram-style bar charts for numeric distributions
- [ ] **CHART-03**: Frontend renders line charts for time-series (datetime + numeric column pairs)
- [ ] **CHART-04**: Frontend renders scatter charts for numeric vs numeric pairs
- [ ] **CHART-05**: Frontend renders pie charts for low-cardinality categorical columns
- [ ] **CHART-06**: All charts are responsive (use ResponsiveContainer)
- [ ] **CHART-07**: All charts have interactive tooltips showing exact values
- [ ] **CHART-08**: Charts auto-downsample to max 200 data points on backend
- [ ] **CHART-09**: Dashboard displays all suggested charts in a responsive card grid (1/2/3 columns)
- [ ] **CHART-10**: User can drag-and-drop chart cards to reorder them in the dashboard

### AI Insights (INSIGHT)

- [ ] **INSIGHT-01**: System generates exactly 5 AI-powered insights from dataset summary
- [ ] **INSIGHT-02**: Insights are written in plain business language (no jargon)
- [ ] **INSIGHT-03**: Each insight references specific data values (not generic statements)
- [ ] **INSIGHT-04**: No raw CSV data is sent to the LLM (structured summary only)
- [ ] **INSIGHT-05**: Dataset summary sent to LLM is capped at ~2000 tokens
- [ ] **INSIGHT-06**: Column names are sanitized before being included in LLM prompts

### AI Q&A (QA)

- [ ] **QA-01**: User can type a natural language question about the data
- [ ] **QA-02**: System returns a text answer grounded in actual data statistics
- [ ] **QA-03**: System optionally returns a chart configuration with the answer

### Dashboard UI (UI)

- [ ] **UI-01**: Dashboard has a clean, modern SaaS-quality design (dark mode support)
- [ ] **UI-02**: Dashboard shows skeleton loaders while charts/insights are loading
- [ ] **UI-03**: Dashboard shows an insight panel alongside the chart grid
- [ ] **UI-04**: Dashboard shows a data preview table (paginated, at least 50 rows visible)
- [ ] **UI-05**: User can apply basic column-level filters to the dashboard
- [ ] **UI-06**: Application is responsive across mobile, tablet, and desktop viewports

### Export (EXPORT)

- [ ] **EXPORT-01**: User can download the dashboard as a PDF report (charts + insights)
- [ ] **EXPORT-02**: User can download individual chart cards as PNG images

### Performance (PERF)

- [ ] **PERF-01**: Backend never loads entire CSV into memory; streams to disk first
- [ ] **PERF-02**: Processed datasets are stored as Parquet files for fast reloading
- [ ] **PERF-03**: All heavy Python operations run in thread pool to avoid blocking

## v2 Requirements (Deferred)

- User authentication and persistent accounts
- Save/name/reload dashboard sessions (database persistence)
- Multi-file upload and joining datasets
- Real-time data streaming (live dashboards)
- Chart resize (small/medium/large card options)
- Sharing dashboards via public URL
- OpenAI API key configured per-user (not server-wide)

## Out of Scope (v1)

- **Multi-user collaboration** — Single-user session model only; no shared state
- **SQL-based querying** — NL Q&A is the query interface; no raw SQL exposed
- **Data editing** — Read-only view of uploaded data; no write-back to CSV
- **Non-CSV file formats** — Excel, JSON, Parquet upload deferred to v2
- **Authentication** — No login required for MVP; simple session cookie approach
- **Database storage** — Disk-based Parquet files only; no PostgreSQL/MongoDB needed

## Traceability

| REQ-ID | Phase |
|--------|-------|
| UPLOAD-01 to UPLOAD-07 | Phase 1 |
| DETECT-01 to DETECT-05 | Phase 1 |
| ANALYSIS-01 to ANALYSIS-05 | Phase 2 |
| CHART-01 to CHART-09 | Phase 2 |
| UI-01, UI-02, UI-06 (base) | Phase 2 |
| INSIGHT-01 to INSIGHT-06 | Phase 3 |
| UI-03, UI-04, UI-05 | Phase 3 |
| CHART-10 | Phase 4 |
| QA-01 to QA-03 | Phase 4 |
| EXPORT-01 to EXPORT-02 | Phase 5 |
| PERF-01 to PERF-03 | Phase 1–2 |
