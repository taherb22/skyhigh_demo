from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from .database import db
import gridfs

app = FastAPI()

# Allow CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fs = gridfs.GridFS(db)

@app.get("/")
def read_root():
    return {"message": "Skyhigh Demo Backend is running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    fs.put(content, filename=file.filename)
    return {"status": "uploaded", "filename": file.filename}

@app.get("/files")
def list_files():
    files = [{"filename": f.filename, "length": f.length} for f in fs.find()]
    return files

@app.post("/message")
def submit_message(message: str = Form(...)):
    db.messages.insert_one({"message": message})
    return {"status": "received", "message": message}
