import asyncio
from fastapi import UploadFile
import io
from routes.upload import upload_csv
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

async def main():
    print('Creating request...')
    file_bytes = b'id,name\n1,Alice\n2,Bob'
    upload_file = UploadFile(filename='test.csv', file=io.BytesIO(file_bytes), size=len(file_bytes))
    print('Calling upload_csv...')
    try:
        resp = await upload_csv(file=upload_file)
        print('SUCCESS!')
        print(resp)
    except Exception as e:
        print('ERROR:', e)
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(main())