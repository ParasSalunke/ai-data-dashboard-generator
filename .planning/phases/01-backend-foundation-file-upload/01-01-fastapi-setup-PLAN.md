---
id: "01-01"
phase: 1
wave: 1
plan: FastAPI Project Setup
objective: Set up the FastAPI backend project with proper structure, CORS, routing, health check endpoint, environment configuration, and requirements.txt with all needed dependencies.
requirements: UPLOAD-07, PERF-01
autonomous: true
---

## Objective

Create the FastAPI backend project from scratch at `/backend/` with:
- `main.py` — FastAPI app, CORS middleware, route inclusion, health check
- `requirements.txt` — all Python dependencies pinned
- `routes/` — empty init files + upload.py, analyze.py, insights.py stubs
- `services/` — data_processor.py, chart_generator.py, ai_service.py stubs
- `.env.example` — environment variables template
- `run.sh` / startup instructions
- Proper directory structure matching the PRD

## Tasks

### Task 1: Create backend directory structure
Create the following files and directories:
```
backend/
  main.py
  requirements.txt
  .env.example
  .gitignore (Python)
  routes/
    __init__.py
    upload.py
    analyze.py
    insights.py
  services/
    __init__.py
    data_processor.py
    chart_generator.py
    ai_service.py
  utils/
    __init__.py
    file_utils.py
```

### Task 2: Write main.py
Full FastAPI app with:
- CORSMiddleware allowing localhost:3000 and env-configured origins
- Include routers from upload, analyze, insights
- Health check endpoint GET /health
- Proper lifespan event (startup: ensure /tmp/datasets/ exists)
- Error handling middleware
- Logging configuration

### Task 3: Write requirements.txt
Pin all dependencies:
```
fastapi>=0.115.0
uvicorn[standard]>=0.30.0
python-multipart>=0.0.9
pandas>=2.2.0
pyarrow>=16.0.0
numpy>=2.0.0
chardet>=5.0.0
openai>=1.0.0
python-dotenv>=1.0.0
anyio>=4.0.0
httpx>=0.27.0
pydantic>=2.0.0
```

### Task 4: Write route stubs (upload.py, analyze.py, insights.py)
Each route file should have:
- Proper imports
- Router instantiation
- Stub endpoints returning placeholder JSON (will be filled in Plans 01-02 onwards)
- Pydantic models for request/response

### Task 5: Write service stubs
- `data_processor.py` — class DataProcessor with stub methods
- `chart_generator.py` — class ChartGenerator with stub methods  
- `ai_service.py` — class AIService with stub methods
- `utils/file_utils.py` — utility functions (ensure_dir, cleanup_old_files)

### Task 6: Write .env.example
```
OPENAI_API_KEY=your_key_here
ALLOWED_ORIGINS=http://localhost:3000
MAX_FILE_SIZE_MB=100
DATASET_STORAGE_PATH=/tmp/datasets
DATASET_TTL_HOURS=2
```

### Task 7: Write .gitignore for backend
Python gitignore + .env file

## Key Files to Create
- `backend/main.py`
- `backend/requirements.txt`
- `backend/.env.example`
- `backend/routes/__init__.py`
- `backend/routes/upload.py`
- `backend/routes/analyze.py`
- `backend/routes/insights.py`
- `backend/services/__init__.py`
- `backend/services/data_processor.py`
- `backend/services/chart_generator.py`
- `backend/services/ai_service.py`
- `backend/utils/__init__.py`
- `backend/utils/file_utils.py`
