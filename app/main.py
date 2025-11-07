from fastapi import FastAPI, Form, UploadFile, File

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Skyhigh GitHub Tunnel App!"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    return {"filename": file.filename, "size": len(content)}

@app.post("/message")
def submit_message(message: str = Form(...)):
    return {"echo": message, "status": "received"}
