# Run with: uvicorn main:app --host 127.0.0.1 --port 9000

from fastapi import FastAPI, File, UploadFile
from fastapi.responses import StreamingResponse
from rembg import remove, new_session
from io import BytesIO
from PIL import Image

app = FastAPI()

session = new_session("isnet-general-use")

@app.post("/remove-bg/")
async def remove_bg(file: UploadFile = File(...)):
    try:
        input_bytes = await file.read()
        input_image = Image.open(BytesIO(input_bytes)).convert("RGBA")

        output_bytes = remove(input_bytes, session=session)

        return StreamingResponse(BytesIO(output_bytes), media_type="image/png", headers={
            "Content-Disposition": "inline; filename=output.png"
        })

    except Exception as e:
        return {"error": str(e)}
