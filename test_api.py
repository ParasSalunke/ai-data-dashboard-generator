"""Quick end-to-end API test using only stdlib."""
import urllib.request
import json
import sys

CSV_PATH = "test_employees.csv"
BASE_URL = "http://localhost:8000"

def multipart_upload(filepath, url):
    boundary = "TestBoundary9999"
    with open(filepath, "rb") as f:
        csv_data = f.read()
    body = (
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; "
        f"filename=\"test_employees.csv\"\r\nContent-Type: text/csv\r\n\r\n"
    ).encode() + csv_data + f"\r\n--{boundary}--\r\n".encode()
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    return urllib.request.urlopen(req, timeout=30)

# 1. Health
print("[1] Health check...")
r = urllib.request.urlopen(f"{BASE_URL}/health", timeout=10)
health = json.loads(r.read())
print("   ", health)

# 2. Upload
print("[2] Upload CSV...")
r = multipart_upload(CSV_PATH, f"{BASE_URL}/upload")
upload = json.loads(r.read())
dataset_id = upload["dataset_id"]
print(f"    dataset_id: {dataset_id}")
print(f"    rows={upload['row_count']}  cols={upload['col_count']}")
for col in upload["columns"]:
    print(f"      {col['name']} -> {col['dtype']}  (null_pct={col['null_pct']}%)")

# 3. Analyze
print("[3] Analyze...")
body = json.dumps({"dataset_id": dataset_id}).encode()
req = urllib.request.Request(
    f"{BASE_URL}/analyze",
    data=body,
    headers={"Content-Type": "application/json"},
    method="POST",
)
r = urllib.request.urlopen(req, timeout=30)
analyze = json.loads(r.read())
charts = analyze["chart_suggestions"]
print(f"    Charts generated: {len(charts)}")
for c in charts:
    print(f"      [{c['type']}] {c['title']}  ({len(c['data'])} data points)")

# 4. Insights
print("[4] Insights (AI)...")
req = urllib.request.Request(
    f"{BASE_URL}/insights",
    data=json.dumps({"dataset_id": dataset_id}).encode(),
    headers={"Content-Type": "application/json"},
    method="POST",
)
r = urllib.request.urlopen(req, timeout=60)
insights = json.loads(r.read())
print(f"    Insights count: {len(insights['insights'])}")
for ins in insights["insights"]:
    print(f"      [{ins['type']}] {ins['title']}")

print("\n✅ ALL TESTS PASSED")
