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
5. Set environment variable: Create `.env` file with `GROQ_API_KEY=your_key_here`
6. Run backend: `uvicorn backend.main:app --reload`
7. Run frontend: `cd frontend && python -m http.server 3000`
8. Open `http://localhost:3000` in browser

## Deployment

### Backend (Render.com - Free)

1. Go to [Render.com](https://render.com) and sign up
2. Connect your GitHub account
3. Create a new **Web Service**
4. Select your `AiSalesAssistant` repository
5. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variable: `GROQ_API_KEY` with your API key
7. Deploy

### Frontend (Vercel - Free)

1. Go to [Vercel.com](https://vercel.com) and sign up
2. Connect your GitHub account
3. Import your `AiSalesAssistant` repository
4. Configure:
   - **Root Directory**: `frontend`
5. Update `script.js` line 84 to use your Render backend URL instead of `http://127.0.0.1:8000`
6. Deploy

## API

- `POST /chat` - Send message and get AI response
  - Body: `{"message": "Hello", "session_id": "user123"}`

## License

MIT