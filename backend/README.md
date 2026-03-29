# 🐍 Backend — AI Data Dashboard Generator

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.10+-yellow?style=for-the-badge&logo=python)
![Pandas](https://img.shields.io/badge/Pandas-2.2+-blue?style=for-the-badge&logo=pandas)
![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-orange?style=for-the-badge&logo=google)

**FastAPI backend for CSV processing, chart generation, and Gemini AI insights.**

</div>

---

## 📖 Overview

The backend is an async **FastAPI** application that:

1. **Receives CSV uploads** and converts them to Parquet for fast reloading
2. **Analyses data** — inferring column types, computing summary statistics
3. **Auto-generates chart configurations** (8 chart types) based on column types
4. **Calls Gemini AI** to produce 5 actionable business insights and answer natural-language questions

It is designed to be **stateless** (no database) — datasets are stored as temporary Parquet files on disk.

---

## 📁 Project Structure

```
backend/
├── main.py                # FastAPI app creation, CORS, lifespan, error handlers
├── requirements.txt       # Python dependencies
├── render.yaml            # Render.com deployment configuration
│
├── routes/
│   ├── __init__.py
│   ├── upload.py          # POST /upload  — CSV ingestion
│   ├── analyze.py         # POST /analyze — stats + chart configs
│   │                      # POST /preview — column metadata + 100 preview rows
│   └── insights.py        # POST /insights — Gemini insights
│                          # POST /ask      — natural language Q&A
│
├── services/
│   ├── __init__.py
│   ├── data_processor.py  # CSV parsing, Parquet I/O, column type inference, stats
│   ├── chart_generator.py # Auto chart suggestion engine (8 chart types)
│   └── ai_service.py      # Gemini 2.5 Flash Lite client (insights + Q&A)
│
└── utils/
    └── file_utils.py      # Storage path helpers (ensure_dataset_storage, get_dataset_dir)
```

---

## ⚡ Getting Started

### Prerequisites

- **Python 3.10+**
- A **Gemini API key** ([get one free](https://aistudio.google.com/apikey))

### Installation

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Environment Variables

Create `backend/.env.local` (gitignored, overrides `.env`):

```env
GEMINI_API_KEY=your_gemini_api_key_here
ALLOWED_ORIGINS=http://localhost:3000
DATASET_STORAGE_PATH=/tmp/datasets
MAX_FILE_SIZE_MB=100
DATASET_TTL_HOURS=2
```

> **`.env`** sets the defaults, **`.env.local`** overrides them locally. Both are loaded at startup in `main.py`.

### Development Server

```bash
uvicorn main:app --reload --port 8000
```

### Production Server

```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --timeout 120
```

---

## 🔌 API Endpoints

### Health Check

```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "storage": "/tmp/datasets",
  "storage_exists": true
}
```

---

### Upload CSV

```
POST /upload
Content-Type: multipart/form-data
Body: file=<csv_file>
```

Streams the file to disk in 64 KB chunks (never buffers entire file in memory). Converts to Parquet for fast subsequent reads.

**Response:**
```json
{
  "dataset_id": "uuid4-string",
  "row_count": 1000,
  "col_count": 10,
  "file_size_bytes": 51200,
  "columns": [
    {
      "name": "salary",
      "dtype": "numeric",
      "null_count": 0,
      "null_pct": 0.0,
      "unique_count": 450,
      "sample_values": [30000, 45000, 60000, 75000, 120000]
    }
  ],
  "preview": [{ "salary": 45000, "department": "Engineering" }]
}
```

**Column `dtype` values:**

| Value | Description |
|-------|-------------|
| `numeric` | Integer or float columns |
| `categorical` | String or low-cardinality numeric |
| `datetime` | Date/time parseable columns |
| `boolean` | true/false, yes/no, 1/0 columns |
| `unknown` | All-null or unclassifiable |

**Limits:**
- Max file size: `100 MB` (configurable via `MAX_FILE_SIZE_MB`)
- Only `.csv` files accepted

---

### Analyze Dataset

```
POST /analyze
Content-Type: application/json
Body: { "dataset_id": "uuid4-string" }
```

Computes per-column summary statistics and auto-generates chart configurations.

**Response:**
```json
{
  "dataset_id": "...",
  "summary_stats": [
    {
      "column": "salary",
      "dtype": "numeric",
      "mean": 72500.0,
      "median": 67500.0,
      "min": 30000.0,
      "max": 200000.0,
      "std": 28000.0,
      "percentile_25": 52000.0,
      "percentile_75": 95000.0
    }
  ],
  "chart_suggestions": [
    {
      "id": "histogram_salary",
      "type": "histogram",
      "title": "Distribution of Salary",
      "column": "salary",
      "data": [{ "x": 45000, "count": 120 }],
      "options": { "responsive": true, "showGrid": true, "colors": ["#6366f1"] }
    }
  ]
}
```

---

### Data Preview

```
POST /preview
Content-Type: application/json
Body: { "dataset_id": "uuid4-string" }
```

Returns column metadata + first 100 rows from the Parquet file.

---

### Generate AI Insights

```
POST /insights
Content-Type: application/json
Body: { "dataset_id": "uuid4-string" }
```

Builds a token-efficient dataset summary and calls Gemini 2.5 Flash Lite.

**Response:**
```json
{
  "dataset_id": "...",
  "insights": [
    {
      "title": "High Salary Variance in Engineering",
      "content": "Engineering salaries range from $45k to $200k with a std deviation of $28k, indicating a wide spread across seniority levels.",
      "type": "trend"
    }
  ]
}
```

**Insight types:** `trend` | `anomaly` | `correlation` | `summary` | `recommendation`

> **Fallback:** If `GEMINI_API_KEY` is not configured, statistical placeholder insights are returned automatically — no crash.

---

### Natural Language Q&A

```
POST /ask
Content-Type: application/json
Body: {
  "dataset_id": "uuid4-string",
  "question": "What is the average salary by department?"
}
```

**Response:**
```json
{
  "answer": "Based on the dataset, Engineering has the highest average salary at $95,000, followed by Marketing at $72,000...",
  "chart": null
}
```

---

## 🏗️ Services Deep Dive

### `DataProcessor` (`services/data_processor.py`)

Handles all data ingestion and analysis.

**Key methods:**

| Method | Description |
|--------|-------------|
| `process_csv(csv_path, dataset_dir)` | Detect encoding → parse CSV → save Parquet → return column metadata + preview |
| `analyze_dataset(parquet_path)` | Load Parquet → infer column types → compute per-column stats |
| `build_dataset_summary(parquet_path)` | Token-efficient summary for LLM prompts (~500 tokens for 10-column dataset) |
| `_infer_column_type(series)` | Classify a Series as numeric / categorical / datetime / boolean / unknown |

**Encoding detection:** Uses `chardet` on the first 10 KB of the file with a fallback to `latin-1`.

**Column type inference logic:**
1. All-null → `unknown`
2. Values only in `{true, false, 1, 0, yes, no}` → `boolean`
3. Numeric dtype with ≤10 unique values and <5% cardinality → `categorical`
4. Numeric dtype → `numeric`
5. 80%+ values parse as dates → `datetime`
6. Default → `categorical`

---

### `ChartGenerator` (`services/chart_generator.py`)

Auto-suggests chart configurations based on detected column types.

**Chart selection logic:**

| Column Type | Charts Generated |
|-------------|-----------------|
| `numeric` | Histogram + Area chart (if datetime column exists) |
| `categorical` / `boolean` | Bar chart + Pie chart (if 2–8 unique values) |
| `datetime` | Monthly histogram (records per month) |
| 2+ numeric columns | Scatter plot (highest-variance pair) |
| 3+ numeric + 1 categorical | Radar chart (normalized metrics per group) |
| Small categorical (2–6 values) | Radial bar chart |

**Constraints:**
- Skips ID-like columns (e.g., `id`, `uuid`, `row_num`)
- Max 200 data points per chart (downsamples if needed)
- Max 14 charts total per dataset

**Chart format returned:**
```python
{
  "id": "histogram_salary",
  "type": "histogram",        # bar | histogram | pie | scatter | timeseries | area | radar | radialbar
  "title": "Distribution of Salary",
  "column": "salary",
  "data": [...],              # Type-specific records
  "options": {
    "responsive": True,
    "showLegend": False,
    "showGrid": True,
    "colors": ["#6366f1"]
  }
}
```

---

### `AIService` (`services/ai_service.py`)

Gemini 2.5 Flash Lite integration for insights and Q&A.

**Model:** `gemini-2.5-flash-lite`

**Insights prompt strategy:**
- Never sends raw CSV data to the LLM
- Sends: column names, inferred types, summary stats, date ranges, top categorical values
- Requests exactly 5 JSON-structured insights
- Uses `response_mime_type="application/json"` for structured output
- Validates response with Pydantic `InsightsOutput` model

**Q&A prompt strategy:**
- Sends column summary (same format as insights)
- System instruction: "Answer based ONLY on the data above. Be concise."
- Max 500 output tokens

**Graceful degradation:**
- If `GEMINI_API_KEY` is missing → returns statistical placeholder insights
- If Gemini call fails → falls back to placeholder insights (never crashes)

---

## 🗄️ Data Storage

Datasets are stored as temporary files on disk:

```
/tmp/datasets/
└── <dataset_id>/             # UUID4 directory
    ├── original.csv          # Raw uploaded file
    └── data.parquet          # Processed Parquet (fast re-read)
```

- **No database required** — all state is derived from Parquet files
- **Parquet** is used instead of re-parsing CSV for every request (10–100x faster)
- Files are automatically cleaned up after `DATASET_TTL_HOURS` (default: 2 hours)
- **Production (Render):** A persistent disk is mounted at `/tmp/datasets` (1 GB)

---

## 🔒 Security

- **CORS:** Only origins listed in `ALLOWED_ORIGINS` are permitted
- **File validation:** Content type + file extension checked before processing
- **Size limit:** Files exceeding `MAX_FILE_SIZE_MB` are rejected mid-stream
- **Prompt injection:** Column names are sanitized (alphanumeric + `_ -`, max 50 chars) before being sent to Gemini
- **NaN/Inf sanitization:** All numpy floats are converted to Python-native types; NaN/Inf → `null` before JSON serialization

---

## 🌐 CORS Configuration

```python
# main.py
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

For multiple origins, set `ALLOWED_ORIGINS` as a comma-separated list:
```env
ALLOWED_ORIGINS=https://your-app.vercel.app,https://staging.your-app.vercel.app
```

---

## 🧪 Testing

```bash
# Run from project root (not backend/)

# Full API integration test
python test_api.py

# Test just the upload endpoint
python test_upload.py

# Test Gemini API connectivity
python test_gemini.py
```

You can also use the interactive **Swagger UI** at `http://localhost:8000/docs` or **ReDoc** at `http://localhost:8000/redoc`.

---

## 🚀 Deployment (Render)

The `render.yaml` file enables one-click deployment to [Render.com](https://render.com):

```yaml
services:
  - type: web
    name: ai-data-dashboard-backend
    env: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --timeout 120"
    envVars:
      - key: GEMINI_API_KEY
        sync: false                          # Set manually in Render dashboard
      - key: ALLOWED_ORIGINS
        value: "https://your-frontend.vercel.app"
      - key: MAX_FILE_SIZE_MB
        value: "100"
    disk:
      name: datasets
      mountPath: /tmp/datasets
      sizeGB: 1
```

**Steps:**
1. Push your code to GitHub
2. Create a new **Web Service** in Render
3. Connect your repository
4. Render detects `render.yaml` automatically
5. Set `GEMINI_API_KEY` in the **Environment** tab
6. Deploy!

---

## 📦 Dependencies

```
fastapi>=0.115.0       # Async web framework
uvicorn[standard]      # ASGI server
gunicorn>=22.0.0       # Production process manager
python-multipart       # Required for UploadFile
pandas>=2.2.0          # Data processing
pyarrow>=16.0.0        # Parquet I/O engine
numpy>=2.0.0           # Numerical computing
chardet>=5.0.0         # CSV encoding detection
google-genai>=1.69.0   # Gemini AI client
python-dotenv          # .env file loading
anyio>=4.0.0           # Async thread offloading
httpx>=0.27.0          # Async HTTP (used by genai client)
pydantic>=2.0.0        # Request/response validation
aiofiles>=23.0.0       # Async file I/O
```

---

## 🔧 Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | — | Google Gemini API key (**required** for AI features) |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated list of allowed CORS origins |
| `DATASET_STORAGE_PATH` | `/tmp/datasets` | Base directory for dataset Parquet files |
| `MAX_FILE_SIZE_MB` | `100` | Maximum upload size in megabytes |
| `DATASET_TTL_HOURS` | `2` | Hours before dataset files are eligible for cleanup |

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `GEMINI_API_KEY not configured` | Add key to `backend/.env.local` |
| `Dataset not found` | Dataset may have expired; re-upload the CSV |
| Upload timeout | Increase `--timeout` in gunicorn start command |
| `UnicodeDecodeError` | Handled automatically — falls back to `latin-1` encoding |
| `NaN in JSON` | All NaN/Inf values are sanitized to `null` before response |
| CORS error in browser | Check `ALLOWED_ORIGINS` includes your frontend URL |

---

## 📄 License

MIT — see [LICENSE](../LICENSE)
