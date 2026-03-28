# Architecture Research — AI Data Dashboard Generator

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (Next.js 16 App Router)                            │
│                                                              │
│  /app/page.tsx (Landing + Upload)                           │
│  /app/dashboard/page.tsx (Dashboard View)                   │
│                                                              │
│  State: Zustand (layout) + TanStack Query (server data)     │
└─────────────────────┬───────────────────────────────────────┘
                       │ HTTP / Axios
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  FastAPI Backend (Python)                                    │
│                                                              │
│  POST /upload  ──► data_processor.py ──► /tmp/{uuid}.parq   │
│  POST /analyze ──► data_processor.py + chart_generator.py   │
│  POST /insights──► ai_service.py (OpenAI structured output) │
│  POST /ask     ──► ai_service.py (NL → answer + chart)      │
└──────────────────────────────────────────────────────────────
```

## State Management Architecture

### Zustand — Global UI / Layout State
```typescript
interface DashboardStore {
  datasetId: string | null;
  columns: ColumnInfo[];
  chartOrder: string[];  // chart IDs in display order
  activeFilters: Record<string, FilterValue>;
  sidebarOpen: boolean;
  darkMode: boolean;
  setDatasetId: (id: string) => void;
  setChartOrder: (ids: string[]) => void;
  toggleFilter: (column: string, value: FilterValue) => void;
}
```

### TanStack Query — Server State
```typescript
// Upload mutation
const uploadMutation = useMutation({
  mutationFn: (file: File) => api.uploadCSV(file),
  onSuccess: (data) => setDatasetId(data.dataset_id),
});

// Analysis query (enabled after upload)
const analysisQuery = useQuery({
  queryKey: ['analysis', datasetId],
  queryFn: () => api.analyzeDataset(datasetId),
  enabled: !!datasetId,
  staleTime: Infinity,  // analysis doesn't change
});

// Insights query (enabled after analysis)
const insightsQuery = useQuery({
  queryKey: ['insights', datasetId],
  queryFn: () => api.getInsights(datasetId),
  enabled: !!datasetId && analysisQuery.isSuccess,
});
```

## Data Flow

```
1. User drops CSV file
   └─► FileUpload component
         ├─► POST /upload (FormData)
         │     └─► Returns: { dataset_id, columns, types, preview }
         └─► Store dataset_id in Zustand
               └─► Navigate to /dashboard

2. Dashboard loads with dataset_id
   ├─► POST /analyze (dataset_id)
   │     └─► Returns: { summary_stats, chart_suggestions }
   │           └─► Render ChartCards in DashboardGrid
   └─► POST /insights (dataset_id)
         └─► Returns: { insights: string[] }
               └─► Render InsightPanel

3. User asks question
   └─► POST /ask { question, dataset_id }
           └─► Returns: { answer, chart?: ChartConfig }
                 ├─► Show answer text
                 └─► Conditionally render ChartCard
```

## Backend Session Architecture

### Upload Endpoint
```
POST /upload
├─► Validate file (type, size)
├─► Stream to disk: /tmp/datasets/{uuid4()}.csv
├─► Detect encoding (chardet)
├─► Process in thread pool (anyio.to_thread.run_sync):
│     ├─► pd.read_csv(engine='pyarrow')
│     ├─► Detect column types
│     └─► Save as Parquet: /tmp/datasets/{uuid}.parquet
└─► Return: { dataset_id, columns, types, preview[:50] }
```

### Analyze Endpoint
```
POST /analyze { dataset_id }
├─► Load Parquet from /tmp/datasets/{dataset_id}.parquet
├─► Run in thread pool:
│     ├─► Generate summary_stats per column type
│     └─► Generate chart_suggestions per column
└─► Return: { summary_stats, chart_suggestions }
```

## Chart Configuration Schema (TypeScript)

```typescript
interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'histogram' | 'scatter' | 'pie' | 'timeseries';
  title: string;
  column: string;               // primary column
  x_column?: string;            // for scatter/time-series
  y_columns?: string[];         // for multi-line
  data: ChartDataPoint[];
  options: {
    responsive: boolean;
    showLegend: boolean;
    showGrid: boolean;
    colors: string[];
  };
}

interface ChartDataPoint {
  [key: string]: string | number | null;
}
```

## Pydantic Models (Python Backend)

```python
class ColumnInfo(BaseModel):
    name: str
    dtype: Literal['numeric', 'categorical', 'datetime', 'boolean', 'unknown']
    null_count: int
    null_pct: float
    unique_count: int
    sample_values: list[Any]

class SummaryStats(BaseModel):
    column: str
    mean: float | None = None
    median: float | None = None
    min: float | None = None
    max: float | None = None
    std: float | None = None
    top_values: list[dict] | None = None  # for categorical

class Insight(BaseModel):
    title: str
    content: str
    type: Literal['trend', 'anomaly', 'correlation', 'summary', 'recommendation']

class InsightsResponse(BaseModel):
    insights: list[Insight]

class AskResponse(BaseModel):
    answer: str
    chart: ChartConfig | None = None
```

## Component Architecture

```
app/dashboard/page.tsx
├─► DashboardGrid           (Zustand: chartOrder, filters)
│     └─► [ChartCard]       (receives ChartConfig, dragId)
│           ├─► Recharts component (dynamic by chart type)
│           └─► ChartCard toolbar (download, resize)
├─► InsightPanel            (TanStack Query: insightsQuery)
│     └─► [InsightCard]     (title, content, type badge)
├─► FilterBar               (Zustand: activeFilters)
├─► AskPanel                (local state: question, answer)
│     └─► ChartCard         (conditionally rendered)
└─► DataTable               (TanStack Query: previewQuery)
```

## @dnd-kit Integration with Tailwind Grid

```typescript
// DashboardGrid.tsx
const DashboardGrid = () => {
  const { chartOrder, setChartOrder } = useDashboardStore();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = chartOrder.indexOf(active.id as string);
      const newIndex = chartOrder.indexOf(over?.id as string);
      setChartOrder(arrayMove(chartOrder, oldIndex, newIndex));
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={chartOrder} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {chartOrder.map(id => (
            <SortableChartCard key={id} id={id} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
```

## Suggested Build Order

```
Phase 1: Foundation
  1. FastAPI setup (main.py, CORS, routes)
  2. File upload endpoint (streaming, Pandas processing)
  3. Next.js upload page (FileUpload.tsx)
  4. API client (lib/api.ts)

Phase 2: Analysis + Charts
  5. Analyze endpoint (stats + chart suggestions)
  6. Chart generator service
  7. ChartCard + DashboardGrid components
  8. Recharts rendering for all chart types

Phase 3: AI Insights
  9. AI service (OpenAI integration)
  10. Insights endpoint
  11. InsightPanel component

Phase 4: AI Chat + Drag-and-Drop
  12. Ask endpoint
  13. AskPanel component
  14. @dnd-kit integration in DashboardGrid

Phase 5: Polish
  15. DataTable with pagination
  16. FilterBar
  17. PDF export
  18. Dark mode
```

## Error Boundaries and Loading Patterns

- Each async section wrapped in React Suspense + error boundary
- Skeleton components pre-built for: ChartCard, InsightCard, DataTable
- Upload errors shown inline in drop zone (not toast)
- API errors caught in TanStack Query → shown in error UI components
- FastAPI returns structured errors: `{ detail: string, error_code: string }`
