// DOM elements (will be initialized on load)
let chatBox, input, micBtn, speakerBtn;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  chatBox = document.getElementById("chat-box");
  input = document.getElementById("user-input");
  micBtn = document.querySelector(".mic");
  speakerBtn = document.querySelector(".speaker");
  
  // Attach event listeners
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });
});

let voiceEnabled = true;
let recognition;

/* =====================
BACKEND URL
===================== */
const BACKEND_URL = "http://127.0.0.1:8000";

/* =====================
TIME
===================== */
function getTime() {
return new Date().toLocaleTimeString([], {
hour: "2-digit",
minute: "2-digit"
});
}

/* =====================
PRODUCT CATALOG
===================== */
const productCatalog = {
"student laptop": {
title: "Student Laptop",
price: "₹55,000",
features: "Intel i5 • 16GB RAM • 512GB SSD",
amazon: "https://www.amazon.in/s?k=student+laptop+i5+16gb",
flipkart: "https://www.flipkart.com/search?q=student+laptop+i5+16gb"
},
"budget tablet": {
title: "Budget Tablet",
price: "₹18,000",
features: "10-inch display • Stylus support",
amazon: "https://www.amazon.in/s?k=budget+tablet+10+inch",
flipkart: "https://www.flipkart.com/search?q=budget+tablet"
},
"power bank": {
title: "Power Bank 20000mAh",
price: "₹2,000",
features: "Fast charging • Dual USB",
amazon: "https://www.amazon.in/s?k=power+bank+20000mah",
flipkart: "https://www.flipkart.com/search?q=power+bank+20000mah"
}
};

/* =====================
ADD MESSAGE
===================== */
function addMessage(text, sender) {
const msg = document.createElement("div");
msg.className = `msg ${sender}`;

// Escape HTML first to prevent XSS from user input or AI
const escapedText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// Linkify URLs
const urlRegex = /(https?:\/\/[^\s]+)/g;
const linkedText = escapedText.replace(urlRegex, '<a href="$1" target="_blank" style="color: #007bff; text-decoration: underline;">$1</a>');

msg.innerHTML = linkedText;

const time = document.createElement("span");
time.className = "timestamp";
time.innerText = getTime();
msg.appendChild(time);

chatBox.appendChild(msg);
chatBox.scrollTop = chatBox.scrollHeight;

if (sender === "bot") {
renderProductCard(text);
smartSpeak(text);
}
}

function getFallbackReply(userMessage) {
const lower = userMessage.toLowerCase();
for (const key in productCatalog) {
if (lower.includes(key)) {
const p = productCatalog[key];
return `I’m offline right now, but here’s a quick product suggestion:\n${p.title} for ${p.price}. ${p.features}.`;
}
}
return "I’m sorry, the AI backend is unavailable. Try again later or ask about student laptop, budget tablet, or power bank.";
}

/* =====================
SEND MESSAGE
===================== */
async function sendMessage() {
const message = input.value.trim();
if (!message) return;

stopSpeaking();
addMessage(message, "user");
input.value = "";

const typingIndicator = document.createElement("div");
typingIndicator.className = "msg bot typing-indicator";
typingIndicator.innerHTML = `
  <div class="typing-dot"></div>
  <div class="typing-dot"></div>
  <div class="typing-dot"></div>
`;
chatBox.appendChild(typingIndicator);
chatBox.scrollTop = chatBox.scrollHeight;

try {
const res = await fetch(`${BACKEND_URL}/chat`, {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
message: message,
session_id: "user1"
})
});

if (!res.ok) {
const errorData = await res.json().catch(() => null);
throw new Error(errorData?.detail || "API error");
}

const data = await res.json();
typingIndicator.remove();
addMessage(data.reply || "No response", "bot");

} catch (err) {
console.error(err);
typingIndicator.remove();
addMessage(`⚠️ AI backend unavailable. ${getFallbackReply(message)}`, "bot");
}
}


/* =====================
PRODUCT CARD
===================== */
function renderProductCard(text) {
const lower = text.toLowerCase();

for (const key in productCatalog) {
if (lower.includes(key)) {
const p = productCatalog[key];

  const card = document.createElement("div");
card.className = "product-card";

card.innerHTML = `
  <div class="product-title">${p.title}</div>
  <div class="product-price">${p.price}</div>
  <div class="product-features">${p.features}</div>
  <div class="product-actions">
    <button class="buy-btn" onclick="window.open('${p.amazon}', '_blank')">Amazon</button>
    <button class="compare-btn" onclick="window.open('${p.flipkart}', '_blank')">Flipkart</button>
  </div>
`;
chatBox.appendChild(card);
chatBox.scrollTop = chatBox.scrollHeight;

}
}
}
/* =====================
VOICE INPUT
===================== */
function startVoice() {
if (!("webkitSpeechRecognition" in window)) {
alert("Voice input not supported.");
return;
}

stopSpeaking();

recognition = new webkitSpeechRecognition();
recognition.lang = "en-US";

recognition.onstart = () => micBtn.classList.add("listening");
recognition.onend = () => micBtn.classList.remove("listening");

recognition.onresult = e => {
input.value = e.results[0][0].transcript;
sendMessage();
};

recognition.start();
}

/* =====================
VOICE OUTPUT
===================== */
function smartSpeak(text) {
if (!voiceEnabled || !("speechSynthesis" in window)) return;

speechSynthesis.cancel();

const sentences = text.match(/[^.!?]+[.!?]*/g);
if (!sentences) return;

let i = 0;

function speakNext() {
if (i >= sentences.length) return;

const utter = new SpeechSynthesisUtterance(sentences[i]);
utter.rate = 0.95;

utter.onend = () => {
  i++;
  setTimeout(speakNext, 150);
};

speechSynthesis.speak(utter);

}

speakNext();
}

function stopSpeaking() {
if ("speechSynthesis" in window) speechSynthesis.cancel();
}

/* =====================
TOGGLE VOICE
===================== */
function toggleVoice() {
  voiceEnabled = !voiceEnabled;
  speakerBtn.classList.toggle("muted");
  stopSpeaking();
  
  const icon = document.getElementById("speaker-icon");
  if (voiceEnabled) {
    icon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>';
  } else {
    icon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>';
  }
}
