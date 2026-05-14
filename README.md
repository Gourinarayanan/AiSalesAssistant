# AI Sales Assistant (SalesSmarty)

An intelligent, web-based AI sales assistant designed to help customers explore products, get recommendations, and find direct purchase links. 

## 🚀 Tech Stack

### Frontend
- **HTML5 & CSS3**: Custom-styled, responsive WhatsApp-like chat interface.
- **Vanilla JavaScript**: Handles state, voice API interactions, and API fetching without any bulky frameworks.
- **Deployment**: Vercel

### Backend
- **Python 3**: Core backend logic.
- **FastAPI & Uvicorn**: High-performance asynchronous web framework for serving the API.
- **Deployment**: Render

### Artificial Intelligence
- **Groq API**: Blazing fast inference.
- **Model**: `llama-3.1-8b-instant`
- **Prompt Engineering**: Custom system prompts to strictly enforce a professional sales persona ("SalesSmarty") and restrict hallucinations.

## ✨ Features & How to Use

1. **Text Chat**: Type your queries into the chatbox. You can ask for recommendations like, *"I need a laptop for video editing"* or *"Show me some wireless headphones."*
2. **Dynamic Product Links**: The AI reads directly from the `products.json` database. If you ask, *"Can you give me the link for the Apple Watch?"*, it will automatically provide clickable **Amazon** and **Flipkart** URLs!
3. **Voice Input (Speech-to-Text)**: Click the microphone icon next to the chatbox to speak your query out loud (requires a supported browser like Chrome).
4. **Voice Output (Text-to-Speech)**: The AI will read its responses out loud. You can mute/unmute this feature using the speaker icon at the top right.
5. **Session Memory**: The backend maintains session histories, allowing for follow-up questions and contextual conversation.

## 🛠️ Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gourinarayanan/AiSalesAssistant.git
   cd AiSalesAssistant
   ```

2. **Set up the Backend Environment**
   ```bash
   python -m venv .venv
   # Windows
   .venv\Scripts\activate 
   # Mac/Linux
   source .venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Secrets**
   - Create a `.env` file in the `backend/` folder (you can copy `.env.example`).
   - Add your Groq API Key:
     ```env
     GROQ_API_KEY=your_groq_api_key_here
     ```

5. **Run the Backend (FastAPI)**
   ```bash
   python backend/main.py
   ```
   *(The server will start on `http://127.0.0.1:8000`)*

6. **Run the Frontend**
   - Open `frontend/index.html` directly in your browser or run a simple local server:
   ```bash
   cd frontend
   python -m http.server 3000
   ```

## 🔌 API Endpoints

- **`POST /chat`**
  - **Description**: Sends a message to the AI and retrieves a contextual response.
  - **Body Payload**:
    ```json
    {
      "message": "Do you sell any gaming consoles?",
      "session_id": "user123"
    }
    ```
  - **Response**:
    ```json
    {
      "reply": "Yes! We have the Sony PlayStation 5 (Slim) available for ₹44,990."
    }
    ```

## 📝 License

MIT