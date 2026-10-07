// State Management
let currentUser = null;
let currentSurprise = null;
let currentSlideIndex = 0;
let countdownTimer = null;
let isSignUpMode = false;

let activeFallingInterval = null;
let activeFallingTimeout = null;

const $ = (id) => document.getElementById(id);

window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const surpriseId = urlParams.get("id");

    if (surpriseId) {
        loadReceiverSurprise(surpriseId);
    } else {
        checkSession();
        setupAuthHandlers();
        setupBuilderHandlers();
    }
});

// ================= AUTH SYSTEM =================
function checkSession() {
    const savedUser = localStorage.getItem("mn_session");
    if (savedUser) {
        currentUser = savedUser;
        showBuilderView();
    } else {
        showAuthView();
    }
}

function setupAuthHandlers() {
    $("tab-login").addEventListener("click", () => setAuthMode(false));
    $("tab-signup").addEventListener("click", () => setAuthMode(true));

    $("auth-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const username = $("username").value.trim().toLowerCase();
        const password = $("password").value.trim();

        if (!username || !password) return alert("Please complete both fields.");

        const users = JSON.parse(localStorage.getItem("mn_users") || "{}");

        if (isSignUpMode) {
            if (users[username]) return alert("Username already registered. Please log in.");
            users[username] = { password, createdAt: Date.now() };
            localStorage.setItem("mn_users", JSON.stringify(users));
            loginUser(username);
        } else {
            if (!users[username] || users[username].password !== password) {
                return alert("Incorrect username or password.");
            }
            loginUser(username);
        }
    });

    $("logout-btn").addEventListener("click", () => {
        localStorage.removeItem("mn_session");
        currentUser = null;
        showAuthView();
    });
}

function setAuthMode(signup) {
    isSignUpMode = signup;
    $("tab-signup").classList.toggle("active", signup);
    $("tab-login").classList.toggle("active", !signup);
    $("auth-submit-btn").innerText = signup ? "Create Account →" : "Continue →";
}

function loginUser(username) {
    currentUser = username;
    localStorage.setItem("mn_session", username);
    showBuilderView();
}

function showAuthView() {
    $("auth-screen").classList.remove("hidden");
    $("builder-screen").classList.add("hidden");
    $("nav-user-info").classList.add("hidden");
}

function showBuilderView() {
    $("auth-screen").classList.add("hidden");
    $("builder-screen").classList.remove("hidden");
    $("nav-user-info").classList.remove("hidden");
    $("nav-greeting").innerText = `@${currentUser}`;

    // Default target time: Oct 11, 00:00:00
    const now = new Date();
    const targetYear = now.getFullYear();
    const defaultDate = new Date(targetYear, 9, 11, 0, 0, 0); // Month 9 is October
    const offset = defaultDate.getTimezoneOffset() * 60000;
    $("target-boom-time").value = new Date(defaultDate.getTime() - offset).toISOString().slice(0, 16);

    // Initialize with 1 memory card if empty
    const container = $("memory-cards-container");
    if (container.children.length === 0) {
        addMemoryCard();
    }
}

// ================= DYNAMIC MEMORY CARDS =================
function addMemoryCard() {
    const container = $("memory-cards-container");
    const count = container.children.length + 1;

    const card = document.createElement("div");
    card.className = "memory-input-card";
    card.innerHTML = `
    <div class="card-header-bar">
      <div class="card-num">${String(count).padStart(2, "0")}</div>
      ${count > 1 ? '<button type="button" class="btn-remove-card">Remove</button>' : ''}
    </div>
    <label class="custom-file-upload">
      <input type="file" class="slide-file" accept="image/*" required />
      <span class="file-name">Select Image</span>
    </label>
    <textarea class="slide-msg" placeholder="A tender memory, caption or story..." rows="3" required></textarea>
  `;

    const fileInput = card.querySelector(".slide-file");
    const fileNameSpan = card.querySelector(".file-name");
    fileInput.addEventListener("change", (e) => {
        fileNameSpan.innerText = e.target.files[0] ? e.target.files[0].name.slice(0, 16) + "..." : "Select Image";
    });

    const removeBtn = card.querySelector(".btn-remove-card");
    if (removeBtn) {
        removeBtn.addEventListener("click", () => {
            card.remove();
            renumberCards();
        });
    }

    container.appendChild(card);
}

function renumberCards() {
    const container = $("memory-cards-container");
    const cards = container.querySelectorAll(".memory-input-card");
    cards.forEach((card, index) => {
        const numEl = card.querySelector(".card-num");
        numEl.innerText = String(index + 1).padStart(2, "0");
    });
}

