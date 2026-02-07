import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

/* ---- Secret console love letter ---- */

console.log(
  "%c💌 A secret message for you... 💌",
  "font-size:16px;font-weight:bold;color:#ff6090;text-shadow:0 0 10px rgba(255,96,144,0.5);padding:8px 0;"
);
console.log(
  "%cIf you're reading this, you've found my hidden love note.\n\n" +
  "You are the most beautiful thing that ever happened to me.\n" +
  "Every line of code on this page was written thinking of you.\n" +
  "You are my sunflower, my moon, and my everything.\n\n" +
  "I love you. Forever and always. ❤\n\n" +
  "— Yours, in this life and every life after.",
  "font-size:12px;color:#ffb0d0;line-height:1.8;font-family:Georgia,serif;"
);
console.log(
  "%c♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥",
  "font-size:10px;color:#ff3060;letter-spacing:4px;"
);

/* ---- Constants ---- */

const AUTH_KEY = "valentine-auth-answer";
const AUTH_OK_KEY = "valentine-auth-ok";
const ANSWER_KEY = "valentine-final-answer";
const ANSWER_LINK_KEY = "valentine-answer-link";
const INTRO_SEEN_KEY = "valentine-intro-seen";
const SECRET_ANSWER = "shootthecameraman";

/* ---- DOM refs ---- */

const authForm = document.querySelector("#auth-form");
const answerInput = document.querySelector("#secret-answer");
const authError = document.querySelector("#auth-error");
const yesBtn = document.querySelector("#yes-btn");
const noBtn = document.querySelector("#no-btn");
const noMessage = document.querySelector("#no-message");
const answerCard = document.querySelector("#answer-card");
const alreadyAgreedNote = document.querySelector("#already-agreed");
const tryAgainBtn = document.querySelector("#try-again");
const easterEgg = document.querySelector("#easter-egg");
const badge = document.querySelector(".badge");
const dogScene = document.querySelector("#dog-scene");

/* ---- Helpers ---- */

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const normalize = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();

const safeSetItem = (key, value) => {
  try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
};

const safeGetItem = (key) => {
  try { return localStorage.getItem(key); } catch (e) { return null; }
};

const safeRemoveItem = (key) => {
  try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
};

/* ---- Firebase ---- */

let db = null;
try {
  const { firebaseConfig } = await import("./firebase-config.js");
  if (firebaseConfig && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
} catch (e) {
  // firebase-config.js not found — Firebase features disabled
}

/* ---- Storage helpers ---- */

const storeAuthAnswer = (answer) => safeSetItem(AUTH_KEY, answer.trim());
const setAuthOk = () => safeSetItem(AUTH_OK_KEY, "true");
const isAuthOk = () => safeGetItem(AUTH_OK_KEY) === "true";

const storeFinalAnswer = (answer) => {
  safeSetItem(ANSWER_KEY, JSON.stringify({ answer, at: new Date().toISOString() }));
};

const hasSavedYes = () => {
  const stored = safeGetItem(ANSWER_KEY);
  if (!stored) return false;
  try { return JSON.parse(stored)?.answer === "Yes"; } catch (e) { return false; }
};

/* ---- Firebase writes ---- */

const notifyYesToFirebase = async (finalAnswer) => {
  if (!db) return;
  await addDoc(collection(db, "valentineResponses"), {
    finalAnswer,
    authAnswer: safeGetItem(AUTH_KEY) || "",
    userAgent: navigator.userAgent,
    createdAt: serverTimestamp(),
  });
};

const notifyAuthAttemptToFirebase = async (enteredAnswer, isCorrect) => {
  if (!db) return;
  const col = isCorrect ? "valentineSuccessResponses" : "valentineFailureResponses";
  await addDoc(collection(db, col), {
    enteredAnswer,
    isCorrect,
    userAgent: navigator.userAgent,
    createdAt: serverTimestamp(),
  });
};

/* ---- Reveal answer card (quiet) ---- */

const revealAnswerCard = () => {
  if (!answerCard) return;
  answerCard.classList.remove("hidden");
  answerCard.scrollIntoView({ behavior: "smooth", block: "center" });
  storeFinalAnswer("Yes");
};

/* ---- Easter egg ---- */

const revealEasterEgg = () => {
  if (!easterEgg) return;
  easterEgg.textContent = easterEgg.dataset.message || "You found a little secret.";
  easterEgg.classList.remove("hidden");
  window.clearTimeout(revealEasterEgg._timer);
  revealEasterEgg._timer = window.setTimeout(() => easterEgg.classList.add("hidden"), 3500);
};

/* ---- Background effects ---- */

const initHeartField = () => {
  const field = document.querySelector(".heart-field");
  if (!field) return;
  const heartChars = ["❤", "♥", "💕", "♡", "❤"];
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 200; i += 1) {
    const heart = document.createElement("span");
    heart.textContent = heartChars[Math.floor(Math.random() * heartChars.length)];
    heart.style.top = `${Math.random() * 100}%`;
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${0.5 + Math.random() * 0.9}rem`;
    heart.style.opacity = (0.1 + Math.random() * 0.3).toFixed(2);
    if (Math.random() < 0.25) {
      heart.classList.add("sparkle");
      heart.style.animationDelay = `${Math.random() * 5}s`;
      heart.style.animationDuration = `${2 + Math.random() * 4}s`;
    }
    fragment.appendChild(heart);
  }
  field.appendChild(fragment);
};

const initShootingStars = () => {
  const container = document.querySelector(".shooting-stars");
  if (!container) return;
  const spawnStar = () => {
    const star = document.createElement("span");
    star.className = "shooting-star";
    const duration = 1.2 + Math.random() * 1.4;
    star.style.top = `${Math.random() * 40}%`;
    star.style.left = `${Math.random() * 60}%`;
    star.style.width = `${140 + Math.random() * 140}px`;
    star.style.height = `${1 + Math.random() * 1.4}px`;
    star.style.animationDuration = `${duration}s`;
    container.appendChild(star);
    window.setTimeout(() => star.remove(), duration * 1000 + 200);
  };
  const schedule = () => {
    spawnStar();
    window.setTimeout(schedule, 2500 + Math.random() * 4500);
  };
  window.setTimeout(schedule, 1200);
};

/* ---- Dog animation ---- */

const playDogAnimation = () => {
  if (!dogScene) return Promise.resolve();
  dogScene.classList.remove("hidden");
  dogScene.scrollIntoView({ behavior: "smooth", block: "center" });
  return new Promise((resolve) => {
    window.setTimeout(resolve, 4600);
  });
};

/* ---- Celebration hearts ---- */

const spawnCelebrationHearts = () => {
  const symbols = ["❤", "♥", "💕", "✦", "💖", "💗", "🌹", "✨"];
  const colors = ["#ff3060", "#ff6090", "#ff80a0", "#ff4080", "#e050a0", "#c060c0"];
  for (let i = 0; i < 50; i += 1) {
    const h = document.createElement("span");
    h.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    h.style.position = "fixed";
    h.style.left = `${Math.random() * 100}vw`;
    h.style.top = `${50 + Math.random() * 50}vh`;
    h.style.fontSize = `${0.7 + Math.random() * 1.8}rem`;
    h.style.color = colors[Math.floor(Math.random() * colors.length)];
    h.style.zIndex = "999";
    h.style.pointerEvents = "none";
    h.style.opacity = "0";
    h.style.filter = `drop-shadow(0 0 4px ${colors[Math.floor(Math.random() * colors.length)]})`;
    h.style.animation = `celebrateRise ${1.5 + Math.random() * 2.5}s ease-out ${Math.random() * 1}s forwards`;
    document.body.appendChild(h);
    window.setTimeout(() => h.remove(), 5500);
  }
};

/* ---- Fireworks burst ---- */

const spawnFirework = (x, y) => {
  const count = 28;
  const colors = ["#ff3060", "#ff80b0", "#ffb0d0", "#ffd700", "#ff6090", "#e060ff", "#ff4080"];
  for (let i = 0; i < count; i += 1) {
    const spark = document.createElement("span");
    spark.textContent = Math.random() > 0.4 ? "✦" : "•";
    const angle = (i / count) * Math.PI * 2;
    const dist = 80 + Math.random() * 120;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const dur = 0.8 + Math.random() * 0.6;
    spark.style.cssText = `
      position: fixed; left: ${x}px; top: ${y}px;
      font-size: ${0.4 + Math.random() * 0.8}rem;
      color: ${colors[Math.floor(Math.random() * colors.length)]};
      pointer-events: none; z-index: 1000;
      opacity: 1;
      transition: all ${dur}s cubic-bezier(0.2, 0.8, 0.3, 1);
      filter: drop-shadow(0 0 4px currentColor);
    `;
    document.body.appendChild(spark);
    requestAnimationFrame(() => {
      spark.style.transform = `translate(${dx}px, ${dy}px) scale(0.2)`;
      spark.style.opacity = "0";
    });
    window.setTimeout(() => spark.remove(), dur * 1000 + 100);
  }
};

const launchFireworksShow = () => {
  const positions = [
    { x: window.innerWidth * 0.25, y: window.innerHeight * 0.3 },
    { x: window.innerWidth * 0.75, y: window.innerHeight * 0.25 },
    { x: window.innerWidth * 0.5, y: window.innerHeight * 0.2 },
    { x: window.innerWidth * 0.3, y: window.innerHeight * 0.45 },
    { x: window.innerWidth * 0.7, y: window.innerHeight * 0.4 },
  ];
  positions.forEach((pos, i) => {
    window.setTimeout(() => spawnFirework(pos.x, pos.y), i * 600);
  });
};

/* ---- Romantic typewriter message ---- */

const showTypewriterMessage = () => {
  const msg = document.createElement("div");
  msg.className = "typewriter-love";
  msg.setAttribute("aria-hidden", "true");
  const text = "I love you to the moon and back...";
  msg.style.cssText = `
    position: fixed; bottom: 32%; left: 50%;
    transform: translateX(-50%);
    width: min(92vw, 420px);
    max-width: 420px;
    font-family: "Great Vibes", cursive;
    font-size: clamp(1.35rem, 3.2vw, 2rem);
    color: #ffb0d0;
    text-shadow: 0 0 20px rgba(255, 150, 200, 0.5), 0 0 40px rgba(255, 100, 160, 0.2);
    text-align: center;
    line-height: 1.35;
    white-space: normal;
    padding: 0 16px;
    box-sizing: border-box;
    z-index: 998; pointer-events: none;
    opacity: 0;
    transition: opacity 0.5s ease;
  `;
  document.body.appendChild(msg);

  requestAnimationFrame(() => { msg.style.opacity = "1"; });

  let idx = 0;
  const type = () => {
    if (idx <= text.length) {
      msg.textContent = text.slice(0, idx);
      idx += 1;
      window.setTimeout(type, 70);
    } else {
      // Hold for a moment, then fade out
      window.setTimeout(() => {
        msg.style.opacity = "0";
        window.setTimeout(() => msg.remove(), 600);
      }, 3000);
    }
  };
  type();
};

/* ---- Screen glow pulse ---- */

const triggerScreenGlow = () => {
  const glow = document.createElement("div");
  glow.style.cssText = `
    position: fixed; inset: 0; z-index: 997;
    pointer-events: none;
    background: radial-gradient(ellipse at center, rgba(255, 80, 140, 0.12), transparent 70%);
    opacity: 0;
    animation: screenGlowPulse 4s ease-in-out forwards;
  `;
  document.body.appendChild(glow);
  window.setTimeout(() => glow.remove(), 4500);
};

/* ---- Gentle continuous heart float (after Yes) ---- */

const startGentleHeartFloat = () => {
  const symbols = ["♥", "❤", "💕", "💗"];
  const spawn = () => {
    const h = document.createElement("span");
    h.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    const left = Math.random() * 100;
    const dur = 5 + Math.random() * 5;
    const size = 0.5 + Math.random() * 0.8;
    h.style.cssText = `
      position: fixed; bottom: -20px; left: ${left}%;
      font-size: ${size}rem;
      color: rgba(255, 80, 130, ${0.2 + Math.random() * 0.3});
      pointer-events: none; z-index: 0;
      filter: drop-shadow(0 0 3px rgba(255, 80, 130, 0.3));
      animation: gentleFloat ${dur}s ease-out forwards;
    `;
    document.body.appendChild(h);
    window.setTimeout(() => h.remove(), dur * 1000 + 200);
  };
  const schedule = () => {
    spawn();
    window.setTimeout(schedule, 400 + Math.random() * 800);
  };
  schedule();
};

/* ---- Orchestrate the full Yes celebration ---- */

const playFullYesCelebration = () => {
  // 1. Immediate: screen glow + fireworks
  triggerScreenGlow();
  launchFireworksShow();

  // 2. After 1s: big heart burst
  window.setTimeout(spawnCelebrationHearts, 800);

  // 3. After 3s: typewriter love message
  window.setTimeout(showTypewriterMessage, 2800);

  // 4. After 5s: start gentle continuous hearts forever
  window.setTimeout(startGentleHeartFloat, 4500);

  // 5. After 8s: second firework show
  window.setTimeout(launchFireworksShow, 7500);
};

/* ---- Pizza easter egg (17s after Yes) ---- */

const triggerPizzaEasterEgg = () => {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: radial-gradient(ellipse at center, rgba(40, 10, 25, 0.92), rgba(10, 2, 8, 0.96));
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.8s ease;
    cursor: pointer; overflow: hidden;
  `;

  // Raining pizza slices from the top
  const rainCount = 40;
  for (let i = 0; i < rainCount; i += 1) {
    const slice = document.createElement("span");
    slice.textContent = "🍕";
    const size = 1.4 + Math.random() * 2.2;
    const left = Math.random() * 100;
    const delay = Math.random() * 3;
    const duration = 2.5 + Math.random() * 3;
    const swing = (Math.random() - 0.5) * 120;
    slice.style.cssText = `
      position: absolute; top: -60px; left: ${left}%;
      font-size: ${size}rem;
      opacity: 0;
      animation: pizzaRain ${duration}s ease-in ${delay}s infinite;
      --swing: ${swing}px;
      filter: drop-shadow(0 0 8px rgba(255, 180, 60, 0.4));
      z-index: 1;
    `;
    overlay.appendChild(slice);
  }

  // Glowing center message
  const center = document.createElement("div");
  center.style.cssText = `
    position: relative; z-index: 2;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding: 20px;
  `;

  const bigPizza = document.createElement("div");
  bigPizza.textContent = "🍕";
  bigPizza.style.cssText = `
    font-size: clamp(4rem, 12vw, 7rem);
    animation: pizzaBounce 1.2s ease-out forwards, pizzaSpin 6s linear 1.2s infinite;
    filter: drop-shadow(0 0 30px rgba(255, 200, 80, 0.6));
  `;

  const msg = document.createElement("p");
  msg.textContent = "share a bite with me my love?";
  msg.style.cssText = `
    font-family: "Great Vibes", cursive;
    font-size: clamp(1.4rem, 3.5vw, 2.2rem);
    color: #ffd080;
    margin-top: 16px;
    text-shadow: 0 0 20px rgba(255, 200, 100, 0.4);
    opacity: 0;
    animation: pizzaTextIn 1s ease-out 0.8s forwards;
  `;

  const sparkles = document.createElement("div");
  sparkles.style.cssText = `position: absolute; inset: 0; z-index: 0; pointer-events: none;`;
  for (let i = 0; i < 20; i += 1) {
    const s = document.createElement("span");
    s.textContent = Math.random() > 0.5 ? "✨" : "⭐";
    s.style.cssText = `
      position: absolute;
      top: ${Math.random() * 100}%; left: ${Math.random() * 100}%;
      font-size: ${0.6 + Math.random() * 1}rem;
      opacity: 0;
      animation: sparkle ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 2}s infinite;
    `;
    sparkles.appendChild(s);
  }

  const hint = document.createElement("p");
  hint.textContent = "tap anywhere to close";
  hint.style.cssText = `
    font-family: "Poppins", sans-serif;
    font-size: 0.7rem;
    color: rgba(255,255,255,0.3);
    margin-top: 18px;
    opacity: 0;
    animation: pizzaTextIn 0.6s ease-out 2s forwards;
  `;

  center.appendChild(bigPizza);
  center.appendChild(msg);
  center.appendChild(hint);
  overlay.appendChild(sparkles);
  overlay.appendChild(center);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => { overlay.style.opacity = "1"; });

  overlay.addEventListener("click", () => {
    overlay.style.opacity = "0";
    window.setTimeout(() => overlay.remove(), 800);
  });
};

