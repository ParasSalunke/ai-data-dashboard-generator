import os
import time
import hmac
import hashlib
import secrets
import html
from typing import Optional
from fastapi import APIRouter, Request, Depends, HTTPException, status
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
from fastapi.security import HTTPBasic, HTTPBasicCredentials

router = APIRouter(include_in_schema=False)
security = HTTPBasic(auto_error=False)

COOKIE_NAME = "datovo_docs_session"
SESSION_MAX_AGE = 7 * 24 * 3600  # 7 days in seconds


def get_admin_email() -> str:
    """Return the configured admin email in lowercase."""
    return os.getenv("DOCS_ADMIN_EMAIL", "salunkeparasorg@gmail.com").strip().lower()


def get_admin_password() -> str:
    """Return the configured admin password."""
    return os.getenv("DOCS_ADMIN_PASSWORD", "DatovoAdmin@2026!")


def get_session_secret() -> bytes:
    """Return secret key for signing session tokens statelessly."""
    secret = os.getenv("DOCS_SESSION_SECRET")
    if not secret:
        # Fallback to deterministic key derived from admin password
        secret = hashlib.sha256(f"datovo_docs_secret_{get_admin_password()}".encode("utf-8")).hexdigest()
    return secret.encode("utf-8")


def create_session_token(email: str) -> str:
    """Create a signed HMAC-SHA256 session token."""
    timestamp = int(time.time())
    payload = f"{email}:{timestamp}"
    signature = hmac.new(get_session_secret(), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{payload}:{signature}"


def verify_session_token(token: Optional[str]) -> bool:
    """Verify session token signature, expiration, and user email."""
    if not token or ":" not in token:
        return False
    parts = token.split(":")
    if len(parts) != 3:
        return False
    email, timestamp_str, signature = parts
    try:
        timestamp = int(timestamp_str)
    except ValueError:
        return False

    # Check expiry (7 days) and clock drift (up to 5 min)
    now = int(time.time())
    if now - timestamp > SESSION_MAX_AGE or timestamp > now + 300:
        return False

    # Verify email matches admin email
    if not secrets.compare_digest(email.strip().lower(), get_admin_email()):
        return False

    # Verify HMAC signature
    payload = f"{email}:{timestamp_str}"
    expected_sig = hmac.new(get_session_secret(), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    return secrets.compare_digest(signature, expected_sig)


def is_authenticated(request: Request, credentials: Optional[HTTPBasicCredentials] = None) -> bool:
    """Check if request is authenticated via session cookie or HTTP Basic Auth."""
    # If HTTP Basic credentials are explicitly provided, validate them directly
    if credentials:
        valid_user = secrets.compare_digest(credentials.username.strip().lower(), get_admin_email())
        valid_pass = secrets.compare_digest(credentials.password, get_admin_password())
        if valid_user and valid_pass:
            return True
        return False

    # Otherwise, check the session cookie
    token = request.cookies.get(COOKIE_NAME)
    if verify_session_token(token):
        return True

    return False


def render_login_html(error: Optional[str] = None, logged_out: bool = False, next_url: str = "/docs", email_value: str = "") -> str:
    """Generate self-contained, responsive modern admin login HTML."""
    safe_error = html.escape(error) if error else ""
    safe_next = html.escape(next_url) if next_url and next_url.startswith("/") else "/docs"
    safe_email = html.escape(email_value) if email_value else ""

    error_banner = f"""
    <div class="alert alert-error">
        <svg class="alert-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span>{safe_error}</span>
    </div>
    """ if safe_error else ""

    logout_banner = """
    <div class="alert alert-success">
        <svg class="alert-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span>You have been signed out successfully.</span>
    </div>
    """ if (logged_out and not safe_error) else ""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Datovo API Docs - Admin Authentication</title>
    <link rel="icon" href="https://fastapi.tiangolo.com/img/favicon.png">
    <style>
        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}
        body {{
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0a0e1a 60%, #030712 100%);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #f1f5f9;
            padding: 1.5rem;
        }}
        .login-card {{
            width: 100%;
            max-width: 440px;
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1.25rem;
            padding: 2.5rem 2rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.12);
        }}
        .brand-header {{
            text-align: center;
            margin-bottom: 2rem;
        }}
        .brand-icon {{
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 56px;
            height: 56px;
            border-radius: 1rem;
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            color: white;
            margin-bottom: 1rem;
            box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.5);
        }}
        .brand-title {{
            font-size: 1.5rem;
            font-weight: 700;
            letter-spacing: -0.025em;
            color: #ffffff;
            margin-bottom: 0.35rem;
        }}
        .brand-subtitle {{
            font-size: 0.875rem;
            color: #94a3b8;
        }}
        .badge-admin {{
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            background: rgba(99, 102, 241, 0.15);
            color: #a5b4fc;
            border: 1px solid rgba(99, 102, 241, 0.3);
            margin-top: 0.6rem;
        }}
        .alert {{
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.85rem 1rem;
            border-radius: 0.75rem;
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
            line-height: 1.4;
        }}
        .alert-error {{
            background: rgba(239, 68, 68, 0.12);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #fca5a5;
        }}
        .alert-success {{
            background: rgba(34, 197, 94, 0.12);
            border: 1px solid rgba(34, 197, 94, 0.3);
            color: #86efac;
        }}
        .alert-icon {{
            width: 20px;
            height: 20px;
            flex-shrink: 0;
        }}
        .form-group {{
            margin-bottom: 1.25rem;
        }}
        .form-label {{
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            color: #cbd5e1;
            margin-bottom: 0.5rem;
        }}
        .input-wrapper {{
            position: relative;
        }}
        .form-input {{
            width: 100%;
            padding: 0.8rem 1rem;
            padding-right: 2.75rem;
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid #334155;
            border-radius: 0.75rem;
            color: #f8fafc;
            font-size: 0.925rem;
            transition: all 0.2s ease;
        }}
        .form-input:focus {{
            outline: none;
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
            background: rgba(30, 41, 59, 0.7);
        }}
        .toggle-password {{
            position: absolute;
            right: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            background: transparent;
            border: none;
            color: #64748b;
            cursor: pointer;
            padding: 0.35rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 0.375rem;
            transition: color 0.2s;
        }}
        .toggle-password:hover {{
            color: #cbd5e1;
        }}
        .btn-submit {{
            width: 100%;
            padding: 0.875rem 1rem;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: #ffffff;
            border: none;
            border-radius: 0.75rem;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.25s ease;
            box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
            margin-top: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }}
        .btn-submit:hover {{
            background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%);
            box-shadow: 0 6px 20px rgba(79, 70, 229, 0.6);
            transform: translateY(-1px);
        }}
        .btn-submit:active {{
            transform: translateY(0);
        }}
        .btn-submit:disabled {{
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }}
        .security-footer {{
            margin-top: 2rem;
            padding-top: 1.25rem;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            text-align: center;
            font-size: 0.775rem;
            color: #64748b;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
        }}
        .security-footer svg {{
            width: 14px;
            height: 14px;
        }}
    </style>
