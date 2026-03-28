"""Test just the upload endpoint with detailed error output."""
import urllib.request
import json

BASE_URL = "http://localhost:8000"
boundary = "TestBoundary9999"

with open("test_employees.csv", "rb") as f:
    csv_data = f.read()

print(f"CSV data: {len(csv_data)} bytes")

body = (
    f"--{boundary}\r\n"
    f'Content-Disposition: form-data; name="file"; filename="test_employees.csv"\r\n'
    f"Content-Type: text/csv\r\n\r\n"
).encode() + csv_data + f"\r\n--{boundary}--\r\n".encode()

req = urllib.request.Request(
    f"{BASE_URL}/upload",
    data=body,
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    method="POST",
)
try:
    r = urllib.request.urlopen(req, timeout=30)
    data = json.loads(r.read())
    print("SUCCESS!")
    print(json.dumps(data, indent=2)[:1000])
except urllib.error.HTTPError as e:
    err_body = e.read().decode()
    print(f"HTTP {e.code}: {err_body[:500]}")
except Exception as ex:
    print(f"ERROR: {ex}")