/* ======================================================
   PAGE: Auth (index.html)
   ====================================================== */

/* ---- Cinematic page transition ---- */

const navigateWithFade = (url) => {
  document.body.classList.add("page-exit");
  window.setTimeout(() => { window.location.href = url; }, 650);
};

if (authForm && answerInput) {
  // If intro hasn't been seen yet, redirect to intro
  if (safeGetItem(INTRO_SEEN_KEY) !== "true") {
    window.location.href = "intro.html";
  }

  // If already authenticated, skip straight to valentine
  if (isAuthOk()) {
    navigateWithFade("valentine.html");
  }

  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const value = answerInput.value;
    if (normalize(value) !== SECRET_ANSWER) {
      if (authError) authError.classList.remove("hidden");
      try { await notifyAuthAttemptToFirebase(value, false); } catch (e) { /* */ }
      answerInput.focus();
      return;
    }
    if (authError) authError.classList.add("hidden");
    try { await notifyAuthAttemptToFirebase(value, true); } catch (e) { /* */ }
    storeAuthAnswer(value);
    setAuthOk();
    navigateWithFade("valentine.html");
  });
}

/* ======================================================
   PAGE: Valentine (valentine.html)
   ====================================================== */

// Guard: must have passed auth OR already answered Yes
if (answerCard && !isAuthOk() && !hasSavedYes()) {
  navigateWithFade("index.html");
}

// --- Returning user who already said Yes ---
if (answerCard && hasSavedYes()) {
  // Skip dog animation, just show answer card with dog visible
  if (yesBtn) yesBtn.classList.add("hidden");
  if (noBtn) noBtn.classList.add("hidden");
  if (noMessage) noMessage.classList.add("hidden");
  if (dogScene) {
    dogScene.classList.remove("hidden");
    const dogEl = dogScene.querySelector(".dog");
    if (dogEl) dogEl.style.left = "80px";
  }
  answerCard.classList.remove("hidden");
  if (alreadyAgreedNote) alreadyAgreedNote.classList.remove("hidden");
}