</head>
<body>
    <div class="login-card">
        <div class="brand-header">
            <div class="brand-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
            </div>
            <h1 class="brand-title">Datovo API Docs</h1>
            <p class="brand-subtitle">Restricted Documentation Portal</p>
            <div class="badge-admin">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Admin Access Only
            </div>
        </div>

        {error_banner}
        {logout_banner}

        <form method="POST" action="/docs/login" id="loginForm">
            <input type="hidden" name="next" value="{safe_next}">

            <div class="form-group">
                <label class="form-label" for="email">Admin Email Address</label>
                <div class="input-wrapper">
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        class="form-input" 
                        placeholder="salunkeparasorg@gmail.com" 
                        value="{safe_email}" 
                        required 
                        autocomplete="email"
                        autofocus
                    >
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="password">Admin Password</label>
                <div class="input-wrapper">
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        class="form-input" 
                        placeholder="••••••••••••" 
                        required 
                        autocomplete="current-password"
                    >
                    <button type="button" class="toggle-password" id="togglePassword" aria-label="Toggle password visibility">
                        <svg id="eyeIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                </div>
            </div>

            <button type="submit" class="btn-submit" id="submitBtn">
                <span>Sign In to API Docs</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
        </form>

        <div class="security-footer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Authorized access only • Activity is logged & monitored</span>
        </div>
    </div>

    <script>
        const passwordInput = document.getElementById('password');
        const toggleBtn = document.getElementById('togglePassword');
        const eyeIcon = document.getElementById('eyeIcon');
        const form = document.getElementById('loginForm');
        const submitBtn = document.getElementById('submitBtn');

        toggleBtn.addEventListener('click', () => {{
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            eyeIcon.innerHTML = isPassword 
                ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>'
                : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
        }});

        form.addEventListener('submit', () => {{
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Verifying credentials...</span>';
        }});
    </script>
