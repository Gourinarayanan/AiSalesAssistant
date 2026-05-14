import sys
import os

# Ensure the root directory is in sys.path so that absolute imports work flawlessly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.ai import get_ai_reply, load_products

app = FastAPI()

@app.get("/")
def health_check():
    return {"status": "ok"}

@app.get("/products")
def get_products():
    return load_products()

# CORS (allow frontend to call backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Restrict this to specific domains in production
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

    # Create a temporary history with the new user message
    temp_history = sessions[req.session_id] + [{
        "role": "user",
        "content": req.message
    }]

    try:
        # Pass the temporary history to the AI
        reply = get_ai_reply(temp_history)
    except Exception as e:
        # If the API fails, the state is NOT corrupted.
        raise HTTPException(status_code=500, detail=str(e))

    # Commit both messages to the session only on success
    sessions[req.session_id] = temp_history + [{
        "role": "assistant",
        "content": reply
    }]

    return {"reply": reply}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")