// --- Fresh "Yes" click ---
if (yesBtn && !hasSavedYes()) {
  yesBtn.addEventListener("click", async () => {
    yesBtn.disabled = true;
    if (noBtn) noBtn.classList.add("hidden");
    if (noMessage) noMessage.classList.add("hidden");

    // Persist immediately so refresh never loses the answer
    storeFinalAnswer("Yes");

    await playDogAnimation();
    playFullYesCelebration();
    revealAnswerCard();

    try { await notifyYesToFirebase("Yes"); } catch (e) { /* */ }

    // Pizza easter egg 17s later
    window.setTimeout(triggerPizzaEasterEgg, 17000);
  });
}

// --- No button dodge (mobile-optimized playful behavior) ---
if (noBtn && !hasSavedYes()) {
  let noTaps = 0;
  let lastMessage = 0;
  let lastMove = 0;
  const roasts = [
    "The stars have already decided... it's a Yes. 💜",
    "Nice try. My heart only has a Yes button. 💕",
    "Error 404: \"No\" not found in our love story.",
    "That button is broken... like life without you. 🌙",
    "The universe rejected your \"No\". Try Yes instead. ✨",
    "Even Kiya disagrees with you right now. 🐾",
    "My love for you is not optional. 💌",
  ];

  const moveNoButton = () => {
    const card = noBtn.closest(".card");
    if (!card) return;
    const cardRect = card.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const maxX = (cardRect.width / 2) - (btnRect.width / 2) - 12;
    const maxY = Math.min(cardRect.height * 0.25, 80);
    const offsetX = (Math.random() - 0.5) * 2 * maxX;
    const offsetY = (Math.random() - 0.5) * 2 * maxY;
    const rot = (Math.random() - 0.5) * 30;
    noBtn.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rot}deg)`;
  };

  const escalateNoButton = () => {
    noTaps += 1;

    // Stage 1 (taps 1-2): Just dodge
    if (noTaps <= 2) {
      moveNoButton();
    }
    // Stage 2 (taps 3-4): Shrink while dodging
    else if (noTaps <= 4) {
      const scale = 1 - (noTaps - 2) * 0.15;
      moveNoButton();
      noBtn.style.transform += ` scale(${scale})`;
      noBtn.style.opacity = `${0.9 - (noTaps - 2) * 0.1}`;
    }
    // Stage 3 (taps 5-6): Spin wildly + shrink more
    else if (noTaps <= 6) {
      const spin = (noTaps - 4) * 180;
      const scale = 0.6 - (noTaps - 4) * 0.1;
      moveNoButton();
      noBtn.style.transform += ` rotate(${spin}deg) scale(${scale})`;
      noBtn.style.opacity = "0.5";
    }
    // Stage 4 (tap 7): Text changes to "Okay fine... Yes!"
    else if (noTaps === 7) {
      noBtn.textContent = "Okay fine... Yes! 💕";
      noBtn.style.transform = "translate(0,0) scale(1)";
      noBtn.style.opacity = "1";
      noBtn.style.background = "linear-gradient(120deg, #ff6ba8, #d048a0)";
      noBtn.style.color = "#fff";
      noBtn.style.border = "none";
      // Next click triggers Yes
      noBtn.onclick = (e) => {
        e.preventDefault();
        if (yesBtn) yesBtn.click();
      };
      return;
    }

    // Show rotating roast messages
    if (noMessage) {
      const now = Date.now();
      if (now - lastMessage > 800) {
        noMessage.textContent = roasts[(noTaps - 1) % roasts.length];
        noMessage.classList.remove("hidden");
        lastMessage = now;
      }
    }
  };

  // Desktop: dodge on hover
  noBtn.addEventListener("mouseenter", moveNoButton);

  // Mobile: dodge on touch + escalate
  noBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    escalateNoButton();
  });

  // Click (desktop): escalate
  noBtn.addEventListener("click", (e) => {
    e.preventDefault();
    escalateNoButton();
  });

  // Proximity dodge for desktop
  const handlePointerMove = (clientX, clientY) => {
    const now = Date.now();
    if (now - lastMove < 120) return;
    const rect = noBtn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    if (Math.hypot(clientX - cx, clientY - cy) < 100) {
      lastMove = now;
      moveNoButton();
    }
  };

  document.addEventListener("mousemove", (e) => handlePointerMove(e.clientX, e.clientY));
  document.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    if (t) handlePointerMove(t.clientX, t.clientY);
  });
}

// --- Try Again ---
if (tryAgainBtn) {
  tryAgainBtn.addEventListener("click", () => {
    safeRemoveItem(AUTH_OK_KEY);
    safeRemoveItem(AUTH_KEY);
    safeRemoveItem(ANSWER_KEY);
    safeRemoveItem(ANSWER_LINK_KEY);
    safeRemoveItem(INTRO_SEEN_KEY);
    navigateWithFade("intro.html");
  });
}

// --- Easter egg triggers ---
if (badge) badge.addEventListener("dblclick", revealEasterEgg);

/* ---- "Can This Love Be Translated?" Netflix Easter Egg ---- */

const triggerNetflixEasterEgg = () => {
  if (document.querySelector(".netflix-ee")) return; // prevent doubles

  const overlay = document.createElement("div");
  overlay.className = "netflix-ee";
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 10001;
    background: #000; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.8s ease;
    cursor: pointer; overflow: hidden;
  `;

  // "Cinematic bars" at top and bottom
  const barTop = document.createElement("div");
  barTop.style.cssText = `position:absolute;top:0;left:0;right:0;height:12%;background:#000;z-index:2;`;
  const barBot = document.createElement("div");
  barBot.style.cssText = `position:absolute;bottom:0;left:0;right:0;height:12%;background:#000;z-index:2;`;

  // Background romantic glow
  const bg = document.createElement("div");
  bg.style.cssText = `
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 50% 40%, rgba(80, 20, 40, 0.6), rgba(0,0,0,0.95) 70%);
  `;

  // Floating Korean characters in the background
  const floatContainer = document.createElement("div");
  floatContainer.style.cssText = `position:absolute;inset:0;pointer-events:none;overflow:hidden;`;
  const koreanChars = ["사", "랑", "해", "요", "♥", "달", "빛", "영", "원", "히"];
  for (let i = 0; i < 20; i += 1) {
    const ch = document.createElement("span");
    ch.textContent = koreanChars[Math.floor(Math.random() * koreanChars.length)];
    const dur = 8 + Math.random() * 8;
    ch.style.cssText = `
      position: absolute; bottom: -30px;
      left: ${Math.random() * 100}%;
      font-size: ${0.8 + Math.random() * 1.2}rem;
      color: rgba(255, 100, 140, ${0.06 + Math.random() * 0.1});
      font-family: sans-serif;
      animation: gentleFloat ${dur}s ease-out ${Math.random() * 4}s infinite;
    `;
    floatContainer.appendChild(ch);
  }

  // Main content
  const content = document.createElement("div");
  content.style.cssText = `
    position: relative; z-index: 3;
    text-align: center; padding: 24px;
    max-width: 500px;
  `;

  // Netflix-style red "N" hint
  const nTag = document.createElement("div");
  nTag.textContent = "N";
  nTag.style.cssText = `
    font-family: "Poppins", sans-serif;
    font-size: 2.5rem; font-weight: 900;
    color: #e50914; margin-bottom: 20px;
    text-shadow: 0 0 30px rgba(229, 9, 20, 0.5);
    letter-spacing: -0.05em;
  `;

  // Show title
  const title = document.createElement("p");
  title.textContent = "이 연애는 번역이 안 돼";
  title.style.cssText = `
    font-family: sans-serif; font-size: clamp(1.2rem, 3vw, 1.6rem);
    color: #fff; margin: 0 0 6px; font-weight: 600;
    letter-spacing: 0.02em;
    opacity: 0; animation: pizzaTextIn 0.6s ease-out 0.4s forwards;
  `;

  const titleEn = document.createElement("p");
  titleEn.textContent = "Can This Love Be Translated?";
  titleEn.style.cssText = `
    font-family: "Playfair Display", serif; font-style: italic;
    font-size: clamp(0.85rem, 2vw, 1.05rem);
    color: rgba(255,255,255,0.5); margin: 0 0 28px;
    opacity: 0; animation: pizzaTextIn 0.6s ease-out 0.7s forwards;
  `;

  // Subtitle lines — romantic Korean with translation
  const lines = [
    { ko: "사랑해, 내 달빛.", en: "I love you, my moonlight." },
    { ko: "말이 필요 없어. 네 눈빛이면 충분해.", en: "No words needed. Your eyes are enough." },
    { ko: "우리 사랑은 번역할 수 없어.", en: "Our love can't be translated." },
    { ko: "영원히, 너만.", en: "Forever, only you." },
  ];

  const subtitleBox = document.createElement("div");
  subtitleBox.style.cssText = `text-align: center;`;

  lines.forEach((line, i) => {
    const row = document.createElement("div");
    row.style.cssText = `
      margin-bottom: 18px;
      opacity: 0;
      animation: pizzaTextIn 0.7s ease-out ${1.0 + i * 1.2}s forwards;
    `;

    const ko = document.createElement("p");
    ko.textContent = line.ko;
    ko.style.cssText = `
      font-family: sans-serif;
      font-size: clamp(1rem, 2.5vw, 1.3rem);
      color: #fff; margin: 0 0 4px;
      text-shadow: 0 2px 8px rgba(0,0,0,0.8);
    `;

    const en = document.createElement("p");
    en.textContent = line.en;
    en.style.cssText = `
      font-family: "Playfair Display", serif;
      font-style: italic;
      font-size: clamp(0.7rem, 1.8vw, 0.88rem);
      color: #ffd700; margin: 0;
      text-shadow: 0 1px 6px rgba(0,0,0,0.6);
    `;

    row.appendChild(ko);
    row.appendChild(en);
    subtitleBox.appendChild(row);
  });

  // "Episode" tag
  const ep = document.createElement("p");
  ep.textContent = "Episode ∞ — The Day You Said Yes";
  ep.style.cssText = `
    font-family: "Poppins", sans-serif;
    font-size: 0.65rem; color: rgba(255,255,255,0.25);
    margin-top: 24px; letter-spacing: 0.1em;
    text-transform: uppercase;
    opacity: 0; animation: pizzaTextIn 0.5s ease-out ${1.0 + lines.length * 1.2}s forwards;
  `;

  const hint = document.createElement("p");
  hint.textContent = "tap anywhere to close";
  hint.style.cssText = `
    font-family: "Poppins", sans-serif;
    font-size: 0.6rem; color: rgba(255,255,255,0.2);
    margin-top: 14px;
    opacity: 0; animation: pizzaTextIn 0.4s ease-out ${1.5 + lines.length * 1.2}s forwards;
  `;

  content.appendChild(nTag);
  content.appendChild(title);
  content.appendChild(titleEn);
  content.appendChild(subtitleBox);
  content.appendChild(ep);
  content.appendChild(hint);

  overlay.appendChild(bg);
  overlay.appendChild(floatContainer);
  overlay.appendChild(barTop);
  overlay.appendChild(barBot);
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => { overlay.style.opacity = "1"; });

  overlay.addEventListener("click", () => {
    overlay.style.opacity = "0";
    window.setTimeout(() => overlay.remove(), 800);
  });
};

