# 🎨 Frontend — AI Data Dashboard Generator

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1.7-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8?style=for-the-badge&logo=tailwind-css)
![React](https://img.shields.io/badge/React-19.x-61dafb?style=for-the-badge&logo=react)

**Next.js 16 App Router front-end for the AI-powered data dashboard.**

</div>

---

## 📖 Overview

The frontend is a **Next.js 16 App Router** application written in **TypeScript** with **Tailwind CSS 4** for styling and **shadcn/ui** for accessible component primitives. It provides:

- A **landing page** with a drag-and-drop CSV upload zone
- A **dashboard page** with auto-generated interactive charts, AI insights, and Q&A
- A **dark/light theme** system via `next-themes`
- A **drag-and-drop grid** for rearranging charts via `@dnd-kit/sortable`

---

## 📁 Project Structure

```
frontend/
├── app/
│   ├── layout.tsx               # Root layout: font loading, ThemeProvider
│   ├── page.tsx                 # Landing page (hero + FileUpload + feature cards)
│   ├── providers.tsx            # ReactQueryClientProvider + ThemeProvider wrapper
│   ├── globals.css              # Global styles, CSS variables, dark mode tokens
│   └── dashboard/
│       ├── page.tsx             # Dashboard route (Suspense boundary)
│       └── DashboardContent.tsx # Full dashboard UI (charts, insights, Q&A, table)
│
├── components/
│   ├── FileUpload.tsx           # Drag & drop upload zone with progress bar
│   ├── ChartCard.tsx            # Universal chart renderer for all 8 chart types
│   ├── DashboardGrid.tsx        # dnd-kit SortableContext grid wrapper
│   ├── DataTable.tsx            # Paginated data preview table
│   ├── InsightPanel.tsx         # AI insights sidebar (5 categorized cards)
│   ├── AskPanel.tsx             # Natural language Q&A panel
│   ├── theme-provider.tsx       # next-themes ThemeProvider wrapper
│   └── ui/                      # shadcn/ui generated components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── skeleton.tsx
│       ├── table.tsx
│       └── ...
│
├── lib/
│   ├── api.ts                   # Axios instance + typed API functions
│   ├── store.ts                 # Zustand global dashboard state
│   ├── types.ts                 # TypeScript interfaces (shared with API)
│   └── utils.ts                 # cn() utility for class merging
│
├── hooks/                       # Custom React hooks (reserved for future use)
├── public/                      # Static assets
│
├── next.config.mjs              # Next.js config (API rewrites → backend)
├── tsconfig.json                # TypeScript config
├── tailwind.config (embedded)   # Tailwind 4 uses CSS-based config
├── postcss.config.mjs           # PostCSS + Tailwind plugin
├── components.json              # shadcn/ui configuration
└── package.json                 # Dependencies & scripts
```

---

## 🛠️ Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| **Next.js** | 16.1.7 | App Router, SSR, API rewrites |
| **React** | 19.x | UI framework |
| **TypeScript** | 5.x | Static typing throughout |
| **Tailwind CSS** | 4.x | Utility-first CSS (JIT) |
| **shadcn/ui** | Latest | Radix-based accessible components |
| **Recharts** | 3.x | Chart library (8 chart types) |
| **@dnd-kit/sortable** | 10.x | Drag-and-drop grid layout |
| **Zustand** | 5.x | Lightweight global state |
| **TanStack Query** | 5.x | Server state, caching, loading states |
| **Axios** | 1.x | HTTP client with interceptors |
| **next-themes** | 0.4.x | Dark/light theme management |
| **lucide-react** | 1.7.x | Icon library |

---

## ⚡ Getting Started

### Prerequisites

- **Node.js 18+**
- **pnpm** (recommended) — `npm install -g pnpm`

### Installation

```bash
cd frontend
pnpm install
```

### Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
# Point to the backend (Next.js rewrites proxy /api → backend)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> **Note:** In development, Next.js rewrites `/api/*` to `http://localhost:8000/*` via `next.config.mjs`. You usually don't need to change anything.

### Development Server

```bash
pnpm dev       # Start with Turbopack (fast HMR)
```

Open [http://localhost:3000](http://localhost:3000).

### Other Commands

```bash
pnpm build       # Production build
pnpm start       # Start production server
pnpm lint        # ESLint
pnpm format      # Prettier format all .ts/.tsx
pnpm typecheck   # TypeScript check without emitting
```

---

## 🧩 Component Breakdown

### `FileUpload.tsx`

The drag-and-drop upload zone on the landing page.

- Accepts `.csv` files via drag-drop or click-to-browse
- Shows upload progress via Axios `onUploadProgress`
- Validates file type client-side before sending
- Calls `uploadCSV()` from `lib/api.ts`, then redirects to `/dashboard?id=<dataset_id>`

### `ChartCard.tsx`

Universal chart renderer supporting **8 chart types**:

| Type | Recharts Component | Used For |
|------|--------------------|----------|
| `bar` | `BarChart` | Category counts |
| `histogram` | `BarChart` (bucketed) | Numeric distributions |
| `pie` | `PieChart` | Part-of-whole (≤8 categories) |
| `scatter` | `ScatterChart` | Two numeric columns |
| `timeseries` | `LineChart` | Datetime + numeric trend |
| `area` | `AreaChart` | Filled trend over time |
| `radar` | `RadarChart` | Multi-metric category comparison |
| `radialbar` | `RadialBarChart` | Category proportions |

Each card is:
- Wrapped in a `useSortable` hook for drag-and-drop
- Responsive via `ResponsiveContainer`
- Equipped with `Tooltip`, `Legend`, `CartesianGrid`

### `DashboardGrid.tsx`

Wraps all `ChartCard` components in a **`SortableContext`** with `rectSortingStrategy`. Stores the logical chart order as an array of IDs in Zustand. When order changes, `setChartOrder()` is called.

### `InsightPanel.tsx`

Displays 5 Gemini AI-generated insights. Each insight has:
- A colored type badge (`trend`, `anomaly`, `correlation`, `summary`, `recommendation`)
- Title and content text
- Skeleton loading state while fetching

### `AskPanel.tsx`

Natural language Q&A interface:
- Text input for user questions
- Calls `POST /api/ask` with `{ dataset_id, question }`
- Streams or displays the Gemini response below the input

### `DataTable.tsx`

Paginated data preview table showing the first 100 rows from the dataset, using:
- shadcn `Table`, `TableHeader`, `TableRow`, `TableCell`
- Column type badge indicators

---

## 🏪 State Management (Zustand)

`lib/store.ts` defines a single `useDashboardStore`:

```typescript
interface DashboardStore {
  datasetId: string | null;      // Current dataset UUID
  columns: ColumnInfo[];         // Column metadata
  preview: Record<string,unknown>[]; // First 100 rows
  rowCount: number;              // Total row count
  chartOrder: string[];          // Drag-and-drop chart order (IDs)
  activeFilters: Record<string, string[]>; // Column filters
  sidebarOpen: boolean;          // UI panel state
}
```

**Persistence:** `datasetId`, `chartOrder`, and `sidebarOpen` are persisted to `localStorage` via Zustand's `persist` middleware, so the dashboard survives page refreshes.

---

## 🌐 API Client (`lib/api.ts`)

All backend calls are routed through `/api` (Next.js rewrites), so CORS is handled by the Next.js proxy — not the browser.

```typescript
uploadCSV(file, onProgress?)   → POST /api/upload
analyzeDataset(datasetId)       → POST /api/analyze
getInsights(datasetId)          → POST /api/insights
askQuestion(datasetId, question)→ POST /api/ask
getPreview(datasetId)           → POST /api/preview
```

A **response interceptor** normalizes all API errors into clean `Error` objects with the backend's `detail` message.

---

## 🔀 Next.js API Rewrites

`next.config.mjs` proxies `/api/*` to the backend:

```javascript
// next.config.mjs
rewrites: async () => [
  {
    source: '/api/:path*',
    destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/:path*`,
  },
],
```

This means:
- No CORS issues in the browser
- Backend URL is server-side only (not exposed to client)
- Clean `/api` prefix for all client calls

---

## 🎨 Design System

### Theme Tokens (CSS Variables)

`app/globals.css` defines a full token system in `:root` and `.dark`:

```css
--background: ...
--foreground: ...
--card: ...
--primary: ...
--muted: ...
--border: ...
```

### Typography

- **Font:** Inter (loaded via `next/font/google`)
- **Headings:** `font-bold tracking-tight`
- **Body:** `text-muted-foreground leading-relaxed`

### Chart Colors

A curated 10-color palette referenced both frontend and backend:

```
#6366f1 (violet) · #10b981 (emerald) · #f59e0b (amber)
#3b82f6 (blue) · #ec4899 (pink) · #8b5cf6 (purple)
#ef4444 (red) · #14b8a6 (teal) · #f97316 (orange) · #06b6d4 (cyan)
```

---

## 📦 TypeScript Types (`lib/types.ts`)

```typescript
interface ColumnInfo {
  name: string;
  dtype: 'numeric' | 'categorical' | 'datetime' | 'boolean' | 'unknown';
  null_count: number;
  null_pct: number;
  unique_count: number;
  sample_values: unknown[];
}

interface ChartConfig {
  id: string;
  type: 'bar' | 'histogram' | 'pie' | 'scatter' | 'timeseries' | 'area' | 'radar' | 'radialbar';
  title: string;
  column: string;
  data: Record<string, unknown>[];
  options: {
    responsive: boolean;
    showLegend: boolean;
    showGrid: boolean;
    colors: string[];
  };
}

interface Insight {
  title: string;
  content: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'summary' | 'recommendation';
}
```

---

## 🧪 Development Tips

1. **Turbopack** is enabled by default (`next dev --turbopack`). If you hit compatibility issues, remove the `--turbopack` flag in `package.json`.

2. **shadcn/ui** components are generated into `components/ui/`. Add new ones with:
   ```bash
   pnpm dlx shadcn@latest add <component-name>
   ```

3. **Environment mismatch:** If the backend isn't running, upload will fail with a network error. Start the backend first.

4. **React Query DevTools** can be enabled by adding `ReactQueryDevtools` to `providers.tsx`.

---

## 🚀 Deployment (Vercel)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel --prod
```

**Required environment variables in Vercel:**

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com` |

---

## 📄 License

MIT — see [LICENSE](../LICENSE)
