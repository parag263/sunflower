# Sunflower / My Moon — Valentine Project

A small valentine experience with a secret gate, yes/no flow, and several easter eggs.  
This file lists **all easter eggs** and every way to trigger them (including by **clicking somewhere on the screen**).

**Tip:** Serve the project over HTTP (e.g. `python -m http.server` in the project folder) and open the site at `http://localhost:8000/intro.html`. That way the intro song continues across intro → auth → valentine without restarting. Opening files directly as `file://` can prevent music position from persisting.

---

## Easter eggs and how to trigger them

### 1. Badge secret message  
**What it does:** Shows a short hidden message (e.g. “You found a little secret.”) for a few seconds.

| Trigger | How |
|--------|-----|
| **Double-click** | Double-click the badge (“For My Moon 🌙” / “🌻 My Sunflower”). |
| **Click zone** | **Top-left corner** of the screen — click **3 times** within ~1.6s in the top-left (within about 90px of the corner). |

---

### 2. “Can This Love Be Translated?” (Netflix-style)  
**What it does:** Full-screen overlay with Korean romance title and lines (“I love you, my moonlight”, etc.) in a cinematic style.

| Trigger | How |
|--------|-----|
| **Triple-click** | Triple-click the badge (3 clicks within ~0.6s). |
| **Type** | Type **`translate`** anywhere on the page (no need to focus an input). |
| **Click zone** | **Top-right corner** — click **4 times** within ~1.6s in the top-right corner. |

---

### 3. Pizza / “Will you share a slice?”  
**What it does:** Full-screen overlay with a pizza and the question “Will you share a slice with me?” (romantic pizza moment).

| Trigger | How |
|--------|-----|
| **After Yes** | Automatically plays **17 seconds** after you click “Yes, a thousand times!” on the valentine page. |
| **Click zone** | **Moon area** — click **4 times** within ~1.6s in the **moon region** (top center of the screen, roughly where the moon image is). |

---

### 4. Hot Chocolate sweetness slider  
**What it does:** Overlay with a “How sweet do you like it?” slider. Unlock the “you” level by setting sweetness to 100%.

| Trigger | How |
|--------|-----|
| **Type** | Type **`chocolate`** anywhere on the page. |
| **Long-press** | Long-press (**1.5s**) on the hint text (“The day we held hands for the first time.”) on the **index** page. |
| **Click zone** | **Bottom-left corner** — click **5 times** within ~1.6s in the bottom-left corner. |

---

### 5. “I Love You” in 14 languages  
**What it does:** Overlay that cycles through “I love you” in 14 languages (French, Spanish, Japanese, Korean, Odia, Hindi, English, etc.) with a typewriter effect.

| Trigger | How |
|--------|-----|
| **Type** | Type **`iloveyou`** anywhere on the page. |
| **Tap poem** | **5 rapid taps** on the poem line (“You are my universe…” / “Like a sunflower…”). |
| **Click zone** | **Center of the screen** — click **5 times** within ~1.6s in the middle area of the page. |

---

### 6. “Our Paths Collided” map  
**What it does:** Overlay with a map showing Nalanda, Bhubaneswar, and Kolkata, with animated paths and “Where Our Paths Collided”.

| Trigger | How |
|--------|-----|
| **Type** | Type **`kolkata`** anywhere on the page. |
| **Long-press** | Long-press (**1.5s**) on the **postcard stamp** (on the answer card, after saying Yes). |
| **Click zone** | **Bottom-right corner** — click **4 times** within ~1.6s in the bottom-right corner. |

---

### 7. Secret love letter (Konami-style)  
**What it does:** Full-screen secret letter with a romantic message (“My Dearest… I love you, endlessly…”). Tap to close.

| Trigger | How |
|--------|-----|
| **Konami code** | Press **↑ ↑ ↓ ↓ ← → ← →** (arrow keys) in order. |
| **Click zone** | **Bottom center** — click **7 times** within ~1.6s in the bottom center strip of the screen. |

---

## Click zones summary

Each of these is a **small region** near the edge or center of the viewport. Clicks must happen **within about 1.6 seconds** of each other; otherwise the counter resets.

| Zone | Clicks | Easter egg |
|------|--------|------------|
| **Top-left corner** | 3 | Badge secret message |
| **Top-right corner** | 4 | Netflix “Can This Love Be Translated?” |
| **Bottom-left corner** | 5 | Hot Chocolate sweetness slider |
| **Bottom-right corner** | 4 | “Our Paths Collided” map |
| **Center of screen** | 5 | “I Love You” in 14 languages |
| **Moon (top center)** | 4 | Pizza / “Will you share a slice?” |
| **Bottom center** | 7 | Secret love letter |

---

## Other little touches (not listed as separate “easter eggs”)

- **Console:** Open DevTools → Console to see a secret love note in styled text.
- **Dog:** After saying Yes, a dog runs in with a heart; clicking the dog shows “it’s not funny 😤”.
- **Heading:** Long-press the main heading (“Will you be my Valentine?”) for a heartbeat pulse and hearts.
- **Tap anywhere:** On the valentine page, tapping (not on buttons) spawns small hearts; moving the cursor leaves a heart trail.
- **Floating words, shooting stars, heart field, rose petals, moon parallax, heart cloud rain:** Ambient effects that run on the page.

---

*All easter eggs can be triggered at least one way by **clicking somewhere on the screen** (see table above), plus keyboard or long-press where noted.*