// Trigger 1: Triple-click the badge
if (badge) {
  let clickCount = 0;
  let clickTimer = null;
  badge.addEventListener("click", () => {
    clickCount += 1;
    if (clickTimer) window.clearTimeout(clickTimer);
    if (clickCount >= 3) {
      clickCount = 0;
      triggerNetflixEasterEgg();
    } else {
      clickTimer = window.setTimeout(() => { clickCount = 0; }, 600);
    }
  });
}

// Trigger 2: Secretly type "translate" anywhere on the page
{
  const secret = "translate";
  let secretProgress = 0;
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === secret[secretProgress]) {
      secretProgress += 1;
      if (secretProgress === secret.length) {
        secretProgress = 0;
        triggerNetflixEasterEgg();
      }
    } else {
      secretProgress = 0;
    }
  });
}

/* ---- "Hot Chocolate" Sweetness Slider Easter Egg ---- */

const triggerSweetnessSlider = () => {
  if (document.querySelector(".sweetness-overlay")) return;

  const overlay = document.createElement("div");
  overlay.className = "sweetness-overlay";
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 10001;
    background: #2c1810;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.8s ease, background 0.6s ease;
    overflow: hidden; padding: 24px;
  `;

  // Floating cocoa/hearts
  const particleBg = document.createElement("div");
  particleBg.style.cssText = `position:absolute;inset:0;pointer-events:none;overflow:hidden;transition:opacity 0.5s;`;
  const particles = ["☕", "🍫", "♥", "✦"];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement("span");
    p.textContent = particles[Math.floor(Math.random() * particles.length)];
    const dur = 8 + Math.random() * 10;
    p.style.cssText = `
      position:absolute; bottom:-20px;
      left:${Math.random() * 100}%;
      font-size:${0.5 + Math.random() * 0.7}rem;
      color:rgba(255,200,160,0.08);
      animation: gentleFloat ${dur}s ease-out ${Math.random() * 5}s infinite;
    `;
    particleBg.appendChild(p);
  }

  const content = document.createElement("div");
  content.style.cssText = `
    position:relative; z-index:2;
    text-align:center; max-width:380px; width:90%;
  `;

  // Title
  const title = document.createElement("p");
  title.style.cssText = `
    font-family:"Great Vibes",cursive; font-size:clamp(1.6rem,4vw,2.4rem);
    color:#e8c8a0; margin:0 0 6px;
    text-shadow:0 0 20px rgba(200,150,80,0.3);
    transition: color 0.5s ease;
  `;
  title.textContent = "My Sunflower";

  // Subtitle
  const subtitle = document.createElement("p");
  subtitle.style.cssText = `
    font-family:"Poppins",sans-serif; font-size:0.7rem;
    color:rgba(200,160,120,0.6); margin:0 0 28px;
    letter-spacing:0.1em; text-transform:uppercase;
    transition: color 0.5s ease;
  `;
  subtitle.textContent = "Sweetness Level";

  // Current level label
  const levelLabel = document.createElement("p");
  levelLabel.style.cssText = `
    font-family:"Playfair Display",serif; font-size:0.85rem;
    color:#c8a070; margin:0 0 8px; font-style:italic;
    min-height:1.4em;
    transition: color 0.5s ease;
  `;
  levelLabel.textContent = "Dark Chocolate ☕";

  // Slider track
  const sliderWrap = document.createElement("div");
  sliderWrap.style.cssText = `
    width:100%; position:relative; margin:0 0 20px;
  `;

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "100";
  slider.value = "0";
  slider.style.cssText = `
    width:100%; height:8px; -webkit-appearance:none; appearance:none;
    background:linear-gradient(90deg, #3c2015, #6b3a20, #c87040);
    border-radius:4px; outline:none; cursor:pointer;
    transition: background 0.3s ease;
  `;

  // Percentage display
  const pct = document.createElement("span");
  pct.style.cssText = `
    font-family:"Poppins",sans-serif; font-size:2rem; font-weight:700;
    color:#c8a070; display:block; margin:0 0 4px;
    transition: color 0.5s ease;
  `;
  pct.textContent = "0%";

  // The "I love ___" input for unlocking 100%
  const unlockWrap = document.createElement("div");
  unlockWrap.style.cssText = `
    margin:16px 0 0; opacity:0; transition:opacity 0.5s ease;
    pointer-events:none;
  `;

  const unlockLabel = document.createElement("p");
  unlockLabel.style.cssText = `
    font-family:"Great Vibes",cursive; font-size:1.2rem;
    color:#e0a8c0; margin:0 0 8px;
  `;
  unlockLabel.textContent = 'To unlock 100%, complete: "I love ___"';

  const unlockInput = document.createElement("input");
  unlockInput.type = "text";
  unlockInput.placeholder = "type the missing word...";
  unlockInput.maxLength = 10;
  unlockInput.style.cssText = `
    width:160px; padding:8px 12px; border:none;
    border-bottom:2px solid rgba(255,180,200,0.3);
    background:transparent; color:#ffd0e0;
    font-family:"Poppins",sans-serif; font-size:0.9rem;
    text-align:center; outline:none;
    transition: border-color 0.3s ease;
  `;

  const unlockStatus = document.createElement("p");
  unlockStatus.style.cssText = `
    font-family:"Poppins",sans-serif; font-size:0.6rem;
    color:rgba(255,180,200,0.4); margin:6px 0 0;
    min-height:1em;
  `;

  unlockWrap.appendChild(unlockLabel);
  unlockWrap.appendChild(unlockInput);
  unlockWrap.appendChild(unlockStatus);

  // Close hint
  const hint = document.createElement("p");
  hint.style.cssText = `
    font-family:"Poppins",sans-serif; font-size:0.55rem;
    color:rgba(255,255,255,0.12); margin-top:20px;
    cursor:pointer;
  `;
  hint.textContent = "tap here to close";

  content.appendChild(title);
  content.appendChild(subtitle);
  content.appendChild(pct);
  content.appendChild(levelLabel);
  content.appendChild(sliderWrap);
  sliderWrap.appendChild(slider);
  content.appendChild(unlockWrap);
  overlay.appendChild(particleBg);
  overlay.appendChild(content);
  overlay.appendChild(hint);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => { overlay.style.opacity = "1"; });

  let unlocked = false;

  const levels = [
    { max: 15, label: "Dark Chocolate ☕",         bg: "#2c1810", text: "#c8a070", title: "My Sunflower" },
    { max: 30, label: "Milk Chocolate 🍫",         bg: "#3a2218", text: "#d4a878", title: "My Sunflower" },
    { max: 50, label: "Caramel Warmth 🍯",         bg: "#4a2a1c", text: "#e0b888", title: "My Darling" },
    { max: 70, label: "Honey Sweet 🌻",            bg: "#5a3020", text: "#f0c898", title: "My Moonlight" },
    { max: 80, label: "Creamy Delight ✨",          bg: "#6a3828", text: "#ffd8b0", title: "My Heart" },
    { max: 99, label: "Almost There... 💕",         bg: "#4a2030", text: "#ffc0d0", title: "Almost..." },
    { max: 100, label: "Pure Love 💖",              bg: "#2a1028", text: "#ffe0f0", title: "My Everything" },
  ];

  const updateTheme = (val) => {
    // Cap at 80 if not unlocked
    const effective = unlocked ? val : Math.min(val, 80);
    if (!unlocked && val > 78) {
      slider.value = 80;
    }

    const v = effective;
    pct.textContent = v + "%";

    // Find current level
    const level = levels.find(l => v <= l.max) || levels[levels.length - 1];
    levelLabel.textContent = level.label;
    title.textContent = level.title;

    // Interpolate background color
    const t = v / 100;
    const r = Math.round(44 + t * 60);
    const g = Math.round(24 + t * 20);
    const b = Math.round(16 + t * 50);
    overlay.style.background = `rgb(${r}, ${g}, ${b})`;

    // Text color warmth
    const tr = Math.round(200 + t * 55);
    const tg = Math.round(160 + t * 60);
    const tb = Math.round(112 + t * 120);
    pct.style.color = `rgb(${tr}, ${tg}, ${tb})`;
    levelLabel.style.color = `rgb(${tr}, ${tg}, ${tb})`;

    // Slider track gradient
    const sEnd = `hsl(${10 + t * 330}, ${50 + t * 30}%, ${20 + t * 50}%)`;
    slider.style.background = `linear-gradient(90deg, #3c2015 0%, ${sEnd} ${v}%, rgba(255,255,255,0.08) ${v}%)`;

    // Show unlock prompt at 80+
    if (v >= 78 && !unlocked) {
      unlockWrap.style.opacity = "1";
      unlockWrap.style.pointerEvents = "auto";
    } else if (unlocked) {
      unlockWrap.style.opacity = "0";
      unlockWrap.style.pointerEvents = "none";
    }

    // At 100% — full celebration
    if (v === 100 && unlocked) {
      title.style.color = "#ff90c0";
      title.style.textShadow = "0 0 30px rgba(255,120,180,0.6)";
      title.style.fontSize = "clamp(2rem, 5vw, 3rem)";
      subtitle.textContent = "Maximum Love Achieved";
      subtitle.style.color = "rgba(255,200,220,0.7)";
      overlay.style.background = "radial-gradient(ellipse at center, #3a1028, #1a0818)";
    }
  };

  slider.addEventListener("input", () => updateTheme(parseInt(slider.value, 10)));

  // "you" unlock mechanic
  unlockInput.addEventListener("input", () => {
    const val = unlockInput.value.trim().toLowerCase();
    if (val === "you") {
      unlocked = true;
      unlockStatus.textContent = "💖 Unlocked! Slide to 100%!";
      unlockStatus.style.color = "#ff90c0";
      unlockInput.style.borderColor = "#ff60a0";
      unlockInput.disabled = true;
      // Allow slider to go to 100
      window.setTimeout(() => {
        unlockWrap.style.opacity = "0";
        unlockWrap.style.pointerEvents = "none";
      }, 1500);
    } else if (val.length > 0) {
      unlockStatus.textContent = "hmm... not quite 💭";
      unlockStatus.style.color = "rgba(255,150,180,0.5)";
    } else {
      unlockStatus.textContent = "";
    }
  });

  hint.addEventListener("click", () => {
    overlay.style.opacity = "0";
    window.setTimeout(() => overlay.remove(), 800);
  });
};

// Trigger: type "chocolate"
{
  const chocoSecret = "chocolate";
  let chocoProgress = 0;
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === chocoSecret[chocoProgress]) {
      chocoProgress += 1;
      if (chocoProgress === chocoSecret.length) {
        chocoProgress = 0;
        triggerSweetnessSlider();
      }
    } else {
      chocoProgress = 0;
    }
  });
}

