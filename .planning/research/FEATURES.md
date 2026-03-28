# Features Research — AI Data Dashboard Generator

## Table Stakes (Must Have — Users Will Leave Without These)

### File Upload
- **Drag-and-drop CSV upload** — Standard UX; click-to-browse as fallback
- **Instant validation feedback** — File type check, size limit, encoding detection
- **Upload progress indicator** — For files > 1MB, users need to see progress
- **Preview of uploaded data** — First N rows shown in table before submitting for analysis
- **Error messaging** — Clear, specific errors ("Invalid column found", "File too large")

### Data Type Detection
- **Automatic column type inference** — Numeric, Categorical, Datetime detected instantly
- **Type override ability** — User can correct misidentified types (ZIP code detected as numeric)
- **Missing value reporting** — Show % null per column; flag columns with >50% missing

### Chart Generation
- **Automatic chart selection** — System picks appropriate chart per column type (no manual config)
- **Multiple chart types** — Bar, line, histogram, scatter, pie
- **Responsive charts** — Work on mobile/tablet screens
- **Interactive tooltips** — Hover for data point values
- **Chart titles and axis labels** — Every chart auto-labeled with column names

### Data Preview
- **Paginated data table** — Not just first 5 rows; at least 50-100 rows with pagination
- **Column sorting** — Click header to sort ascending/descending
- **Column statistics** — Min, max, mean, median, std visible per column

### AI Insights
- **5+ auto-generated insights** — Triggered automatically after analysis
- **Plain language** — No jargon; business-friendly phrasing
- **Specific references** — Insight must cite actual data values (not generic)
- **Loading state** — Clear indicator while AI is generating

## Differentiators (Competitive Advantage)

### Natural Language Query (AI Chat)
- **"Ask your data" input** — Freeform question → data-driven answer
- **Answer with chart** — NL question generates a relevant chart on demand
- **Conversation history** — Follow-up questions maintain context
- **Suggested questions** — Prebuilt questions like "What's the top category?" to guide users

### AI Insight Quality
- **Anomaly detection** — AI flags unusual data points ("Sales spiked 180% in March")
- **Trend identification** — AI surfaces trends across datetime axes
- **Correlation hints** — AI suggests relationships between columns
- **Actionable framing** — Insights phrased as "Consider X because Y" not just "X is high"

### Dashboard Customization
- **Drag-and-drop chart reordering** — Users arrange charts to their priority
- **Chart resize** — Small/medium/large card sizes (nice-to-have v2)
- **Pin/favorite charts** — Mark important charts to always show at top

### Export & Sharing
- **PDF export** — Download a clean report with all charts + insights
- **Chart PNG export** — Download individual charts as images
- **Copy insight text** — Clipboard support for insight copy

### Performance Features
- **Large file support** — Handle CSV files up to 100MB without crashing
- **Skeleton loaders** — Every async operation has loading placeholders
- **Background processing** — Analysis doesn't block UI thread

## Anti-Features (Deliberately Avoid)

| Anti-Feature | Why | Alternative |
|-------------|-----|-------------|
| Requiring SQL knowledge | Defeats AI-assisted purpose | NL query interface |
| Static non-interactive charts | 2026 baseline expectation | Always use Recharts tooltips |
| Black-box AI insights | Users don't trust unexplained claims | Reference specific data values |
| Raw CSV sent to OpenAI | Privacy/cost/token limits | Structured summary only |
| Mandatory login for MVP | Friction kills adoption | Session-based, no auth for MVP |
| Full-page loading states | Feels unresponsive | Component-level skeletons |
| Manual chart configuration | Eliminates the core value prop | Full automation required |
| Paginating charts (not data) | Hides value; show all charts | Show all auto-generated charts |

## Feature Complexity Map

| Feature | Complexity | Phase Suggestion |
|---------|-----------|-----------------|
| CSV upload + preview | Low | Phase 1 |
| Column type detection | Low | Phase 1 |
| Summary statistics | Low | Phase 1 |
| Chart generation (auto) | Medium | Phase 2 |
| AI insights generation | Medium | Phase 3 |
| Dashboard grid layout | Medium | Phase 2 |
| Drag-and-drop rearrange | Medium | Phase 4 |
| NL question answering | High | Phase 4 |
| PDF export | High | Phase 5 |
| Dark mode | Low | Phase 2 |
| Basic filtering | Medium | Phase 3 |

## Dependencies Between Features

```
CSV Upload
  └─► Column Detection
        └─► Summary Stats
              └─► Chart Generation ──► Dashboard Grid ──► Drag-and-Drop
              └─► AI Insights
                    └─► NL Q&A
```

Dark mode: Independent, can be added anytime.
PDF export: Depends on charts and insights being pre-rendered.