</body>
</html>"""


@router.get("/docs/login", response_class=HTMLResponse)
async def login_page(
    request: Request,
    error: Optional[str] = None,
    logged_out: Optional[str] = None,
    next: str = "/docs"
):
    """Render the admin login page for documentation."""
    # If already authenticated, redirect straight to docs or requested next URL
    if verify_session_token(request.cookies.get(COOKIE_NAME)):
        safe_next = next if next and next.startswith("/") else "/docs"
        return RedirectResponse(url=safe_next, status_code=status.HTTP_303_SEE_OTHER)

    return HTMLResponse(
        content=render_login_html(
            error=error,
            logged_out=bool(logged_out),
            next_url=next
        )
    )


@router.post("/docs/login")
async def login_submit(request: Request, next: str = "/docs"):
    """Authenticate admin and issue secure HttpOnly session cookie."""
    content_type = request.headers.get("content-type", "").lower()
    email = ""
    password = ""
    form_next = next

    if "application/json" in content_type:
        try:
            body = await request.json()
            email = str(body.get("email", "")).strip()
            password = str(body.get("password", ""))
            if body.get("next"):
                form_next = str(body.get("next"))
        except Exception:
            pass
    else:
        try:
            form = await request.form()
            email = str(form.get("email", "")).strip()
            password = str(form.get("password", ""))
            if form.get("next"):
                form_next = str(form.get("next"))
        except Exception:
            pass

    safe_next = form_next if form_next and form_next.startswith("/") else "/docs"

    valid_email = secrets.compare_digest(email.lower(), get_admin_email())
    valid_password = secrets.compare_digest(password, get_admin_password())

    if not (valid_email and valid_password):
        if "application/json" in content_type:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid admin email or password"}
            )
        return HTMLResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content=render_login_html(
                error="Invalid email or password. Access is restricted to authorized admin only.",
                next_url=safe_next,
                email_value=email
            )
        )

    token = create_session_token(email)
    is_secure = request.url.scheme == "https" or request.headers.get("x-forwarded-proto") == "https"

    if "application/json" in content_type:
        res = JSONResponse(content={"status": "ok", "redirect": safe_next})
    else:
        res = RedirectResponse(url=safe_next, status_code=status.HTTP_303_SEE_OTHER)

    res.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=SESSION_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=is_secure,
        path="/"
    )
    return res


@router.get("/docs/logout")
async def logout(request: Request):
    """Log out admin by clearing the session cookie."""
    res = RedirectResponse(url="/docs/login?logged_out=1", status_code=status.HTTP_303_SEE_OTHER)
    res.delete_cookie(key=COOKIE_NAME, path="/")
    return res


@router.get("/docs", response_class=HTMLResponse)
async def get_docs(request: Request, credentials: Optional[HTTPBasicCredentials] = Depends(security)):
    """Serve Swagger UI if authenticated, otherwise redirect to login."""
    if not is_authenticated(request, credentials):
        if credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Basic realm='Datovo API Docs'"},
            )
        return RedirectResponse(url="/docs/login?next=/docs", status_code=status.HTTP_303_SEE_OTHER)

    response = get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="Datovo API Documentation (Admin)",
        swagger_ui_parameters={"withCredentials": True, "persistAuthorization": True},
    )

    admin_bar = (
        '<div style="background:#0b0f19; color:#94a3b8; padding:10px 24px; font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif; font-size:13px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1e293b; position:sticky; top:0; z-index:9999;">'
        '  <div style="display:flex; align-items:center; gap:12px;">'
        '    <span style="font-weight:700; color:#ffffff; font-size:14px; letter-spacing:-0.02em;">Datovo API Docs</span>'
        '    <span style="background:rgba(99,102,241,0.15); color:#818cf8; border:1px solid rgba(99,102,241,0.3); font-size:11px; padding:2px 8px; border-radius:999px; font-weight:600;">Admin Mode</span>'
        f'    <span style="color:#64748b; font-size:12px;">Signed in as <b style="color:#cbd5e1;">{get_admin_email()}</b></span>'
        '  </div>'
        '  <div>'
        '    <a href="/docs/logout" style="color:#f87171; text-decoration:none; font-weight:600; padding:5px 12px; background:rgba(239,68,68,0.1); border-radius:6px; border:1px solid rgba(239,68,68,0.2); font-size:12px; transition:all 0.2s;">Sign Out</a>'
        '  </div>'
        '</div>'
    )
    html_content = response.body.decode("utf-8")
    if "<body>" in html_content:
        html_content = html_content.replace("<body>", f"<body>{admin_bar}", 1)
    elif "<body " in html_content:
        idx = html_content.find("<body ")
        close_tag = html_content.find(">", idx)
        if close_tag != -1:
            html_content = html_content[:close_tag+1] + admin_bar + html_content[close_tag+1:]

    return HTMLResponse(content=html_content)


@router.get("/redoc", response_class=HTMLResponse)
async def get_redoc(request: Request, credentials: Optional[HTTPBasicCredentials] = Depends(security)):
    """Serve ReDoc if authenticated, otherwise redirect to login."""
    if not is_authenticated(request, credentials):
        if credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Basic realm='Datovo API Docs'"},
            )
        return RedirectResponse(url="/docs/login?next=/redoc", status_code=status.HTTP_303_SEE_OTHER)

    return get_redoc_html(
        openapi_url="/openapi.json",
        title="Datovo API Documentation (ReDoc)",
    )


@router.get("/openapi.json")
async def get_openapi_schema(request: Request, credentials: Optional[HTTPBasicCredentials] = Depends(security)):
    """Serve OpenAPI JSON schema only to authenticated admins."""
    if not is_authenticated(request, credentials):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to access API schema",
            headers={"WWW-Authenticate": "Basic realm='Datovo API Docs'"},
        )
    return JSONResponse(content=request.app.openapi())