// Trigger: long-press (1.5s) on the hint text
{
  const hintEl = document.querySelector(".hint");
  if (hintEl) {
    let pressT = null;
    const s = () => { pressT = window.setTimeout(triggerSweetnessSlider, 1500); };
    const c = () => { if (pressT) { window.clearTimeout(pressT); pressT = null; } };
    hintEl.addEventListener("mousedown", s);
    hintEl.addEventListener("touchstart", s);
    hintEl.addEventListener("mouseup", c);
    hintEl.addEventListener("mouseleave", c);
    hintEl.addEventListener("touchend", c);
  }
}

/* ---- "I Love You" in 14 Languages Easter Egg ---- */

const triggerILoveYouEasterEgg = () => {
  if (document.querySelector(".ily-overlay")) return;

  const languages = [
    { lang: "French",     text: "Je t'aime",        flag: "🇫🇷" },
    { lang: "Spanish",    text: "Te quiero",         flag: "🇪🇸" },
    { lang: "Japanese",   text: "愛してる",           flag: "🇯🇵" },
    { lang: "Korean",     text: "사랑해",             flag: "🇰🇷" },
    { lang: "Italian",    text: "Ti amo",            flag: "🇮🇹" },
    { lang: "German",     text: "Ich liebe dich",    flag: "🇩🇪" },
    { lang: "Portuguese", text: "Eu te amo",         flag: "🇧🇷" },
    { lang: "Arabic",     text: "أحبك",              flag: "🇸🇦" },
    { lang: "Mandarin",   text: "我爱你",             flag: "🇨🇳" },
    { lang: "Turkish",    text: "Seni seviyorum",    flag: "🇹🇷" },
    { lang: "Swahili",    text: "Nakupenda",         flag: "🇰🇪" },
    { lang: "Odia",       text: "ମୁଁ ତୁମକୁ ଭଲ ପାଏ", flag: "🇮🇳" },
    { lang: "Hindi",      text: "मैं तुमसे प्यार करता हूँ", flag: "🇮🇳" },
    { lang: "English",    text: "I Love You",        flag: "❤" },
  ];

  const overlay = document.createElement("div");
  overlay.className = "ily-overlay";
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 10001;
    background: radial-gradient(ellipse at center, #1a0812 0%, #08020a 100%);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.8s ease;
    cursor: pointer; overflow: hidden;
  `;

  // Ambient floating hearts
  const heartBg = document.createElement("div");
  heartBg.style.cssText = `position:absolute;inset:0;pointer-events:none;overflow:hidden;`;
  for (let i = 0; i < 30; i += 1) {
    const h = document.createElement("span");
    h.textContent = "♥";
    const dur = 8 + Math.random() * 10;
    h.style.cssText = `
      position: absolute; bottom: -20px;
      left: ${Math.random() * 100}%;
      font-size: ${0.4 + Math.random() * 0.8}rem;
      color: rgba(255, 60, 100, ${0.04 + Math.random() * 0.08});
      animation: gentleFloat ${dur}s ease-out ${Math.random() * 6}s infinite;
    `;
    heartBg.appendChild(h);
  }

  // Center display area
  const center = document.createElement("div");
  center.style.cssText = `
    position: relative; z-index: 2;
    text-align: center; min-height: 140px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
  `;

  // The line that gets replaced
  const flagEl = document.createElement("div");
  flagEl.style.cssText = `font-size: 2rem; margin-bottom: 8px; opacity: 0;`;

  const mainText = document.createElement("p");
  mainText.style.cssText = `
    font-family: "Great Vibes", cursive;
    font-size: clamp(2rem, 5vw, 3.5rem);
    color: #fff; margin: 0 0 6px;
    text-shadow: 0 0 30px rgba(255, 100, 150, 0.5), 0 0 60px rgba(255, 60, 100, 0.2);
    min-height: 1.2em;
    transition: opacity 0.4s ease;
  `;

  const langLabel = document.createElement("p");
  langLabel.style.cssText = `
    font-family: "Poppins", sans-serif;
    font-size: 0.7rem; letter-spacing: 0.15em;
    color: rgba(255, 180, 210, 0.5); margin: 0;
    text-transform: uppercase;
    transition: opacity 0.3s ease;
  `;

  // Counter
  const counter = document.createElement("p");
  counter.style.cssText = `
    font-family: "Poppins", sans-serif;
    font-size: 0.55rem; color: rgba(255,255,255,0.15);
    margin-top: 24px; letter-spacing: 0.1em;
  `;

  const hint = document.createElement("p");
  hint.style.cssText = `
    font-family: "Poppins", sans-serif;
    font-size: 0.55rem; color: rgba(255,255,255,0.15);
    margin-top: 12px; position: absolute; bottom: 20px;
  `;
  hint.textContent = "tap anywhere to close";

  center.appendChild(flagEl);
  center.appendChild(mainText);
  center.appendChild(langLabel);
  center.appendChild(counter);
  overlay.appendChild(heartBg);
  overlay.appendChild(center);
  overlay.appendChild(hint);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => { overlay.style.opacity = "1"; });

  // Typewriter for each language
  let currentIdx = 0;
  let cancelled = false;

  const typeText = (text, element, speed) => {
    return new Promise((resolve) => {
      let i = 0;
      element.textContent = "";
      const tick = () => {
        if (cancelled) { resolve(); return; }
        if (i <= text.length) {
          element.textContent = text.slice(0, i);
          i += 1;
          window.setTimeout(tick, speed);
        } else {
          resolve();
        }
      };
      tick();
    });
  };

  const showNextLanguage = async () => {
    if (cancelled || currentIdx >= languages.length) return;

    const entry = languages[currentIdx];
    const isLast = currentIdx === languages.length - 1;
    const isSecondLast = currentIdx === languages.length - 2;
    const isThirdLast = currentIdx === languages.length - 3;

    // Fade out previous
    mainText.style.opacity = "0";
    langLabel.style.opacity = "0";
    flagEl.style.opacity = "0";
    await new Promise(r => window.setTimeout(r, 350));
    if (cancelled) return;

    // Set new content
    flagEl.textContent = entry.flag;
    flagEl.style.opacity = "1";
    langLabel.textContent = entry.lang;
    langLabel.style.opacity = "1";
    mainText.style.opacity = "1";
    counter.textContent = `${currentIdx + 1} / ${languages.length}`;

    // Slower typing for the last 3 (Odia, Hindi, English)
    const speed = (isLast || isSecondLast || isThirdLast) ? 90 : 55;

    // Bigger and more dramatic for the final (English)
    if (isLast) {
      mainText.style.fontSize = "clamp(2.5rem, 7vw, 4.5rem)";
      mainText.style.color = "#ff6090";
      mainText.style.textShadow = "0 0 40px rgba(255,80,130,0.7), 0 0 80px rgba(255,50,100,0.3)";
      langLabel.style.color = "rgba(255, 200, 220, 0.7)";
    }

    await typeText(entry.text, mainText, speed);
    if (cancelled) return;

    // Hold time — longer for last 3
    const holdTime = isLast ? 4000 : (isSecondLast || isThirdLast) ? 2200 : 1400;
    await new Promise(r => window.setTimeout(r, holdTime));

    currentIdx += 1;

    if (currentIdx < languages.length) {
      showNextLanguage();
    } else {
      // Final flourish — heart burst
      counter.textContent = "♥ in every language, my love is yours ♥";
      counter.style.color = "rgba(255, 150, 180, 0.6)";
      counter.style.fontSize = "0.7rem";
    }
  };

  // Start after overlay fades in
  window.setTimeout(showNextLanguage, 1000);

  overlay.addEventListener("click", () => {
    cancelled = true;
    overlay.style.opacity = "0";
    window.setTimeout(() => overlay.remove(), 800);
  });
};

// Trigger: type "iloveyou" secretly
{
  const ilySecret = "iloveyou";
  let ilyProgress = 0;
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === ilySecret[ilyProgress]) {
      ilyProgress += 1;
      if (ilyProgress === ilySecret.length) {
        ilyProgress = 0;
        triggerILoveYouEasterEgg();
      }
    } else {
      ilyProgress = 0;
    }
  });
}

// Trigger: five rapid taps on the poem text
{
  const poem = document.querySelector(".poem");
  if (poem) {
    let tapCount = 0;
    let tapTimer = null;
    poem.addEventListener("click", () => {
      tapCount += 1;
      if (tapTimer) window.clearTimeout(tapTimer);
      if (tapCount >= 5) {
        tapCount = 0;
        triggerILoveYouEasterEgg();
      } else {
        tapTimer = window.setTimeout(() => { tapCount = 0; }, 800);
      }
    });
  }
}

/* ---- "Our Paths Collided" Map Easter Egg ---- */

const triggerMapEasterEgg = () => {
  if (document.querySelector(".map-ee-overlay")) return;

  const overlay = document.createElement("div");
  overlay.className = "map-ee-overlay";
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 10001;
    background: #0a0a0f;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.8s ease;
    cursor: pointer; overflow: hidden; padding: 20px;
  `;

  // Title
  const title = document.createElement("p");
  title.textContent = "Where Our Paths Collided";
  title.style.cssText = `
    font-family: "Great Vibes", cursive;
    font-size: clamp(1.4rem, 3.5vw, 2.2rem);
    color: #ffb8d0; margin: 0 0 16px;
    text-shadow: 0 0 20px rgba(255, 150, 200, 0.4);
    opacity: 0; animation: pizzaTextIn 0.7s ease-out 0.5s forwards;
    position: relative; z-index: 2;
  `;

  // SVG Map container
  const mapWrap = document.createElement("div");
  mapWrap.style.cssText = `
    position: relative; z-index: 2;
    width: min(420px, 85vw); height: min(420px, 85vw);
    opacity: 0; animation: pizzaTextIn 0.8s ease-out 0.8s forwards;
  `;

  // The SVG map — outline of eastern India region with the three cities and paths
  // Approximate positions: Nalanda (Bihar) top-left, Bhubaneswar (Odisha) bottom-right, Kolkata middle-right
  mapWrap.innerHTML = `
    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
      <!-- Subtle region outline -->
      <path d="M80 40 L160 30 L240 25 L310 50 L350 100 L370 170 L360 240 L340 300 L300 350 L240 380 L170 370 L110 340 L60 280 L40 210 L35 140 L50 80 Z"
        stroke="rgba(255,180,210,0.12)" stroke-width="1" fill="rgba(255,180,210,0.02)" />

      <!-- River hints (Ganges region) -->
      <path d="M60 120 Q140 110 180 140 Q220 165 270 155 Q320 145 370 160"
        stroke="rgba(100,160,255,0.12)" stroke-width="1.5" fill="none" stroke-dasharray="4 4" />
      <path d="M270 155 Q280 200 290 250 Q295 290 285 340"
        stroke="rgba(100,160,255,0.1)" stroke-width="1" fill="none" stroke-dasharray="3 3" />

      <!-- Path from Nalanda to Kolkata -->
      <path id="path-nalanda"
        d="M105 115 Q140 135 175 155 Q210 172 245 180 Q268 186 290 190"
        stroke="#ff6090" stroke-width="2.5" fill="none"
        stroke-linecap="round"
        stroke-dasharray="300" stroke-dashoffset="300">
        <animate attributeName="stroke-dashoffset" from="300" to="0" dur="2.5s" begin="1.8s" fill="freeze" />
      </path>

      <!-- Glow for Nalanda path -->
      <path d="M105 115 Q140 135 175 155 Q210 172 245 180 Q268 186 290 190"
        stroke="rgba(255,96,144,0.3)" stroke-width="6" fill="none"
        stroke-linecap="round" filter="blur(3px)"
        stroke-dasharray="300" stroke-dashoffset="300">
        <animate attributeName="stroke-dashoffset" from="300" to="0" dur="2.5s" begin="1.8s" fill="freeze" />
      </path>

      <!-- Path from Bhubaneswar to Kolkata -->
      <path id="path-bbsr"
        d="M230 330 Q245 300 260 270 Q275 240 285 215 Q288 205 290 190"
        stroke="#60b0ff" stroke-width="2.5" fill="none"
        stroke-linecap="round"
        stroke-dasharray="250" stroke-dashoffset="250">
        <animate attributeName="stroke-dashoffset" from="250" to="0" dur="2.5s" begin="1.8s" fill="freeze" />
      </path>

      <!-- Glow for BBSR path -->
      <path d="M230 330 Q245 300 260 270 Q275 240 285 215 Q288 205 290 190"
        stroke="rgba(96,176,255,0.3)" stroke-width="6" fill="none"
        stroke-linecap="round" filter="blur(3px)"
        stroke-dasharray="250" stroke-dashoffset="250">
        <animate attributeName="stroke-dashoffset" from="250" to="0" dur="2.5s" begin="1.8s" fill="freeze" />
      </path>

      <!-- Collision burst at Kolkata -->
      <circle cx="290" cy="190" r="0" fill="rgba(255,200,220,0.5)">
        <animate attributeName="r" from="0" to="30" dur="0.8s" begin="4.3s" fill="freeze" />
        <animate attributeName="opacity" from="0.6" to="0" dur="0.8s" begin="4.3s" fill="freeze" />
      </circle>
      <circle cx="290" cy="190" r="0" fill="rgba(255,100,150,0.4)">
        <animate attributeName="r" from="0" to="18" dur="0.6s" begin="4.4s" fill="freeze" />
        <animate attributeName="opacity" from="0.8" to="0" dur="0.6s" begin="4.4s" fill="freeze" />
      </circle>

      <!-- City: Nalanda, Bihar (origin) -->
      <circle cx="105" cy="115" r="5" fill="#ff6090" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="1.2s" fill="freeze" />
      </circle>
      <circle cx="105" cy="115" r="10" stroke="#ff6090" stroke-width="1" fill="none" opacity="0">
        <animate attributeName="opacity" from="0" to="0.4" dur="0.4s" begin="1.2s" fill="freeze" />
        <animate attributeName="r" from="5" to="14" dur="2s" begin="1.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.4" to="0" dur="2s" begin="1.2s" repeatCount="indefinite" />
      </circle>

      <!-- City: Bhubaneswar, Odisha (origin) -->
      <circle cx="230" cy="330" r="5" fill="#60b0ff" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="1.2s" fill="freeze" />
      </circle>
      <circle cx="230" cy="330" r="10" stroke="#60b0ff" stroke-width="1" fill="none" opacity="0">
        <animate attributeName="opacity" from="0" to="0.4" dur="0.4s" begin="1.2s" fill="freeze" />
        <animate attributeName="r" from="5" to="14" dur="2s" begin="1.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.4" to="0" dur="2s" begin="1.2s" repeatCount="indefinite" />
      </circle>

      <!-- City: Kolkata (collision point) -->
      <circle cx="290" cy="190" r="6" fill="#ffd700" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="4.3s" fill="freeze" />
      </circle>
      <circle cx="290" cy="190" r="6" fill="#ffd700" opacity="0">
        <animate attributeName="opacity" from="0.8" to="0.3" dur="1.5s" begin="4.3s" repeatCount="indefinite" />
        <animate attributeName="r" from="6" to="12" dur="1.5s" begin="4.3s" repeatCount="indefinite" />
      </circle>

      <!-- Heart at collision -->
      <text x="290" y="170" text-anchor="middle" font-size="22" opacity="0" fill="#ff4070">
        ❤
        <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="4.6s" fill="freeze" />
        <animate attributeName="y" from="180" to="168" dur="0.5s" begin="4.6s" fill="freeze" />
      </text>

      <!-- Labels -->
      <text x="105" y="100" text-anchor="middle" font-family="Poppins, sans-serif" font-size="9" fill="#ff6090" letter-spacing="0.05em" opacity="0">
        NALANDA, BIHAR
        <animate attributeName="opacity" from="0" to="0.9" dur="0.4s" begin="1.4s" fill="freeze" />
      </text>
      <text x="105" y="88" text-anchor="middle" font-family="Great Vibes, cursive" font-size="13" fill="#ffb0d0" opacity="0">
        His Home
        <animate attributeName="opacity" from="0" to="0.7" dur="0.4s" begin="1.6s" fill="freeze" />
      </text>

      <text x="230" y="355" text-anchor="middle" font-family="Poppins, sans-serif" font-size="9" fill="#60b0ff" letter-spacing="0.05em" opacity="0">
        BHUBANESWAR, ODISHA
        <animate attributeName="opacity" from="0" to="0.9" dur="0.4s" begin="1.4s" fill="freeze" />
      </text>
      <text x="230" y="343" text-anchor="middle" font-family="Great Vibes, cursive" font-size="13" fill="#a0d0ff" opacity="0">
        Her Home
        <animate attributeName="opacity" from="0" to="0.7" dur="0.4s" begin="1.6s" fill="freeze" />
      </text>

      <text x="330" y="185" text-anchor="start" font-family="Poppins, sans-serif" font-size="9" fill="#ffd700" letter-spacing="0.05em" opacity="0">
        KOLKATA
        <animate attributeName="opacity" from="0" to="0.9" dur="0.3s" begin="4.5s" fill="freeze" />
      </text>
      <text x="330" y="199" text-anchor="start" font-family="Great Vibes, cursive" font-size="13" fill="#ffe080" opacity="0">
        Where We Found Each Other
        <animate attributeName="opacity" from="0" to="0.8" dur="0.5s" begin="4.8s" fill="freeze" />
      </text>
    </svg>
  `;

  // Bottom quote
  const quote = document.createElement("p");
  quote.textContent = "Two different cities, one destiny.";
  quote.style.cssText = `
    font-family: "Playfair Display", serif; font-style: italic;
    font-size: clamp(0.8rem, 2vw, 1rem);
    color: rgba(255, 200, 220, 0.5); margin: 16px 0 0;
    opacity: 0; animation: pizzaTextIn 0.6s ease-out 5.5s forwards;
    position: relative; z-index: 2;
  `;

  const hint = document.createElement("p");
  hint.textContent = "tap anywhere to close";
  hint.style.cssText = `
    font-family: "Poppins", sans-serif;
    font-size: 0.55rem; color: rgba(255,255,255,0.15);
    margin-top: 10px; position: relative; z-index: 2;
    opacity: 0; animation: pizzaTextIn 0.4s ease-out 6s forwards;
  `;

  overlay.appendChild(title);
  overlay.appendChild(mapWrap);
  overlay.appendChild(quote);
  overlay.appendChild(hint);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => { overlay.style.opacity = "1"; });

  overlay.addEventListener("click", () => {
    overlay.style.opacity = "0";
    window.setTimeout(() => overlay.remove(), 800);
  });
};

