import json
import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY")
API_URL = "https://api.groq.com/openai/v1/chat/completions"


def load_products():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    products_path = os.path.join(base_dir, "products.json")
    with open(products_path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_ai_reply(conversation_history):
    products = load_products()

    # Build product catalog text (NO LINKS EXPOSED)
    product_text = ""
    for p in products:
        product_text += f"""
Product name: {p['name']}
Category: {p['category']}
Price: ₹{p['price']}
Tags: {', '.join(p.get('tags', []))}
Use cases: {', '.join(p.get('use_cases', []))}
Purchase options: Amazon, Flipkart
"""

    # 🔒 HARD-CONSTRAINED SYSTEM PROMPT
    system_prompt = f"""
You are a friendly, intelligent AI assistant similar to ChatGPT.

ABSOLUTE RULES (MUST FOLLOW):

PRODUCT RULES:
  - Confirm availability
  - Say exactly: "You can purchase this using the options below."

CONVERSATION STYLE:

IMPORTANT:

PRODUCT CATALOG:
{product_text}
"""

    payload = {
        "model": "llama3-70b-8192",
        "messages": [
            {"role": "system", "content": system_prompt},
            *conversation_history
        ],
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
