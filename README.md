# 🚀 Datovo — AI Data Dashboard Generator

<div align="center">

![Datovo Banner](https://img.shields.io/badge/Datovo-AI%20Data%20Dashboard-blueviolet?style=for-the-badge&logo=databricks&logoColor=white)
<br />

[![Live Demo](https://img.shields.io/badge/Demo-datovo.vercel.app-success?style=for-the-badge&logo=vercel)](https://datovo.vercel.app)
[![API Docs](https://img.shields.io/badge/API%20Docs-Swagger%20UI-blue?style=for-the-badge&logo=swagger)](https://datovo.vercel.app/docs)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/ParasSalunke/ai-data-dashboard-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br />

**Turn any raw CSV file into interactive charts, statistical summaries, and AI-driven business insights — in seconds, with zero configuration.**

[🌟 Explore Live Demo](https://datovo.vercel.app) · [📖 Swagger API Docs](https://datovo.vercel.app/docs) · [📊 Dashboard Preview](https://datovo.vercel.app/dashboard) · [🐛 Report Issue](https://github.com/ParasSalunke/ai-data-dashboard-generator/issues)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture & Data Flow](#-system-architecture--data-flow)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started (Local Development)](#-getting-started-local-development)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup-fastapi)
  - [Frontend Setup](#2-frontend-setup-nextjs)
- [Environment Variables](#-environment-variables)
- [API Reference & Documentation](#-api-reference--documentation)
- [Deployment (Vercel Services Monorepo)](#-deployment-vercel-services-monorepo)
- [Security & Firebase Rules](#-security--firebase-rules)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 Overview

**Datovo** is a modern, full-stack, AI-native business intelligence platform that bridges the gap between raw data spreadsheets and executive decision-making. Acting like an embedded AI data analyst alongside a mini Tableau / Power BI, Datovo automatically:

1. **Ingests & Normalizes CSV Data**: Detects multi-encoding formats (UTF-8, Latin-1, Windows-1252), infers data types (numeric, categorical, datetime, text), and serializes data to Apache Parquet for high-speed columnar operations.
2. **Generates Recommended Visualizations**: Algorithmic heuristic analysis automatically suggests the most insightful chart representations (Bar, Line, Area, Pie, Donut, Radar, Radial, and Scatter plots).
3. **Derives Strategic AI Insights**: Connects to Google Gemini Flash LLMs to synthesize 5 actionable, statistically grounded business insights with positive trends, critical anomalies, and actionable next steps.
4. **Interactive Natural Language Q&A**: Lets users query their datasets conversationally and receive context-aware, analytical answers.
5. **Persistence & Export**: Provides secure Firebase Authentication, Cloud Firestore dataset history, and one-click programmatic PDF executive report export.

---

## ✨ Key Features

### 📤 Zero-Friction Data Ingestion
- Drag-and-drop CSV upload supporting files up to 100 MB.
- Automatic encoding detection via `chardet` (handles UTF-8, Latin-1, ISO-8859-1, Windows-1252).
- Conversion to Apache Parquet format on disk for sub-millisecond querying without memory bloat.

### 📊 Automatic Visualization Engine
- Heuristic chart generator recommending the best charts matching column distributions:
  - **Categorical & Count**: Single, Grouped, Stacked, and Horizontal Bar Charts.
  - **Distribution**: Histograms and Radial Bar charts.
  - **Composition**: Pie charts, Donut charts with embedded metrics.
  - **Temporal & Trends**: Linear, Step, Gradient Area, and Multi-line time series.
  - **Multivariate & Correlations**: Scatter plots and Radar charts.
- Built on **Recharts 3.x** and **shadcn/ui** with responsive containers and custom tooltips.
- Interactive **Chart Showcase** component with code snippet inspection for 50+ chart types.

### 🤖 Gemini-Powered Business Intelligence
- **5 Actionable Insights**: Automatically categorizes findings into `trend`, `anomaly`, `warning`, `recommendation`, and `summary`.
- **Conversational Data Q&A**: Ask questions like *"Which department has the highest salary variance?"* or *"What is our quarterly growth rate?"*.
- **Model Fallback Cascade**: High-availability inference with automatic fallback across `gemini-3.5-flash`, `gemini-3.1-flash-lite`, and `gemini-2.5-flash-lite`.

### 🔀 Modular Drag-and-Drop Dashboard
- Rearrange chart layouts intuitively using `@dnd-kit/sortable`.
- Persistent layout ordering saved to local state and synchronized with Cloud Firestore.
- Collapsible sidebar panels for quick access to Data Preview tables, AI Insights, and Q&A chat.

### 🔐 Authentication & Cloud Synchronization
- Secure authentication via **Firebase Auth** supporting Email/Password and Google OAuth.
- **Cloud Firestore** integration preserving user upload history, custom chart arrangements, and analytical notes.

### 📄 Executive PDF Export
- Export complete dashboard layouts including chart graphics, dataset statistics, and AI insight briefs into client-ready PDF reports via `@react-pdf/renderer` and `html-to-image`.

---

## 🏗️ System Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Client["Frontend (Next.js 16 + Tailwind CSS 4)"]
        UI["Landing & Upload UI"]
        DASH["Sortable Dashboard Grid"]
        AUTH["Firebase Auth & Firestore"]
        PDF["PDF Generator"]
    end

    subgraph Edge["Vercel Platform Routing (vercel.json)"]
        ROUTER{"Top-Level Ingress Rewrites"}
    end

    subgraph Server["Backend Service (FastAPI + Python 3.10)"]
        API["FastAPI Endpoints"]
        PROC["DataProcessor (Pandas + PyArrow)"]
        CHART["ChartGenerator (Heuristics Engine)"]
        AI["AIService (Google Gemini API)"]
        STORAGE[("Temporary Parquet Storage (/tmp)")]
    end

    UI -->|Upload CSV| ROUTER
    DASH -->|Analyze / Preview / Q&A| ROUTER
    AUTH <-->|User Profile & Dataset Sync| CloudFirestore[(Google Cloud Firestore)]

    ROUTER -->|/api/backend/*, /upload, /analyze, /docs| API
    ROUTER -->|/(.*) Frontend Pages| UI

    API --> PROC
    PROC -->|Save/Load Columnar Data| STORAGE
    PROC --> CHART
    CHART -->|Chart Configurations| API
    PROC --> AI
    AI -->|Generate Insights & Q&A| GoogleGemini[("Google Gemini AI API")]
```

---

## 🛠️ Technology Stack

### **Frontend**
| Layer / Tool | Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | `16.2.x` | React framework with Turbopack, App Router, and Fluid Compute integration |
| **React** | `19.2.x` | Modern component architecture, transitions, and concurrent features |
| **TypeScript** | `5.8.x` | End-to-end static typing across stores, components, and API models |
| **Tailwind CSS** | `4.2.x` | High-performance JIT CSS styling engine with `@tailwindcss/postcss` |
| **shadcn/ui** | `4.1.x` | Accessible UI component primitives built on Radix UI |
| **Recharts** | `3.10.x` | SVG-based responsive charting library |
| **@dnd-kit/sortable** | `10.0.x` | Hardware-accelerated drag-and-drop grid sorting |
| **Zustand** | `5.0.x` | Lightweight global reactive state management |
| **TanStack Query** | `5.95.x` | Asynchronous server-state synchronization, caching, and retries |
| **Axios** | `1.18.x` | HTTP client with progress tracking and automatic same-origin resolution |
| **Firebase SDK** | `13.2.x` | Firebase Auth (Google OAuth + Email) and Cloud Firestore client |
| **@react-pdf/renderer** | `4.9.x` | Programmatic vector PDF document compilation |

### **Backend**
| Layer / Tool | Version | Purpose |
| :--- | :--- | :--- |
| **FastAPI** | `0.115.x` | High-performance asynchronous Python web framework |
| **Uvicorn / Gunicorn** | `0.30.x / 27.x` | Production-grade ASGI server implementation |
| **Pandas** | `2.3.x` | Fast dataframe manipulation and statistics computation |
| **PyArrow** | `25.0.x` | Columnar memory format and Parquet read/write engine |
| **NumPy** | `2.2.x` | High-performance numerical and matrix operations |
| **google-genai** | `2.33.x` | Official Google GenAI SDK for Gemini multimodal models |
| **Pydantic** | `2.14.x` | Strict request/response data validation and OpenAPI schema generation |
| **Chardet** | `7.7.x` | Character encoding detector for universal CSV compatibility |
| **AnyIO** | `4.16.x` | Non-blocking CPU offloading via asynchronous worker threads |

---

## 📁 Project Structure

```
ai-data-dashboard-generator/
├── .gitignore                      # Monorepo-wide ignore rules (node_modules, venv, .env)
├── firebase.json                   # Firebase hosting, auth, and firestore configuration
├── firestore.rules                 # Cloud Firestore security & validation rules
├── firestore.indexes.json          # Firestore composite indexes
├── vercel.json                     # Vercel Services multi-framework routing configuration
├── README.md                       # Master project documentation
│
├── frontend/                       # Next.js 16 Web Application
│   ├── app/                        # App Router directory
│   │   ├── layout.tsx              # Root HTML wrapper, metadata, ThemeProvider, AuthProvider
│   │   ├── page.tsx                # Hero landing page & drag-and-drop upload zone
│   │   └── dashboard/              # Dynamic dashboard view
│   │       ├── page.tsx            # Dashboard page entrypoint
│   │       └── DashboardContent.tsx# Grid layout, chart controls, stats summary, and PDF export
│   ├── components/                 # Reusable UI component library
│   │   ├── ask-panel/              # Conversational natural language Q&A assistant
│   │   ├── auth/                   # AuthModal, UserButton, AuthControl
│   │   ├── charts/                 # Modular chart renderers (Area, Bar, Line, Pie, Radar, Radial)
│   │   │   ├── ChartCard.tsx       # Draggable sortable chart card wrapper
│   │   │   ├── ChartShowcase.tsx   # Comprehensive chart gallery showcase
│   │   │   └── ViewCodeModal.tsx   # Live React code snippet modal
│   │   ├── dashboard/              # DashboardGrid, RecentDatasets list
│   │   ├── data-table/             # 100-row interactive data preview table
│   │   ├── file-upload/            # CSV upload drag-and-drop dropzone
│   │   ├── filter-bar/             # Dynamic column filter controls
│   │   ├── insight-panel/          # AI-generated insight display cards
│   │   └── ui/                     # shadcn/ui components (buttons, dialogs, badges, etc.)
│   ├── context/                    # React Context (AuthContext)
│   ├── lib/                        # Client libraries & utilities
│   │   ├── api.ts                  # Axios client with auto-origin detection
│   │   ├── firebase.ts             # Firebase client initialization
│   │   ├── firestore.ts            # Firestore profile & dataset persistence methods
│   │   ├── store.ts                # Zustand global dashboard state
│   │   └── types.ts                # TypeScript interfaces (Dataset, Charts, Insights)
│   ├── package.json                # Frontend package configuration ("packageManager": "npm@11.9.0")
│   └── tsconfig.json               # TypeScript compiler configuration
│
└── backend/                        # FastAPI Python Service
    ├── main.py                     # App factory, CORS middleware, lifespan hooks, health checks
    ├── requirements.txt            # Python dependencies
    ├── routes/                     # API endpoint controllers
    │   ├── upload.py               # POST /upload (CSV upload, validation, Parquet conversion)
    │   ├── analyze.py              # POST /analyze, POST /preview (stats, heuristics, previews)
    │   └── insights.py             # POST /insights, POST /ask (Gemini AI integration)
    ├── services/                   # Core business logic
    │   ├── data_processor.py       # Data cleaning, type inference, summary statistics
    │   ├── chart_generator.py      # Automated 8-type chart recommendation engine
    │   └── ai_service.py           # Gemini 2.5/3.5 client with fallback cascade
    └── utils/
        └── file_utils.py           # Storage path helpers & dataset TTL cleanup
```

---

## ⚡ Getting Started (Local Development)

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** `v20.x` or `v22.x+` and **npm** (`npm -v >= 10.x`)
- **Python** `3.10` or higher
- A **Google Gemini API Key** — [Obtain free via Google AI Studio](https://aistudio.google.com/apikey)
- A **Firebase Project** (optional, required only for Auth and History persistence) — [Firebase Console](https://console.firebase.google.com/)

---

### 1. Backend Setup (FastAPI)

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # On macOS / Linux:
   python3 -m venv venv
   source venv/bin/activate

   # On Windows (PowerShell):
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create your local environment configuration:
   Create a `backend/.env` file:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   DATASET_STORAGE_PATH=/tmp/datasets
   MAX_FILE_SIZE_MB=100
   DATASET_TTL_HOURS=2
   ```

5. Start the backend development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The backend will now be live at **`http://localhost:8000`** (Swagger docs at **`http://localhost:8000/docs`**).*

---

### 2. Frontend Setup (Next.js)

1. In a separate terminal, navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install the frontend dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `frontend/.env` file:
   ```env
   # API Backend (for local dev)
   NEXT_PUBLIC_API_URL=http://localhost:8000

   # Firebase Configuration (replace with your Firebase project credentials)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. Launch the Next.js development server:
   ```bash
   npm run dev
   ```

5. Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🔧 Environment Variables

### Backend Configuration

| Key | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `GEMINI_API_KEY` | **Yes** | — | Google AI Studio API key used for generating insights and answering data Q&A |
| `GEMINI_MODEL` | No | `gemini-3.5-flash` | Primary Gemini model identifier |
| `ALLOWED_ORIGINS` | No | `http://localhost:3000` | Comma-delimited list of authorized CORS origin URLs |
| `DATASET_STORAGE_PATH` | No | `/tmp/datasets` | Filesystem directory used to cache uploaded CSV datasets as Parquet |
| `MAX_FILE_SIZE_MB` | No | `100` | Maximum allowable size in megabytes for uploaded CSV files |
| `DATASET_TTL_HOURS` | No | `2` | Retention window before temp datasets are purged |

### Frontend Configuration

| Key | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | No | `""` (relative) | Base URL for FastAPI backend. In production, left empty to use same-origin proxy |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | No | — | Firebase project Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | No | — | Firebase Auth domain for login redirects |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | No | — | Google Cloud / Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`| No | — | Cloud Storage bucket URL |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | No | — | Unique Firebase application identifier |

---

## 📡 API Reference & Documentation

FastAPI automatically generates interactive OpenAPI documentation:
- **Interactive Swagger UI**: [https://datovo.vercel.app/docs](https://datovo.vercel.app/docs) (or `http://localhost:8000/docs`)
- **ReDoc Technical Reference**: [https://datovo.vercel.app/redoc](https://datovo.vercel.app/redoc)
- **OpenAPI JSON Schema**: [https://datovo.vercel.app/openapi.json](https://datovo.vercel.app/openapi.json)

### Core Endpoints

#### 1. Upload CSV
```http
POST /upload
Content-Type: multipart/form-data
```
- **Body**: Form data containing `file` (CSV format).
- **Response `200 OK`**:
  ```json
  {
    "dataset_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "fileName": "sales_q3.csv",
    "row_count": 1420,
    "col_count": 8,
    "file_size_bytes": 104857,
    "columns": [
      {
        "name": "revenue",
        "dtype": "numeric",
        "null_count": 0,
        "null_pct": 0.0,
        "unique_count": 1240,
        "sample_values": [1200.5, 4500.0, 310.2]
      }
    ]
  }
  ```

#### 2. Analyze Dataset
```http
POST /analyze
Content-Type: application/json
```
- **Request**: `{"dataset_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"}`
- **Response `200 OK`**: Returns computed summary statistics, correlations, distributions, and recommended chart configs.

#### 3. Preview Dataset
```http
POST /preview
Content-Type: application/json
```
- **Request**: `{"dataset_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"}`
- **Response `200 OK`**: Returns column metadata and the first 100 rows formatted for UI preview tables.

#### 4. Generate AI Insights
```http
POST /insights
Content-Type: application/json
```
- **Request**: `{"dataset_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"}`
- **Response `200 OK`**: Returns 5 categorized business insights with metrics, trends, and recommendations.

#### 5. Ask Questions (Natural Language Q&A)
```http
POST /ask
Content-Type: application/json
```
- **Request**:
  ```json
  {
    "dataset_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "question": "What is the top performing product category by total sales?"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "answer": "The 'Electronics' category generated the highest total revenue ($4.2M), representing 41% of overall sales.",
    "chart": null
  }
  ```

#### 6. Health Check
```http
GET /health
```
- **Response `200 OK`**: `{"status": "healthy", "version": "1.0.0", "storage": "/tmp/datasets", "storage_exists": true}`

---

## 🌐 Deployment (Vercel Services Monorepo)

The project is structured to deploy both the Next.js frontend and the FastAPI backend into a single unified deployment on **Vercel** using **Vercel Services**:

### Architecture Highlights:
- **Zero Skew**: Both frontend and backend deploy simultaneously in lockstep.
- **Same-Domain Routing**: Top-level rewrites route API calls directly to the backend function without CORS friction or custom proxy servers.
- **Serverless Compute**: FastAPI runs as a scale-to-zero function on Vercel Fluid Compute with up to 120s execution allowance.

### `vercel.json` Specification:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "services": {
    "frontend": {
      "root": "frontend"
    },
    "backend": {
      "root": "backend",
      "entrypoint": "main:app",
      "functions": {
        "main.py": {
          "maxDuration": 120
        }
      },
      "rewrites": [
        {
          "source": "/api/backend/:path(.*)?",
          "destination": "/:path"
        }
      ]
    }
  },
  "rewrites": [
    { "source": "/api/backend/:path*", "destination": { "service": "backend" } },
    { "source": "/api/backend", "destination": { "service": "backend" } },
    { "source": "/docs", "destination": { "service": "backend" } },
    { "source": "/redoc", "destination": { "service": "backend" } },
    { "source": "/openapi.json", "destination": { "service": "backend" } },
    { "source": "/health", "destination": { "service": "backend" } },
    { "source": "/upload", "destination": { "service": "backend" } },
    { "source": "/analyze", "destination": { "service": "backend" } },
    { "source": "/preview", "destination": { "service": "backend" } },
    { "source": "/insights", "destination": { "service": "backend" } },
    { "source": "/ask", "destination": { "service": "backend" } },
    { "source": "/(.*)", "destination": { "service": "frontend" } }
  ]
}
```

---

## 🔒 Security & Firebase Rules

The project implements comprehensive Cloud Firestore security rules in [`firestore.rules`](./firestore.rules):
- **User Isolation**: Data under `users/{userId}` is strictly readable and writable only by the authenticated owner (`request.auth.uid == userId`).
- **Schema Validation**: Required fields, immutable properties (`uid`, `createdAt`), and size bounds are enforced at the database level.
- **Relational Integrity**: Uploaded datasets and chat history are namespaced under sub-collections (`users/{userId}/datasets/{datasetId}`).

To deploy the security rules to your Firebase project:
```bash
firebase deploy --only firestore:rules
```

---

## 🗺️ Roadmap

- [x] High-performance CSV upload with multi-encoding detection
- [x] Heuristic chart recommendation engine (8 core visualization categories)
- [x] Multi-model Gemini AI insights generation with automatic failover
- [x] Natural language Q&A chat assistant for tabular data
- [x] Drag-and-drop sortable dashboard layout (`@dnd-kit/sortable`)
- [x] Firebase Authentication (Google OAuth + Email/Password)
- [x] Cloud Firestore synchronization for past dataset history
- [x] Executive PDF export via `@react-pdf/renderer`
- [x] Interactive Chart Showcase gallery with 50+ chart types and live JSX preview
- [x] Unified Vercel Services monorepo deployment with Swagger documentation
- [ ] Multi-file CSV joining and comparative cross-dataset analysis
- [ ] Export dashboard to PowerPoint (.pptx) and Excel (.xlsx)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**: Click the *Fork* button in the upper right.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/my-new-feature
   ```
3. **Commit Your Changes**:
   ```bash
   git commit -m "feat: add support for parquet file uploads"
   ```
4. **Push to the Branch**:
   ```bash
   git push origin feature/my-new-feature
   ```
5. **Open a Pull Request**: Submit your PR with a description of changes.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Crafted with dedication by **[Paras Salunke](https://github.com/ParasSalunke)**

*If you found this project helpful, please consider giving it a ⭐ on [GitHub](https://github.com/ParasSalunke/ai-data-dashboard-generator)!*

</div>