// Trigger: type "kolkata"
{
  const mapSecret = "kolkata";
  let mapProgress = 0;
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === mapSecret[mapProgress]) {
      mapProgress += 1;
      if (mapProgress === mapSecret.length) {
        mapProgress = 0;
        triggerMapEasterEgg();
      }
    } else {
      mapProgress = 0;
    }
  });
}

// Trigger: long-press (1.5s) on the postcard stamp
{
  const stamp = document.querySelector(".postcard-stamp");
  if (stamp) {
    let pressTimer = null;
    const start = () => { pressTimer = window.setTimeout(triggerMapEasterEgg, 1500); };
    const cancel = () => { if (pressTimer) { window.clearTimeout(pressTimer); pressTimer = null; } };
    stamp.addEventListener("mousedown", start);
    stamp.addEventListener("touchstart", start);
    stamp.addEventListener("mouseup", cancel);
    stamp.addEventListener("mouseleave", cancel);
    stamp.addEventListener("touchend", cancel);
  }
}

/* ---- Click zones: trigger easter eggs by clicking somewhere on screen ---- */

const CLICK_ZONE_SIZE = 90;
const CLICK_RESET_MS = 1600;

const getClickZone = (x, y) => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (x <= CLICK_ZONE_SIZE && y <= CLICK_ZONE_SIZE) return "topLeft";
  if (x >= w - CLICK_ZONE_SIZE && y <= CLICK_ZONE_SIZE) return "topRight";
  if (x <= CLICK_ZONE_SIZE && y >= h - CLICK_ZONE_SIZE) return "bottomLeft";
  if (x >= w - CLICK_ZONE_SIZE && y >= h - CLICK_ZONE_SIZE) return "bottomRight";
  if (y >= h * 0.7 && x >= w * 0.3 && x <= w * 0.7) return "bottomCenter";
  if (y <= h * 0.28 && x >= w * 0.35 && x <= w * 0.65) return "moon";
  if (x >= w * 0.3 && x <= w * 0.7 && y >= h * 0.35 && y <= h * 0.65) return "center";
  return null;
};

