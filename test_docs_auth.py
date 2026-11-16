import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app, follow_redirects=False)

def test_docs_auth():
    print("--- 1. Testing Unauthenticated Access ---")
    
    # 1. GET /docs should redirect to /docs/login
    res = client.get("/docs")
    assert res.status_code == 303, f"Expected 303, got {res.status_code}"
    assert "/docs/login?next=/docs" in res.headers["location"]
    print("PASS: /docs redirects to /docs/login")

    # 2. GET /redoc should redirect to /docs/login
    res = client.get("/redoc")
    assert res.status_code == 303, f"Expected 303, got {res.status_code}"
    assert "/docs/login?next=/redoc" in res.headers["location"]
    print("PASS: /redoc redirects to /docs/login")

    # 3. GET /openapi.json should return 401 Unauthorized
    res = client.get("/openapi.json")
    assert res.status_code == 401, f"Expected 401, got {res.status_code}"
    print("PASS: /openapi.json returns 401 Unauthorized")

    # 4. GET /docs/login should return 200 OK HTML
    res = client.get("/docs/login")
    assert res.status_code == 200
    assert "Datovo API Docs" in res.text
    print("PASS: /docs/login renders login page")

    print("\n--- 2. Testing Invalid Credentials ---")
    # 5. POST /docs/login with incorrect password
    res = client.post("/docs/login", data={"email": "salunkeparasorg@gmail.com", "password": "wrongpassword"})
    assert res.status_code == 401
    assert "Invalid email or password" in res.text
    print("PASS: Invalid password rejected with 401")

    # 6. POST /docs/login with incorrect email
    res = client.post("/docs/login", data={"email": "hacker@example.com", "password": "DatovoAdmin@2026!"})
    assert res.status_code == 401
    assert "Invalid email or password" in res.text
    print("PASS: Invalid email rejected with 401")

    print("\n--- 3. Testing Successful Login & Cookie ---")
    # 7. POST /docs/login with correct credentials
    res = client.post("/docs/login", data={"email": "salunkeparasorg@gmail.com", "password": "DatovoAdmin@2026!", "next": "/docs"})
    assert res.status_code == 303
    assert res.headers["location"] == "/docs"
    cookie_header = res.headers.get("set-cookie")
    assert "datovo_docs_session" in cookie_header
    print("PASS: Login successful, 303 redirect with datovo_docs_session cookie")

    # Extract session cookie value
    session_cookie = res.cookies.get("datovo_docs_session")
    cookies = {"datovo_docs_session": session_cookie}

    print("\n--- 4. Testing Authenticated Access with Cookie ---")
    # 8. GET /docs with session cookie
    res = client.get("/docs", cookies=cookies)
    assert res.status_code == 200
    assert "swagger-ui" in res.text.lower()
    assert "Admin Mode" in res.text
    assert "salunkeparasorg@gmail.com" in res.text
    print("PASS: /docs returns 200 OK with Swagger UI and Admin bar")

    # 9. GET /redoc with session cookie
    res = client.get("/redoc", cookies=cookies)
    assert res.status_code == 200
    assert "redoc" in res.text.lower()
    print("PASS: /redoc returns 200 OK with ReDoc HTML")

    # 10. GET /openapi.json with session cookie
    res = client.get("/openapi.json", cookies=cookies)
    assert res.status_code == 200
    schema = res.json()
    assert "openapi" in schema
    assert "paths" in schema
    print(f"PASS: /openapi.json returns 200 OK with {len(schema['paths'])} API paths")

    print("\n--- 5. Testing HTTP Basic Authentication ---")
    # 11. GET /openapi.json with valid Basic Auth
    res = client.get("/openapi.json", auth=("salunkeparasorg@gmail.com", "DatovoAdmin@2026!"))
    assert res.status_code == 200
    print("PASS: /openapi.json accessible via HTTP Basic Auth")

    # 12. GET /openapi.json with invalid Basic Auth
    res = client.get("/openapi.json", auth=("salunkeparasorg@gmail.com", "badpass"))
    assert res.status_code == 401
    print("PASS: Invalid HTTP Basic Auth rejected with 401")

    print("\n--- 6. Testing Logout ---")
    # 13. GET /docs/logout
    res = client.get("/docs/logout", cookies=cookies)
    assert res.status_code == 303
    assert "/docs/login?logged_out=1" in res.headers["location"]
    
    # 14. GET /docs without cookie should redirect again
    res = client.get("/docs")
    assert res.status_code == 303
    print("PASS: Logout works and deletes session")

    print("\nALL 14 CHECKS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_docs_auth()
