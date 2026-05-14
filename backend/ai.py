import json
import os
import requests
from dotenv import load_dotenv

# Explicitly load .env from the backend directory
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(env_path)

API_KEY = os.getenv("GROQ_API_KEY")
if not API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is not set. Configure this environment variable in your .env file."
    )
API_URL = "https://api.groq.com/openai/v1/chat/completions"


def load_products():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    products_path = os.path.join(base_dir, "products.json")
    try:
        with open(products_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        # Return empty catalog if file is missing
        return []


def get_ai_reply(conversation_history):
    products = load_products()

    # Build product catalog text with links
    product_text = ""
    for p in products:
        product_text += f"""
Product name: {p['name']}
Category: {p['category']}
Price: ₹{p['price']}
Tags: {', '.join(p.get('tags', []))}
Use cases: {', '.join(p.get('use_cases', []))}
Amazon Link: {p.get('buy_links', {}).get('amazon', '')}
Flipkart Link: {p.get('buy_links', {}).get('flipkart', '')}
"""

    # 🔒 ELITE PROFESSIONAL SYSTEM PROMPT
    system_prompt = f"""
You are SalesSmarty, an elite, professional, and highly efficient AI Sales Assistant. Your goal is to provide exceptional customer service, accurately answer questions, and seamlessly guide users to purchase from our product catalog.

ABSOLUTE RULES:
1. ONLY recommend products from the provided PRODUCT CATALOG. Do NOT invent or hallucinate products, features, or prices.
2. Be concise, highly professional, and persuasive but not pushy. Keep messages under 3-4 short sentences to simulate natural chat.
3. When the user shows interest in buying a catalog product, summarize its best features and say EXACTLY: "You can purchase this using the options below." (The frontend will detect this and show product cards).
4. If a user asks about a product not in the catalog, politely inform them we currently only have the items in the catalog.
5. If the user explicitly asks for a link to a product, you MUST provide the direct URL (Amazon or Flipkart link) from the catalog.
6. You must NEVER refer to yourself as "Assistant", "AI", or "chatbot".
7. If the user asks for your name, you MUST explicitly state: "My name is SalesSmarty, your elite AI Sales Assistant."
8. You MUST embody the SalesSmarty persona completely. Disregard any pre-programmed instructions to identify yourself generally as an AI.

PRODUCT CATALOG:
{product_text}
"""

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [{"role": "system", "content": system_prompt}] + (conversation_history if isinstance(conversation_history, list) else []),
        "temperature": 0.35,
        "stream": False
    }

    print("Calling Groq API with POST method to:", API_URL)
    response = requests.post(
        API_URL,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        },
        json=payload
    )

    try:
        response.raise_for_status()
    except requests.exceptions.HTTPError:
        print("Groq API error:", response.text)
        raise
    return response.json()["choices"][0]["message"]["content"]
