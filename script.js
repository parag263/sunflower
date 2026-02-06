import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

/* ---- Constants ---- */

const AUTH_KEY = "valentine-auth-answer";
const AUTH_OK_KEY = "valentine-auth-ok";
const ANSWER_KEY = "valentine-final-answer";
const ANSWER_LINK_KEY = "valentine-answer-link";
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

const firebaseConfig = {
  apiKey: "AIzaSyAR72CyMnTeBRoax78UmLfVg-fdz8qCqgQ",
  authDomain: "sunflowerofheart.firebaseapp.com",
  projectId: "sunflowerofheart",
  storageBucket: "sunflowerofheart.firebasestorage.app",
  messagingSenderId: "733904375506",
  appId: "1:733904375506:web:5f3d49b606b3560bbbe70b",
  measurementId: "G-QN1C0E67RP",
};

let db = null;
const hasFirebaseConfig = firebaseConfig.apiKey !== "YOUR_API_KEY";
if (hasFirebaseConfig) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
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
  msg.textContent = "Because you deserve all the pizza in the world";
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

if (authForm && answerInput) {
  // If already authenticated, skip straight to valentine
  if (isAuthOk()) {
    window.location.href = "valentine.html";
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
    window.location.href = "valentine.html";
  });
}

/* ======================================================
   PAGE: Valentine (valentine.html)
   ====================================================== */

// Guard: must have passed auth OR already answered Yes
if (answerCard && !isAuthOk() && !hasSavedYes()) {
  window.location.href = "index.html";
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
    spawnCelebrationHearts();
    revealAnswerCard();

    try { await notifyYesToFirebase("Yes"); } catch (e) { /* */ }

    // Pizza easter egg 17s later
    window.setTimeout(triggerPizzaEasterEgg, 17000);
  });
}

// --- No button dodge ---
if (noBtn && !hasSavedYes()) {
  const proximityThreshold = 120;
  let lastMove = 0;
  let lastMessage = 0;

  const moveNoButton = () => {
    const card = noBtn.closest(".card");
    if (!card) return;
    const cardRect = card.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const maxX = (cardRect.width / 2) - (btnRect.width / 2) - 16;
    const maxY = Math.min(cardRect.height * 0.2, 60);
    const offsetX = (Math.random() - 0.5) * 2 * maxX;
    const offsetY = (Math.random() - 0.5) * 2 * maxY;
    noBtn.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${offsetX / 40}deg)`;
  };

  noBtn.addEventListener("mouseenter", moveNoButton);
  noBtn.addEventListener("touchstart", moveNoButton);
  noBtn.addEventListener("click", (event) => {
    event.preventDefault();
    moveNoButton();
    if (noMessage) {
      const now = Date.now();
      if (now - lastMessage > 1200) {
        noMessage.classList.remove("hidden");
        lastMessage = now;
      }
    }
  });

  const handlePointerMove = (clientX, clientY) => {
    const now = Date.now();
    if (now - lastMove < 150) return;
    const rect = noBtn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    if (Math.hypot(clientX - cx, clientY - cy) < proximityThreshold) {
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
    window.location.href = "index.html";
  });
}

// --- Easter egg triggers ---
if (badge) badge.addEventListener("dblclick", revealEasterEgg);

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
