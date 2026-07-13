# 🚀 AI Data Dashboard Generator

<div align="center">

![AI Data Dashboard Generator](https://img.shields.io/badge/AI%20Powered-Gemini%202.5-blue?style=for-the-badge&logo=google)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green?style=for-the-badge&logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![Python](https://img.shields.io/badge/Python-3.10+-yellow?style=for-the-badge&logo=python)

**Drop any CSV file → Get instant charts, AI insights, and an interactive dashboard.**

[Live Demo](#) · [Frontend Docs](./frontend/README.md) · [Backend Docs](./backend/README.md) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📖 Overview

**AI Data Dashboard Generator** is a full-stack, AI-powered analytics tool that transforms raw CSV data into interactive dashboards with zero configuration. Think of it as a mini **Tableau / Power BI** with an embedded AI analyst.

Upload your data → Auto-generated charts appear → Gemini AI surfaces actionable business insights — in seconds.

### ✨ Core Value Proposition

> **The ONE thing that must work:** A user can drag-and-drop a CSV file and immediately see auto-generated charts and AI insights about their data — no configuration required.

---

## 🏗️ Architecture

```
ai-data-dashboard-generator/
├── frontend/           # Next.js 16 App Router (TypeScript + Tailwind CSS 4)
│   ├── app/            # Pages & layouts (App Router)
│   │   ├── page.tsx    # Landing / upload page
│   │   └── dashboard/  # Interactive dashboard view
│   ├── components/     # React components (ChartCard, FileUpload, etc.)
│   └── lib/            # API client, Zustand store, TypeScript types
│
├── backend/            # FastAPI (Python 3.10+)
│   ├── main.py         # CORS, lifespan, error handlers
│   ├── routes/         # Upload, Analyze, Insights endpoints
│   ├── services/       # Data processor, Chart generator, AI service
│   └── utils/          # File system helpers
│
└── .planning/          # GSD project roadmap & phase artifacts
```

### System Flow

```
User → [Next.js Frontend]
          │
          ├─ POST /api/upload    → FastAPI stores CSV as Parquet
          ├─ POST /api/analyze   → Pandas computes stats + chart suggestions
          ├─ POST /api/insights  → Gemini 2.5 Flash Lite generates 5 insights
          └─ POST /api/ask       → Gemini answers natural language questions
```

---

## 🎯 Features

| Feature | Description |
|--------|-------------|
| 📤 **Drag & Drop Upload** | Zero-friction CSV upload with encoding auto-detection |
| 📊 **Auto-Generated Charts** | 8+ chart types: bar, histogram, pie, scatter, area, timeseries, radar, radial bar |
| 🤖 **AI-Powered Insights** | Gemini 2.5 Flash Lite generates 5 specific, data-grounded business insights |
| 💬 **Natural Language Q&A** | Ask questions about your data in plain English |
| 🔀 **Drag & Drop Dashboard** | Rearrange charts with `@dnd-kit/sortable` |
| 📋 **Data Preview Table** | First 100 rows displayed with column metadata |
| 🌙 **Dark Mode** | Full dark/light theme support via `next-themes` |
| 📱 **Responsive Design** | Mobile-first with Tailwind CSS 4 |

---

## 🛠️ Technology Stack

### Frontend
| Library | Version | Purpose |
|---------|---------|---------|
| Next.js | 16.x | React framework (App Router, SSR) |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling |
| shadcn/ui | Latest | Accessible component primitives |
| Recharts | 3.x | Chart rendering |
| @dnd-kit/sortable | 10.x | Drag-and-drop grid layout |
| Zustand | 5.x | Global state management |
| TanStack Query | 5.x | Server state & caching |
| Axios | 1.x | HTTP client with interceptors |

### Backend
| Library | Version | Purpose |
|---------|---------|---------|
| FastAPI | 0.115+ | Async Python web framework |
| Pandas | 2.2+ | Data processing & analysis |
| NumPy | 2.x | Numerical computing |
| PyArrow | 16.x | Parquet format for fast reloads |
| Chardet | 5.x | CSV encoding detection |
| Google GenAI | 1.69+ | Gemini AI client |
| Uvicorn + Gunicorn | 0.30+ | ASGI production server |
| Pydantic | 2.x | Request/response validation |
| AnyIO | 4.x | Async thread offloading |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm** (or npm/yarn)
- **Python** 3.10+
- **Gemini API Key** — [Get one free at Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-data-dashboard-generator.git
cd ai-data-dashboard-generator
```

### 2. Set Up the Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env .env.local
# Edit .env.local and add your GEMINI_API_KEY
```

**`backend/.env.local`:**
```env
GEMINI_API_KEY=your_gemini_api_key_here
ALLOWED_ORIGINS=http://localhost:3000
DATASET_STORAGE_PATH=/tmp/datasets
MAX_FILE_SIZE_MB=100
```

Start the backend:
```bash
uvicorn main:app --reload --port 8000
```

### 3. Set Up the Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Configure environment
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=/api  (uses Next.js rewrites to proxy to backend)
```

Start the frontend:
```bash
pnpm dev
```

### 4. Open the App

Navigate to **[http://localhost:3000](http://localhost:3000)** and drop a CSV file to get started!

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check + storage status |
| `POST` | `/upload` | Upload CSV → returns `dataset_id` + column metadata |
| `POST` | `/analyze` | Compute summary stats + chart configs |
| `POST` | `/preview` | Get first 100 rows + column types |
| `POST` | `/insights` | Generate 5 AI-powered business insights |
| `POST` | `/ask` | Answer a natural language question |

See the [Backend README](./backend/README.md) for full request/response schemas.

---

## 🌐 Deployment

### Vercel Services

The repository now includes a root `vercel.json` that deploys the Next.js frontend and FastAPI backend together as Vercel Services.

```json
{
  "services": {
    "frontend": {
      "root": "frontend",
      "framework": "nextjs"
    },
    "backend": {
      "root": "backend",
      "framework": "fastapi",
      "entrypoint": "main:app"
    }
  },
  "rewrites": [
    { "source": "/api/backend(/.*)?", "destination": { "service": "backend" } },
    { "source": "/(.*)", "destination": { "service": "frontend" } }
  ]
}
```

Set `GEMINI_API_KEY` in Vercel for the backend service. `NEXT_PUBLIC_API_URL` is optional; leave it unset to use the built-in `/api/backend` routing.

---

## 📁 Project Structure (Detailed)

```
ai-data-dashboard-generator/
│
├── README.md                        ← You are here
├── test_api.py                      ← Integration test scripts
├── test_employees.csv               ← Sample CSV for testing
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx               ← Root layout (font, theme provider)
│   │   ├── page.tsx                 ← Landing page with hero + file upload
│   │   ├── providers.tsx            ← React Query + Theme providers
│   │   └── dashboard/
│   │       ├── page.tsx             ← Dashboard route entry
│   │       └── DashboardContent.tsx ← Full dashboard UI
│   │
│   ├── components/
│   │   ├── FileUpload.tsx           ← Drag & drop upload zone
│   │   ├── ChartCard.tsx            ← Chart renderer (all 8 types)
│   │   ├── DashboardGrid.tsx        ← dnd-kit sortable grid
│   │   ├── DataTable.tsx            ← Data preview table
│   │   ├── InsightPanel.tsx         ← AI insights sidebar
│   │   ├── AskPanel.tsx             ← Natural language Q&A
│   │   └── ui/                      ← shadcn/ui components
│   │
│   └── lib/
│       ├── api.ts                   ← Axios client + API functions
│       ├── store.ts                 ← Zustand dashboard state
│       ├── types.ts                 ← TypeScript type definitions
│       └── utils.ts                 ← Utility helpers
│
└── backend/
    ├── main.py                      ← FastAPI app + CORS + lifespan
    ├── requirements.txt             ← Python dependencies
    ├── render.yaml                  ← Render deployment config
    │
    ├── routes/
    │   ├── upload.py                ← POST /upload
    │   ├── analyze.py               ← POST /analyze, /preview
    │   └── insights.py              ← POST /insights, /ask
    │
    ├── services/
    │   ├── data_processor.py        ← CSV parsing, Parquet, stats
    │   ├── chart_generator.py       ← Auto chart suggestion engine
    │   └── ai_service.py            ← Gemini AI integration
    │
    └── utils/
        └── file_utils.py            ← Storage path helpers
```

---

## 🔧 Environment Variables

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | — | Google Gemini API key (required for AI features) |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated CORS origins |
| `DATASET_STORAGE_PATH` | `/tmp/datasets` | Where Parquet files are stored |
| `MAX_FILE_SIZE_MB` | `100` | Maximum CSV upload size |
| `DATASET_TTL_HOURS` | `2` | Hours before datasets are cleaned up |

### Frontend

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `/api` | Backend API base URL |

---

## 🧪 Testing

```bash
# Run backend integration tests
python test_api.py

# Test upload with sample CSV
python test_upload.py

# Test Gemini AI connection
python test_gemini.py
```

---

## 🗺️ Roadmap

- [x] CSV upload with encoding detection
- [x] Auto-generated charts (8 types)
- [x] AI-powered insights (Gemini 2.5)
- [x] Natural language Q&A
- [x] Drag-and-drop dashboard layout
- [x] Dark/light theme
- [ ] PDF export of dashboard
- [ ] Multiple file upload / dataset comparison
- [ ] User authentication & saved dashboards
- [ ] Custom chart builder

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by **Paras Salunke**

[⭐ Star this repo](https://github.com/ParasSalunke/ai-data-dashboard-generator) if it helped you!

</div>