{
  const state = { topLeft: { n: 0, t: null }, topRight: { n: 0, t: null }, bottomLeft: { n: 0, t: null }, bottomRight: { n: 0, t: null }, bottomCenter: { n: 0, t: null }, moon: { n: 0, t: null }, center: { n: 0, t: null } };
  const run = (zone, required, cb) => {
    const s = state[zone];
    if (!s) return;
    s.n += 1;
    if (s.t) window.clearTimeout(s.t);
    if (s.n >= required) {
      s.n = 0;
      cb();
    } else {
      s.t = window.setTimeout(() => { s.n = 0; s.t = null; }, CLICK_RESET_MS);
    }
  };

  document.addEventListener("click", (e) => {
    if (e.target.closest("button") || e.target.closest("a") || e.target.closest(".netflix-ee") || e.target.closest(".sweetness-overlay") || e.target.closest(".ily-overlay") || e.target.closest(".map-ee-overlay")) return;
    const zone = getClickZone(e.clientX, e.clientY);
    if (!zone) return;
    switch (zone) {
      case "topLeft":
        run("topLeft", 3, revealEasterEgg);
        break;
      case "topRight":
        run("topRight", 4, triggerNetflixEasterEgg);
        break;
      case "bottomLeft":
        run("bottomLeft", 5, triggerSweetnessSlider);
        break;
      case "bottomRight":
        run("bottomRight", 4, triggerMapEasterEgg);
        break;
      case "bottomCenter":
        run("bottomCenter", 7, triggerLoveLetterOverlay);
        break;
      case "moon":
        run("moon", 4, triggerPizzaEasterEgg);
        break;
      case "center":
        run("center", 5, triggerILoveYouEasterEgg);
        break;
    }
  });
}

if (dogScene) {
  dogScene.addEventListener("click", () => {
    const bubble = document.createElement("div");
    bubble.textContent = "it's not funny 😤";
    bubble.style.cssText = `
      position: absolute; top: -10px; left: 50%;
      transform: translateX(-50%);
      background: rgba(255,255,255,0.95); color: #3a1f2f;
      font-family: "Poppins", sans-serif; font-size: 0.8rem;
      font-weight: 500; padding: 6px 14px;
      border-radius: 12px; white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      pointer-events: none; z-index: 20;
      animation: celebrateRise 2.5s ease-out forwards;
    `;
    dogScene.appendChild(bubble);
    window.setTimeout(() => bubble.remove(), 2600);
  });
}

/* ---- Heart cursor trail (valentine page) ---- */

if (document.body.classList.contains("page-valentine")) {
  let trailThrottle = 0;
  const spawnTrailHeart = (x, y) => {
    const h = document.createElement("span");
    h.className = "cursor-heart";
    h.textContent = Math.random() > 0.6 ? "♥" : "❤";
    h.style.left = `${x}px`;
    h.style.top = `${y}px`;
    h.style.fontSize = `${0.5 + Math.random() * 0.7}rem`;
    document.body.appendChild(h);
    window.setTimeout(() => h.remove(), 1200);
  };
  document.addEventListener("mousemove", (e) => {
    const now = Date.now();
    if (now - trailThrottle < 60) return;
    trailThrottle = now;
    spawnTrailHeart(e.clientX, e.clientY);
  });
  document.addEventListener("touchmove", (e) => {
    const now = Date.now();
    if (now - trailThrottle < 80) return;
    trailThrottle = now;
    const t = e.touches[0];
    if (t) spawnTrailHeart(t.clientX, t.clientY);
  });
}

/* ---- Floating love words ---- */

const initFloatingWords = () => {
  const isValentine = document.body.classList.contains("page-valentine");
  const words = isValentine
    ? ["love", "moon", "forever", "always", "yours", "us", "hearts", "kisses", "darling", "soulmate", "beloved", "eternity"]
    : ["sunflower", "bloom", "shine", "golden", "warmth", "petals", "glow", "bright", "adore", "sunshine"];
  const container = document.createElement("div");
  container.className = "floating-words";
  container.setAttribute("aria-hidden", "true");
  document.body.appendChild(container);

  const spawnWord = () => {
    const word = words[Math.floor(Math.random() * words.length)];
    const el = document.createElement("span");
    el.textContent = word;
    el.style.left = `${Math.random() * 90}%`;
    el.style.animationDuration = `${10 + Math.random() * 8}s`;
    el.style.fontSize = `${0.55 + Math.random() * 0.4}rem`;
    el.style.animationDelay = "0s";
    container.appendChild(el);
    window.setTimeout(() => el.remove(), 20000);
  };

  const schedule = () => {
    spawnWord();
    window.setTimeout(schedule, 3000 + Math.random() * 4000);
  };
  window.setTimeout(schedule, 2000);
};

/* ---- Konami Love Code Easter Egg ---- */

const initKonamiEasterEgg = () => {
  const sequence = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight"];
  let progress = 0;

  document.addEventListener("keydown", (e) => {
    if (e.key === sequence[progress]) {
      progress += 1;
      if (progress === sequence.length) {
        progress = 0;
        triggerLoveLetterOverlay();
      }
    } else {
      progress = 0;
    }
  });
};