// ================= FILE COMPRESSION =================
function compressImage(file, maxWidth = 900) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", 0.75));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// ================= BUILDER SUBMIT =================
function setupBuilderHandlers() {
    $("add-memory-btn").addEventListener("click", () => addMemoryCard());

    $("surprise-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = $("target-name").value.trim();
        const nickname = $("target-nickname").value.trim();
        const dob = $("target-dob").value;
        const boomTime = new Date($("target-boom-time").value).getTime();

        const headline = $("custom-headline").value.trim();
        const midnightSub = $("custom-midnight-sub").value.trim();
        const finalWish = $("custom-final-wish").value.trim();

        const cardElements = document.querySelectorAll(".memory-input-card");
        if (cardElements.length === 0) return alert("Please add at least one memory.");

        const slides = [];
        for (let i = 0; i < cardElements.length; i++) {
            const card = cardElements[i];
            const file = card.querySelector(".slide-file").files[0];
            const message = card.querySelector(".slide-msg").value.trim();

            if (!file) return alert(`Please choose an image for card ${i + 1}`);
            const base64 = await compressImage(file);
            slides.push({ image: base64, message });
        }

        const surpriseId = "m_" + Math.random().toString(36).substring(2, 9);
        const payload = {
            creator: currentUser,
            name,
            nickname,
            dob,
            boomTime,
            headline,
            midnightSub,
            finalWish,
            slides
        };

        const storage = JSON.parse(localStorage.getItem("mn_surprises") || "{}");
        storage[surpriseId] = payload;
        localStorage.setItem("mn_surprises", JSON.stringify(storage));

        const link = `${window.location.origin}${window.location.pathname}?id=${surpriseId}`;
        $("generated-link").value = link;
        $("share-modal").classList.remove("hidden");
        $("share-modal").scrollIntoView({ behavior: "smooth" });
    });

    $("copy-link-btn").addEventListener("click", () => {
        const input = $("generated-link");
        input.select();
        navigator.clipboard.writeText(input.value);
        alert("Copied link to clipboard. Ready to send!");
    });
}

// ================= RECEIVER EXPERIENCE =================
function loadReceiverSurprise(id) {
    $("main-nav").classList.add("hidden");
    $("auth-screen").classList.add("hidden");
    $("builder-screen").classList.add("hidden");
    document.querySelectorAll(".creator-footer").forEach((el) => el.classList.add("hidden"));

    // Delicate pink glow for birthday person
    $("ambient-bg").classList.add("receiver-pink-theme");

    const storage = JSON.parse(localStorage.getItem("mn_surprises") || "{}");
    currentSurprise = storage[id];

    if (!currentSurprise) {
        alert("Surprise not found or link has expired.");
        window.location.href = window.location.pathname;
        return;
    }

    $("recv-name-1").innerText = currentSurprise.name;
    $("recv-name-badge").innerText = currentSurprise.name;
    $("recv-nickname").innerText = currentSurprise.nickname;
    $("recv-headline").innerText = currentSurprise.headline || "Happy Birthday";
    $("recv-midnight-sub").innerText = currentSurprise.midnightSub;
    $("recv-final-wish").innerText = `"${currentSurprise.finalWish}"`;
    $("total-slides-num").innerText = currentSurprise.slides.length;

    runCountdown(currentSurprise.boomTime);
}

function runCountdown(targetTimestamp) {
    $("receiver-countdown").classList.remove("hidden");

    countdownTimer = setInterval(() => {
        const now = Date.now();
        const diff = targetTimestamp - now;

        if (diff <= 0) {
            clearInterval(countdownTimer);
            $("receiver-countdown").classList.add("hidden");
            triggerMidnightCelebration();
        } else {
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            $("t-hours").innerText = String(h).padStart(2, "0");
            $("t-mins").innerText = String(m).padStart(2, "0");
            $("t-secs").innerText = String(s).padStart(2, "0");
        }
    }, 1000);
}

// ================= MIDNIGHT CELEBRATION =================
function triggerMidnightCelebration() {
    $("boom-modal").classList.remove("hidden");
    fireAmbientConfetti();
    startFallingBalloonsAndChocolates();

    setTimeout(() => {
        const btn = $("boom-start-btn");
        btn.classList.remove("hidden");
        btn.onclick = () => {
            $("boom-modal").classList.add("hidden");
            showCatInterlude();
        };
    }, 2000);
}

