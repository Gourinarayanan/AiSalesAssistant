from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ai import get_ai_reply   # ✅ FIXED import

app = FastAPI()

@app.get("/")
def health_check():
    return {"status": "ok"}

# CORS (allow frontend to call backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # You can later restrict to your Vercel URL
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory session storage
sessions = {}

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"

@app.post("/chat")
def chat(req: ChatRequest):
    if req.session_id not in sessions:
        sessions[req.session_id] = []

    sessions[req.session_id].append({
        "role": "user",
        "content": req.message
    })

    reply = get_ai_reply(sessions[req.session_id])

    sessions[req.session_id].append({
        "role": "assistant",
        "content": reply
    })

    return {"reply": reply}