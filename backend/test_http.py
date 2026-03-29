import requests
print('Sending post to localhost:8000/upload...')
try:
    with open('test_large.csv', 'rb') as f:
        r = requests.post('http://localhost:8000/upload', files={'file': f})
    print('STATUS', r.status_code)
    print('BODY', r.text[:200])
except Exception as e:
    print('ERROR:', e)