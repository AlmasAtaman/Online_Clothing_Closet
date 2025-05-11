# Run with: uvicorn main:app --host 127.0.0.1 --port 9000

from fastapi import FastAPI, File, UploadFile
from fastapi.responses import StreamingResponse
from rembg import remove
from io import BytesIO
from PIL import Image
import numpy as np

app = FastAPI()

@app.post("/remove-bg/")
async def remove_bg(file: UploadFile = File(...)):
    try:
        input_bytes = await file.read()
        input_image = Image.open(BytesIO(input_bytes)).convert("RGBA")
        output = remove(input_image)

        output_stream = BytesIO()
        output.save(output_stream, format="PNG")
        output_stream.seek(0)

        return StreamingResponse(output_stream, media_type="image/png", headers={
            "Content-Disposition": "inline; filename=output.png"
        })

    except Exception as e:
        return {"error": str(e)}