const triggerLoveLetterOverlay = () => {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: radial-gradient(ellipse at center, rgba(30, 5, 15, 0.95), rgba(8, 2, 6, 0.98));
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.8s ease;
    cursor: pointer; overflow: hidden; padding: 24px;
  `;

  const letter = document.createElement("div");
  letter.style.cssText = `
    max-width: 400px; width: 90%;
    background: linear-gradient(170deg, #fff8f0, #fff0e8, #ffe8e0);
    border-radius: 8px; padding: 28px 24px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 100px rgba(255,120,160,0.15);
    transform: rotate(-1deg) scale(0);
    animation: letterOpen 0.8s ease-out forwards;
    position: relative;
  `;

  letter.innerHTML = `
    <p style="font-family:'Great Vibes',cursive;font-size:1.3rem;color:#c44;margin:0 0 14px;">My Dearest,</p>
    <p style="font-family:'Playfair Display',serif;font-size:0.78rem;color:#5a3040;line-height:1.8;margin:0 0 12px;">
      Every moment with you feels like the universe conspired just for us.
      You are the moonlight in my darkest nights and the sunflower that brightens my every morning.
    </p>
    <p style="font-family:'Playfair Display',serif;font-size:0.78rem;color:#5a3040;line-height:1.8;margin:0 0 12px;">
      If I had to choose between breathing and loving you, I would use my last breath to tell you —
      I love you, endlessly and unconditionally.
    </p>
    <p style="font-family:'Great Vibes',cursive;font-size:1.1rem;color:#c44;margin:0;text-align:right;">
      Forever yours ❤
    </p>
    <div style="position:absolute;top:8px;right:12px;font-size:0.5rem;color:rgba(180,100,120,0.3);font-family:'Poppins',sans-serif;">SECRET LETTER</div>
  `;

  // Floating hearts around the letter
  for (let i = 0; i < 15; i += 1) {
    const h = document.createElement("span");
    h.textContent = "♥";
    h.style.cssText = `
      position: absolute;
      top: ${Math.random() * 100}%; left: ${Math.random() * 100}%;
      font-size: ${0.6 + Math.random() * 1.2}rem;
      color: rgba(255, 80, 120, ${0.15 + Math.random() * 0.25});
      animation: float ${3 + Math.random() * 3}s ease-in-out infinite;
      animation-delay: ${Math.random() * 2}s;
      pointer-events: none;
    `;
    overlay.appendChild(h);
  }

  const hint = document.createElement("p");
  hint.textContent = "you found the secret letter — tap to close";
  hint.style.cssText = `
    font-family: "Poppins", sans-serif;
    font-size: 0.65rem; color: rgba(255,255,255,0.3);
    margin-top: 16px;
    opacity: 0; animation: pizzaTextIn 0.6s ease-out 1s forwards;
  `;

  overlay.appendChild(letter);
  overlay.appendChild(hint);
  document.body.appendChild(overlay);
  requestAnimationFrame(() => { overlay.style.opacity = "1"; });
  overlay.addEventListener("click", () => {
    overlay.style.opacity = "0";
    window.setTimeout(() => overlay.remove(), 800);
  });
};

/* ---- Long-press heading = heartbeat pulse ---- */

const initHeadingHeartbeat = () => {
  const h1 = document.querySelector("h1");
  if (!h1) return;
  let pressTimer = null;
  const start = () => {
    pressTimer = window.setTimeout(() => {
      h1.classList.add("heartbeat");
      // Spawn burst of hearts from h1
      const rect = h1.getBoundingClientRect();
      for (let i = 0; i < 20; i += 1) {
        const heart = document.createElement("span");
        heart.textContent = "❤";
        heart.style.cssText = `
          position: fixed; z-index: 999; pointer-events: none;
          left: ${rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width}px;
          top: ${rect.top + rect.height / 2}px;
          font-size: ${0.6 + Math.random() * 1}rem;
          color: #ff3060; opacity: 0;
          animation: celebrateRise ${1.5 + Math.random() * 2}s ease-out ${Math.random() * 0.5}s forwards;
        `;
        document.body.appendChild(heart);
        window.setTimeout(() => heart.remove(), 4000);
      }
      window.setTimeout(() => h1.classList.remove("heartbeat"), 2000);
    }, 800);
  };
  const cancel = () => { if (pressTimer) { window.clearTimeout(pressTimer); pressTimer = null; } };
  h1.addEventListener("mousedown", start);
  h1.addEventListener("touchstart", start);
  h1.addEventListener("mouseup", cancel);
  h1.addEventListener("mouseleave", cancel);
  h1.addEventListener("touchend", cancel);
};

/* ---- Tap-anywhere mini heart (valentine page) ---- */

const initTapHeart = () => {
  if (!document.body.classList.contains("page-valentine")) return;
  document.addEventListener("click", (e) => {
    if (e.target.closest("button") || e.target.closest("a") || e.target.closest(".answer-card")) return;
    const h = document.createElement("span");
    h.textContent = "❤";
    h.className = "tap-heart";
    h.style.left = `${e.clientX}px`;
    h.style.top = `${e.clientY}px`;
    h.style.fontSize = `${1 + Math.random() * 0.8}rem`;
    document.body.appendChild(h);
    window.setTimeout(() => h.remove(), 1200);
  });
};

/* ---- Rose petals falling ---- */

const initRosePetals = () => {
  const container = document.createElement("div");
  container.className = "rose-petals";
  container.setAttribute("aria-hidden", "true");
  document.body.appendChild(container);

  const petals = ["🌹", "🥀", "🌸", "💮"];

  const spawnPetal = () => {
    const p = document.createElement("span");
    p.textContent = petals[Math.floor(Math.random() * petals.length)];
    const duration = 6 + Math.random() * 6;
    const left = Math.random() * 100;
    const sway = (Math.random() - 0.5) * 100;
    p.style.cssText = `
      position: fixed; top: -30px; left: ${left}%;
      font-size: ${0.7 + Math.random() * 0.6}rem;
      opacity: 0; pointer-events: none; z-index: 0;
      animation: petalFall ${duration}s ease-in forwards;
      --petal-sway: ${sway}px;
    `;
    container.appendChild(p);
    window.setTimeout(() => p.remove(), (duration + 1) * 1000);
  };

  const schedule = () => {
    spawnPetal();
    window.setTimeout(schedule, 1500 + Math.random() * 2500);
  };
  window.setTimeout(schedule, 3000);
};

/* ---- Parallax moon on mouse move ---- */

const initMoonParallax = () => {
  const moon = document.querySelector(".moon-bg");
  if (!moon) return;
  document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 16;
    const y = (e.clientY / window.innerHeight - 0.5) * 12;
    moon.style.transform = `translate(${x}px, ${y}px)`;
  });
};

/* ---- Heart Rain Shower with Cloud ---- */

const spawnHeartCloud = () => {
  const cloud = document.createElement("div");
  cloud.className = "heart-cloud-rain";
  const startLeft = -10 + Math.random() * 60;
  const driftDir = Math.random() > 0.5 ? 1 : -1;
  cloud.style.cssText = `
    position: fixed;
    top: -30px;
    left: ${startLeft}%;
    z-index: 998;
    pointer-events: none;
    animation: cloudDrift 12s linear forwards;
    --drift-dir: ${driftDir};
  `;

  // Cloud body
  const cloudBody = document.createElement("div");
  cloudBody.style.cssText = `
    width: 120px; height: 48px;
    background: radial-gradient(ellipse at 50% 60%, rgba(255, 220, 240, 0.7), rgba(255, 200, 225, 0.4));
    border-radius: 50px;
    position: relative;
    filter: blur(1px);
    box-shadow:
      30px -14px 0 8px rgba(255, 210, 230, 0.5),
      -20px -8px 0 12px rgba(255, 200, 220, 0.45),
      10px -20px 0 6px rgba(255, 215, 235, 0.55);
  `;
  cloud.appendChild(cloudBody);

  // Rain hearts from the cloud
  const heartCount = 12 + Math.floor(Math.random() * 10);
  for (let i = 0; i < heartCount; i += 1) {
    const heart = document.createElement("span");
    heart.textContent = "❤";
    const delay = 0.3 + Math.random() * 3;
    const duration = 2 + Math.random() * 2.5;
    const left = 10 + Math.random() * 100;
    const size = 0.6 + Math.random() * 0.8;
    const sway = (Math.random() - 0.5) * 60;
    heart.style.cssText = `
      position: absolute;
      top: 40px; left: ${left}px;
      font-size: ${size}rem;
      color: #ff3060;
      opacity: 0;
      filter: drop-shadow(0 0 4px rgba(255, 50, 80, 0.4));
      animation: heartRainDrop ${duration}s ease-in ${delay}s forwards;
      --sway: ${sway}px;
    `;
    cloud.appendChild(heart);
  }

  document.body.appendChild(cloud);
  window.setTimeout(() => cloud.remove(), 14000);
};

const initHeartCloudShower = () => {
  const schedule = () => {
    spawnHeartCloud();
    window.setTimeout(schedule, 8000 + Math.random() * 5000);
  };
  window.setTimeout(schedule, 4000 + Math.random() * 3000);
};

// --- Init background effects ---
initHeartField();
initShootingStars();
initHeartCloudShower();
initFloatingWords();
initKonamiEasterEgg();
initHeadingHeartbeat();
initTapHeart();
initRosePetals();
initMoonParallax();
