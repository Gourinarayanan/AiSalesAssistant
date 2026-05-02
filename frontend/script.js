const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const micBtn = document.querySelector(".mic");
const speakerBtn = document.querySelector(".speaker");

let voiceEnabled = true;
let recognition;

/* =====================
BACKEND URL
===================== */
const BACKEND_URL = "https://aisalesassistant-backend.onrender.com";

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
msg.innerText = text;

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

/* =====================
SEND MESSAGE
===================== */
async function sendMessage() {
const message = input.value.trim();
if (!message) return;

stopSpeaking();
addMessage(message, "user");
input.value = "";

addMessage("Typing...", "bot");
const typing = chatBox.lastChild;

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

if (!res.ok) throw new Error("API error");

const data = await res.json();
typing.remove();
addMessage(data.reply || "No response", "bot");

} catch (err) {
console.error(err);
typing.remove();
addMessage("⚠️ Server not responding. Try again.", "bot");
}
}

/* ENTER KEY */
input.addEventListener("keydown", e => {
if (e.key === "Enter") sendMessage();
});

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
    <button onclick="window.open('${p.amazon}', '_blank')">Amazon</button>
    <button onclick="window.open('${p.flipkart}', '_blank')">Flipkart</button>
  </div>
`;
chatBox.appendChild(card);
chatBox.scrollTop = chatBox.scrollHeight;

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
}
