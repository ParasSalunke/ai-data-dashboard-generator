---
id: "01-04"
phase: 1
wave: 1
plan: Next.js Foundation
objective: Set up the Next.js frontend foundation — layout, global styles, Zustand store, TypeScript types, and Axios API client. Install all required npm packages.
requirements: UI-01, UI-06
autonomous: true
---

## Objective

Set up the Next.js frontend (`/frontend/`) with:
- Install all required packages (recharts, @dnd-kit/sortable, zustand, @tanstack/react-query, axios, @react-pdf/renderer, html2canvas)
- TypeScript type definitions for all API responses
- Zustand store for dashboard state
- Axios API client with base URL configuration
- Updated layout.tsx with ThemeProvider, QueryClientProvider
- Landing page (/) stub
- Dashboard page (/dashboard) stub
- Global CSS with shadcn theme variables + custom design tokens
- shadcn components installed: card, button, badge, skeleton, table, scroll-area, tabs, separator, input, select, sheet, sidebar

## Tasks

### Task 1: Install npm packages
Run in `/frontend/`:
```bash
pnpm add recharts @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities zustand @tanstack/react-query axios next-themes
pnpm add @react-pdf/renderer html2canvas
pnpm add -D @types/html2canvas
```

### Task 2: Install shadcn components
Run in `/frontend/`:
```bash
pnpm dlx shadcn@latest add card button badge skeleton table scroll-area tabs separator input select sheet
```

### Task 3: Create TypeScript types (frontend/lib/types.ts)
```typescript
export interface ColumnInfo {
  name: string;
  dtype: 'numeric' | 'categorical' | 'datetime' | 'boolean' | 'unknown';
  null_count: number;
  null_pct: number;
  unique_count: number;
  sample_values: (string | number | null)[];
}

export interface UploadResponse {
  dataset_id: string;
  columns: ColumnInfo[];
  preview: Record<string, unknown>[];
  row_count: number;
  col_count: number;
  file_size_bytes: number;
}

export interface SummaryStats {
  column: string;
  mean?: number | null;
  median?: number | null;
  min?: number | null;
  max?: number | null;
  std?: number | null;
  top_values?: { value: string; count: number; pct: number }[];
  min_date?: string | null;
  max_date?: string | null;
}

export interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'histogram' | 'scatter' | 'pie' | 'timeseries';
  title: string;
  column: string;
  x_column?: string;
  y_columns?: string[];
  data: Record<string, string | number | null>[];
  options: {
    responsive: boolean;
    showLegend: boolean;
    showGrid: boolean;
    colors: string[];
  };
}

export interface Insight {
  title: string;
  content: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'summary' | 'recommendation';
}

export interface AnalyzeResponse {
  dataset_id: string;
  summary_stats: SummaryStats[];
  chart_suggestions: ChartConfig[];
}

export interface InsightsResponse {
  dataset_id: string;
  insights: Insight[];
}

export interface AskResponse {
  answer: string;
  chart?: ChartConfig;
}
```

### Task 4: Create Axios API client (frontend/lib/api.ts)
```typescript
import axios from 'axios';
import type { UploadResponse, AnalyzeResponse, InsightsResponse, AskResponse } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 60000,
});

export const uploadCSV = async (file: File): Promise<UploadResponse> => { ... }
export const analyzeDataset = async (datasetId: string): Promise<AnalyzeResponse> => { ... }
export const getInsights = async (datasetId: string): Promise<InsightsResponse> => { ... }
export const askQuestion = async (datasetId: string, question: string): Promise<AskResponse> => { ... }

export default api;
```

### Task 5: Create Zustand store (frontend/lib/store.ts)
```typescript
interface DashboardStore {
  datasetId: string | null;
  columns: ColumnInfo[];
  chartOrder: string[];
  activeFilters: Record<string, string[]>;
  sidebarOpen: boolean;
  setDatasetId: (id: string) => void;
  setColumns: (cols: ColumnInfo[]) => void;
  setChartOrder: (ids: string[]) => void;
  toggleFilter: (column: string, value: string) => void;
  clearFilters: () => void;
  setSidebarOpen: (open: boolean) => void;
}
```

### Task 6: Update layout.tsx
Add:
- QueryClientProvider from @tanstack/react-query
- ThemeProvider from next-themes
- Inter font from next/font/google
- Proper metadata (title, description)

### Task 7: Create landing page (frontend/app/page.tsx)
Hero section with:
- App name + tagline ("AI-Powered Data Dashboard")  
- Prominent call-to-action (upload area or button to go to dashboard)
- Feature highlights (3 cards: Auto Charts, AI Insights, Drag & Drop)
- Clean modern design using shadcn components
- Dark mode compatible

### Task 8: Create dashboard page stub (frontend/app/dashboard/page.tsx)
- Reads `?id=` from URL params
- Shows "Upload a CSV to get started" if no datasetId
- Placeholder layout with sidebar + main content area
- Will be fully implemented in Phase 2

### Task 9: Update globals.css
Add custom CSS variables:
- Chart color palette (8 distinct colors)
- Dashboard-specific spacing tokens
- Animation keyframes for skeleton pulse

## Key Files to Create/Modify
- `frontend/lib/types.ts` — TypeScript interfaces
- `frontend/lib/api.ts` — Axios API client
- `frontend/lib/store.ts` — Zustand store
- `frontend/app/layout.tsx` — Providers + font
- `frontend/app/page.tsx` — Landing page
- `frontend/app/dashboard/page.tsx` — Dashboard stub
- `frontend/app/globals.css` — Design tokens
