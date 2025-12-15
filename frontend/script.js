const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const micBtn = document.querySelector(".mic");
const speakerBtn = document.querySelector(".speaker");

let voiceEnabled = true;
let recognition;

/* =====================
   TIME UTILITY
===================== */
function getTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

/* =====================
   PRODUCT CATALOG
   (LINKED TO AMAZON / FLIPKART)
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
   ADD MESSAGE TO CHAT
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
   SEND MESSAGE TO BACKEND
===================== */
async function sendMessage() {
  const message = input.value.trim();
  if (!message) return;

  stopSpeaking();
  addMessage(message, "user");
  input.value = "";

  addMessage("Typing…", "bot");
  const typing = chatBox.lastChild;

  try {
    const res = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    typing.remove();
    addMessage(data.reply, "bot");

  } catch (err) {
    typing.remove();
    addMessage("⚠️ Server error. Please try again.", "bot");
  }
}

/* ENTER KEY SUPPORT */
input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

/* =====================
   PRODUCT CARD RENDER
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
          <button class="buy-btn" onclick="buyAmazon('${p.amazon}')">
            Buy on Amazon
          </button>
          <button class="compare-btn" onclick="buyFlipkart('${p.flipkart}')">
            Buy on Flipkart
          </button>
        </div>
      `;

      chatBox.appendChild(card);
      chatBox.scrollTop = chatBox.scrollHeight;
      break;
    }
  }
}

/* =====================
   BUY REDIRECTS
===================== */
function buyAmazon(url) {
  window.open(url, "_blank");
}

function buyFlipkart(url) {
  window.open(url, "_blank");
}

/* =====================
   🎙️ VOICE INPUT
===================== */
function startVoice() {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Voice input not supported in this browser.");
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
   🔊 SMART AI VOICE OUTPUT
   (NO CUT-OFF, SENTENCE CHUNKS)
===================== */
function smartSpeak(text) {
  if (!voiceEnabled || !("speechSynthesis" in window)) return;

  speechSynthesis.cancel();

  // Clean unnecessary technical noise
  let cleanText = text
    .replace(/₹\d+[,0-9]*/g, "")
    .replace(/Intel.*SSD/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const sentences = cleanText.match(/[^.!?]+[.!?]*/g);
  if (!sentences) return;

  let index = 0;

  function speakNext() {
    if (index >= sentences.length || !voiceEnabled) return;

    const utterance = new SpeechSynthesisUtterance(
      sentences[index].trim()
    );
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      index++;
      setTimeout(speakNext, 150); // natural pause
    };

    speechSynthesis.speak(utterance);
  }

  speakNext();
}

function stopSpeaking() {
  if ("speechSynthesis" in window) {
    speechSynthesis.cancel();
  }
}

/* =====================
   🔇 TOGGLE VOICE
===================== */
function toggleVoice() {
  voiceEnabled = !voiceEnabled;
  speakerBtn.classList.toggle("muted");
  stopSpeaking();
}
