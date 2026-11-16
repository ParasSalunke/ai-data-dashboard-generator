# Quick Task Plan: Implement Admin Login Access for Backend API Documentation (261116-gro)

## Goal
Secure the FastAPI backend documentation endpoints (`/docs`, `/redoc`, and `/openapi.json`) with admin authentication so that only the admin (`salunkeparasorg@gmail.com` with a specific password configured via environment variables) can access them.

## Implementation Details

### Task 1: Create Docs Authentication Module & Routes
- Create `backend/utils/docs_auth.py` or `backend/routes/docs.py`:
  - Read `DOCS_ADMIN_EMAIL`, `DOCS_ADMIN_PASSWORD`, and `DOCS_SESSION_SECRET` from environment variables.
  - Implement secure password/credential comparison with `secrets.compare_digest`.
  - Implement HMAC-SHA256 session token generation and verification for session cookies.
  - Provide a dependency/helper to check either valid session cookie OR valid HTTP Basic Auth.
  - Provide `GET /docs/login` rendering a modern, sleek Admin Login page.
  - Provide `POST /docs/login` to validate credentials and set secure `HttpOnly` session cookie (`docs_admin_session`).
  - Provide `GET /docs/logout` to clear the cookie and redirect to login.
  - Provide protected custom endpoints for `/docs`, `/redoc`, and `/openapi.json`.

### Task 2: Update `backend/main.py` & `backend/.env`
- In `backend/main.py`:
  - Disable default `docs_url=None`, `redoc_url=None`, `openapi_url=None` on `FastAPI(...)`.
  - Mount/include the docs routes.
- In `backend/.env`:
  - Add `DOCS_ADMIN_EMAIL=salunkeparasorg@gmail.com`
  - Add `DOCS_ADMIN_PASSWORD` with a strong default password.
  - Add `DOCS_SESSION_SECRET` with a secure random key.

### Task 3: Update `vercel.json` Routing
- Add rewrite rule for `/docs/:path*` to target the `backend` service so `/docs/login`, `/docs/logout`, etc. route correctly to the backend on Vercel.

### Task 4: Verification and Testing
- Run test suite / script to verify:
  1. Accessing `/docs`, `/redoc`, `/openapi.json` without credentials fails (redirects to login for browser, 401 for openapi).
  2. Accessing `/docs/login` with incorrect credentials fails.
  3. Accessing `/docs/login` with correct credentials succeeds and returns session cookie.
  4. Accessing `/docs` with valid cookie succeeds (200 OK with Swagger UI).
  5. Accessing `/openapi.json` with valid cookie succeeds (200 OK with OpenAPI schema).
  6. Accessing `/openapi.json` with HTTP Basic Auth succeeds.
  7. Accessing `/docs/logout` clears session cookie and redirects to login.
