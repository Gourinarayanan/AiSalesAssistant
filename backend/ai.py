import json
import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY")
API_URL = "https://api.groq.com/openai/v1/chat/completions"


def load_products():
    with open("products.json", "r", encoding="utf-8") as f:
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
---
"""

    # 🔒 HARD-CONSTRAINED SYSTEM PROMPT
    system_prompt = f"""
You are a friendly, intelligent AI assistant similar to ChatGPT.

ABSOLUTE RULES (MUST FOLLOW):
- You NEVER include URLs or web links in responses.
- You NEVER mention generic domains like amazon.com or flipkart.com.
- You NEVER ask users to search manually.
- You do NOT own a physical store.
- You do NOT offer discounts, coupons, or free shipping.
- You do NOT collect addresses, phone numbers, or payments.
- You do NOT invent store policies or availability.

PRODUCT RULES:
- You can recommend ONLY products from the catalog below.
- All products are available ONLY via Amazon or Flipkart.
- When a user wants to buy a product:
  - Confirm availability
  - Say exactly: "You can purchase this using the options below."

CONVERSATION STYLE:
- Talk naturally and conversationally like ChatGPT.
- Answer general questions freely.
- Recommend products ONLY when relevant.
- Ask clarifying questions if needed.
- Do NOT push sales aggressively.

IMPORTANT:
- Let the UI handle all purchase redirection.
- Do NOT output links under any circumstance.

PRODUCT CATALOG:
{product_text}
"""

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": system_prompt},
            *conversation_history
        ],
        "temperature": 0.35
    }

    response = requests.post(
        API_URL,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        },
        json=payload
    )

    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]
