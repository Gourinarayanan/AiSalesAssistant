# AI Sales Assistant

A web-based AI sales assistant built with FastAPI backend and vanilla JavaScript frontend.

## Features

- Conversational AI powered by Groq API
- Product recommendations from catalog
- WhatsApp-like chat interface
- Voice input support (if enabled in browser)

## Local Development

1. Clone the repository
2. Create virtual environment: `python -m venv .venv`
3. Activate: `.venv\Scripts\activate` (Windows) or `source .venv/bin/activate` (Linux/Mac)
4. Install dependencies: `pip install -r backend/requirements.txt`
5. Set environment variable: Create `.env` file inside `backend/` with `GROQ_API_KEY=your_key_here`
6. Run backend: `cd backend && uvicorn main:app --reload`
7. Run frontend: `cd frontend && python -m http.server 3000`
8. Open `http://localhost:3000` in browser

## API

- `POST /chat` - Send message and get AI response
  - Body: `{"message": "Hello", "session_id": "user123"}`

## License

MIT