// ================= REUSABLE FALLING EMOJIS =================
function clearFallingEmojis() {
    if (activeFallingInterval) {
        clearInterval(activeFallingInterval);
        activeFallingInterval = null;
    }
    if (activeFallingTimeout) {
        clearTimeout(activeFallingTimeout);
        activeFallingTimeout = null;
    }
    const container = $("falling-items-container");
    if (container) {
        container.innerHTML = "";
    }
}

function startFallingEmojis(emojisList, durationMs = 8000) {
    if (activeFallingInterval) {
        clearInterval(activeFallingInterval);
        activeFallingInterval = null;
    }
    if (activeFallingTimeout) {
        clearTimeout(activeFallingTimeout);
        activeFallingTimeout = null;
    }

    const container = $("falling-items-container");
    if (!container || !emojisList || emojisList.length === 0) return;

    activeFallingInterval = setInterval(() => {
        if (document.hidden) return;
        const elem = document.createElement("div");
        elem.className = "floating-element";
        elem.innerText = emojisList[Math.floor(Math.random() * emojisList.length)];
        elem.style.left = Math.random() * 92 + "vw";
        elem.style.fontSize = Math.random() * 16 + 24 + "px";
        elem.style.animationDuration = (Math.random() * 1 + 2.2) + "s";
        container.appendChild(elem);

        setTimeout(() => elem.remove(), 3500);
    }, 110);

    activeFallingTimeout = setTimeout(() => {
        if (activeFallingInterval) {
            clearInterval(activeFallingInterval);
            activeFallingInterval = null;
        }
    }, durationMs);
}

// ================= CAT INTERLUDES (CHOCOLATE & FLOWERS) =================
function showCatInterlude() {
    clearFallingEmojis();
    startFallingEmojis(["🍫", "🍫", "✨", "🍫"], 12000);

    const catModal = $("cat-interlude-modal");
    catModal.classList.remove("hidden");

    $("cat-continue-btn").onclick = () => {
        catModal.classList.add("hidden");
        showCatFlowerInterlude();
    };
}

function showCatFlowerInterlude() {
    clearFallingEmojis();
    startFallingEmojis(["🌸", "🌺", "🌷", "💐", "✨"], 12000);

    const flowerModal = $("cat-flower-modal");
    flowerModal.classList.remove("hidden");

    $("cat-flower-continue-btn").onclick = () => {
        flowerModal.classList.add("hidden");
        beginGallerySequence();
    };
}

// ================= FALLING BALLOONS & CHOCOLATES =================
function startFallingBalloonsAndChocolates() {
    startFallingEmojis(["🎈", "🍫", "✨", "🎈", "🍫", "💗", "✨"], 15000);
}

// ================= MEMORY GALLERY SEQUENCE =================
function beginGallerySequence() {
    clearFallingEmojis();
    $("receiver-slides").classList.remove("hidden");
    currentSlideIndex = 0;
    renderMemorySlide(0);
}

function renderMemorySlide(index) {
    const total = currentSurprise.slides.length;
    const slide = currentSurprise.slides[index];

    // Trigger continuous gentle emoji shower across memory cards
    startFallingEmojis(["🍫", "💗", "✨", "🎉"], 15000);

    $("slide-num").innerText = index + 1;
    $("active-slide-img").src = slide.image;
    $("active-slide-text").innerText = `"${slide.message}"`;

    const btn = $("slide-next-btn");
    btn.classList.add("hidden");

    if (index === total - 1) {
        btn.innerText = "A Final Wish 💌";
    } else if (index === total - 2) {
        btn.innerText = "One Last Memory →";
    } else {
        btn.innerText = "Turn The Page →";
    }

    setTimeout(() => {
        btn.classList.remove("hidden");
    }, 1600);

    btn.onclick = () => {
        if (currentSlideIndex < total - 1) {
            currentSlideIndex++;
            renderMemorySlide(currentSlideIndex);
        } else {
            clearFallingEmojis();
            $("receiver-slides").classList.add("hidden");
            triggerGiftWrapOutro();
        }
    };
}

// ================= CONFETTI & OUTRO =================
function fireAmbientConfetti() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 45,
            origin: { x: 0 },
            colors: ['#ffb6c1', '#f0c38f', '#ffffff']
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 45,
            origin: { x: 1 },
            colors: ['#ffb6c1', '#f0c38f', '#ffffff']
        });
        if (Date.now() < end) requestAnimationFrame(frame);
    })();
}

function triggerGiftWrapOutro() {
    clearFallingEmojis();
    $("receiver-outro").classList.remove("hidden");
    fireAmbientConfetti();
}
