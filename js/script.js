/* =========================
   MrSpinny — script.js
   - Mobile menu
   - Premium Wheel + FX
   - Redirect to Promotions (no modal)
   ========================= */

/* ===== Mobile Menu ===== */
const navToggle = document.getElementById("navToggle");
const mobileMenu = document.getElementById("mobileMenu");
const mobilePanel = document.querySelector("#mobileMenu .mobile-menu-panel");
const backdrop = mobileMenu ? mobileMenu.querySelector(".mobile-menu-backdrop") : null;
const closeBtn = document.getElementById("mobileClose");
const isMenuOpen = () => !!mobileMenu && !mobileMenu.hidden && mobileMenu.classList.contains("open");

function openMenu() {
    if (!mobileMenu || !navToggle) return;
    mobileMenu.hidden = false;
    requestAnimationFrame(() => mobileMenu.classList.add("open"));
    navToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("no-scroll");
    setTimeout(() => { mobilePanel?.querySelector("a, button")?.focus(); }, 220);
}
function closeMenu() {
    if (!mobileMenu || !navToggle) return;
    mobileMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
    setTimeout(() => (mobileMenu.hidden = true), 200);
}
navToggle?.addEventListener("click", () => (mobileMenu?.hidden ? openMenu() : closeMenu()));
backdrop?.addEventListener("click", closeMenu);
closeBtn?.addEventListener("click", closeMenu);
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && isMenuOpen()) closeMenu(); });
mobileMenu?.addEventListener("click", (e) => { if (e.target.closest(".mobile-links a, .mobile-auth .btn")) closeMenu(); });
document.addEventListener("keydown", (e) => {
    if (!isMenuOpen() || e.key !== "Tab") return;
    const list = Array.from(mobilePanel?.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') || []);
    if (!list.length) return;
    const first = list[0], last = list[list.length - 1], active = document.activeElement;
    if (e.shiftKey && active === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && active === last) { first.focus(); e.preventDefault(); }
});

/* ===== Wheel + FX ===== */
const SEGMENTS = [
    { label: "10 Free Spins", weight: 20 },
    { label: "$2 Bonus", weight: 18 },
    { label: "Mystery Box", weight: 10 },
    { label: "20 Free Spins", weight: 12 },
    { label: "$5 Bonus", weight: 8 },
    { label: "Reroll", weight: 12 },
    { label: "Lucky Chip", weight: 10 },
    { label: "5 Free Spins", weight: 10 }
];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const SPIN_KEY = "mrspinny_wheel_spin";
const PROMO_URL = "promotions.html"; // change to absolute URL if needed

const wheelWrap = document.getElementById("wheelWrap");
const wheelEl = document.querySelector(".wheel");
const spinBtn = document.getElementById("spinBtn");

const confettiLayer = document.getElementById("confettiLayer");
const coinLayer = document.getElementById("coinLayer");
const fireworkLayer = document.getElementById("fireworkLayer");
const sparkLayer = document.getElementById("sparkLayer");

/* Fullscreen FX container */
const pageFX = document.createElement("div");
pageFX.id = "pageFX";
pageFX.className = "page-fx";
document.body.appendChild(pageFX);

buildWheelSVG();
initWheel();

function initWheel() {
    if (!spinBtn) return;
    if (localStorage.getItem(SPIN_KEY) === "1") {
        spinBtn.textContent = "Already Spun";
        spinBtn.disabled = true;
    }
    spinBtn.addEventListener("click", onSpin);
}

function pickSegment(segments = SEGMENTS) {
    const total = segments.reduce((s, seg) => s + seg.weight, 0);
    let r = Math.random() * total;
    for (const seg of segments) { if ((r -= seg.weight) <= 0) return seg; }
    return segments[segments.length - 1];
}

let isSpinning = false;
let sparkTimer = null;

function onSpin() {
    if (isSpinning || !wheelEl || !wheelWrap || !spinBtn) return;
    if (localStorage.getItem(SPIN_KEY) === "1") { window.location.href = PROMO_URL; return; }

    isSpinning = true;
    spinBtn.disabled = true;
    spinBtn.classList.add("is-hidden");

    wheelWrap.classList.add("spinning");
    wheelEl.classList.add("is-spinning");
    startSparkles();

    let chosen = pickSegment();
    if (chosen.label === "Reroll") chosen = pickSegment();

    const segmentCount = SEGMENTS.length;
    const index = SEGMENTS.findIndex((s) => s.label === chosen.label);
    const segmentAngle = 360 / segmentCount;
    const baseTurns = 6;
    const base = 360 * baseTurns;
    const offset = segmentAngle * index + segmentAngle / 2;
    const jitter = rand(-6, 6);
    const finalDeg = base + (360 - offset) + jitter;

    requestAnimationFrame(() => { wheelEl.style.transform = `rotate(${finalDeg}deg)`; });

    wheelEl.addEventListener("transitionend", function handler() {
        wheelEl.removeEventListener("transitionend", handler);

        localStorage.setItem(SPIN_KEY, "1");
        stopSparkles();
        wheelWrap.classList.remove("spinning");
        wheelEl.classList.remove("is-spinning");

        /* Premium celebration */
        burstFireworks();
        burstCoins();
        burstConfetti();
        megaSparkler();
        burstFireworksFullScreen();

        /* settle + little bounce */
        const current = finalDeg % 360;
        wheelEl.style.transition = "none";
        wheelEl.style.transform = `rotate(${current}deg)`;
        wheelEl.style.setProperty("--final", `${current}deg`);
        void wheelEl.offsetHeight;
        wheelEl.style.transition = "";
        wheelEl.classList.add("hit");
        setTimeout(() => wheelEl.classList.remove("hit"), 800);

        /* redirect after the show */
        setTimeout(() => { window.location.href = PROMO_URL; }, 2200);

        isSpinning = false;
    }, { once: true });
}

/* ===== FX ===== */
function burstConfetti() {
    if (!confettiLayer) return;
    const count = 160;
    for (let i = 0; i < count; i++) {
        const el = document.createElement("div");
        el.className = "confetti";
        el.style.left = Math.random() * 100 + "%";
        el.style.setProperty("--dx", (Math.random() * 180 - 90) + "px");
        el.style.animationDelay = (Math.random() * 0.45) + "s";
        confettiLayer.appendChild(el);
        setTimeout(() => el.remove(), 1600);
    }
}
function burstCoins() {
    if (!coinLayer || !wheelEl) return;
    const rect = wheelEl.getBoundingClientRect();
    const cx = rect.width / 2, cy = rect.height / 2;
    const count = 30;
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const radius = 70 + Math.random() * 50;
        const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius;
        const c = document.createElement("div");
        c.className = "coin";
        c.style.left = cx + "px";
        c.style.top = cy + "px";
        c.style.setProperty("--x", x + "px");
        c.style.setProperty("--y", y + "px");
        coinLayer.appendChild(c);
        setTimeout(() => c.remove(), 1100);
    }
}
function burstFireworks() {
    if (!fireworkLayer || !wheelEl) return;
    const rect = wheelEl.getBoundingClientRect();
    const cx = rect.width / 2, cy = rect.height / 2;
    const COLORS = ["#ff1744", "#ffd600", "#00e5ff", "#64ffda", "#ff6efb", "#ff9100", "#b388ff", "#00ff95"];
    const totalBursts = 5;
    for (let b = 0; b < totalBursts; b++) {
        const particles = 34 + Math.floor(Math.random() * 10);
        const spread = 170 + Math.random() * 70;
        for (let i = 0; i < particles; i++) {
            const theta = (i / particles) * Math.PI * 2 + Math.random() * 0.12;
            const dist = spread + Math.random() * 60;
            const x = Math.cos(theta) * dist, y = Math.sin(theta) * dist;
            const fw = document.createElement("div");
            fw.className = "fw";
            fw.style.left = cx + "px";
            fw.style.top = cy + "px";
            fw.style.setProperty("--x", `${x}px`);
            fw.style.setProperty("--y", `${y}px`);
            fw.style.setProperty("--c", COLORS[(i + b) % COLORS.length]);
            fw.style.animationDelay = `${b * 120}ms`;
            fireworkLayer.appendChild(fw);
            setTimeout(() => fw.remove(), 1700 + b * 120);
        }
    }
}
function startSparkles() {
    if (!sparkLayer || !wheelEl) return;
    const rect = wheelEl.getBoundingClientRect();
    const cx = rect.width / 2, cy = rect.height / 2;
    const tick = () => {
        for (let i = 0; i < 7; i++) {
            const angle = Math.random() * Math.PI * 2, radius = 90 + Math.random() * 50;
            const sx = Math.cos(angle) * radius, sy = Math.sin(angle) * radius;
            const travel = 26 + Math.random() * 32, dx = Math.cos(angle) * travel, dy = Math.sin(angle) * travel;
            const sp = document.createElement("div");
            sp.className = "spark";
            sp.style.left = cx + sx + "px";
            sp.style.top = cy + sy + "px";
            sp.style.setProperty("--sx", dx + "px");
            sp.style.setProperty("--sy", dy + "px");
            sparkLayer.appendChild(sp);
            setTimeout(() => sp.remove(), 950);
        }
    };
    tick();
    sparkTimer = setInterval(tick, 105);
}
function stopSparkles() { if (sparkTimer) { clearInterval(sparkTimer); sparkTimer = null; } }
function megaSparkler() {
    if (!sparkLayer || !wheelEl) return;
    const rect = wheelEl.getBoundingClientRect();
    const cx = rect.width / 2, cy = rect.height / 2;
    const COLORS = ["#fff", "#ffd600", "#ff6efb", "#00e5ff", "#64ffda", "#ff9100"];
    const bursts = 5;
    for (let b = 0; b < bursts; b++) {
        const count = 44, spread = 150 + b * 30;
        for (let i = 0; i < count; i++) {
            const theta = (i / count) * Math.PI * 2 + Math.random() * 0.15;
            const dist = spread + Math.random() * 40;
            const x = Math.cos(theta) * dist, y = Math.sin(theta) * dist;
            const s = document.createElement("div");
            s.className = "sparkler";
            s.style.left = cx + "px";
            s.style.top = cy + "px";
            s.style.setProperty("--x", `${x}px`);
            s.style.setProperty("--y", `${y}px`);
            s.style.setProperty("--c", COLORS[(i + b) % COLORS.length]);
            s.style.animationDelay = `${b * 90}ms`;
            sparkLayer.appendChild(s);
            setTimeout(() => s.remove(), 1600 + b * 90);
        }
    }
}

/* Fullscreen finale */
function randomColor() {
    const c = ["#ff1744", "#ffd600", "#00e5ff", "#64ffda", "#ff6efb", "#ff9100", "#b388ff", "#00ff95"];
    return c[Math.floor(Math.random() * c.length)];
}
function fireworkBurstAt(container, cx, cy, radius = 260, particles = 46, delay = 0) {
    for (let i = 0; i < particles; i++) {
        const theta = (i / particles) * Math.PI * 2 + Math.random() * 0.1;
        const dist = radius + Math.random() * 80;
        const x = Math.cos(theta) * dist, y = Math.sin(theta) * dist;
        const el = document.createElement("div");
        el.className = "fw";
        el.style.left = cx + "px";
        el.style.top = cy + "px";
        el.style.setProperty("--x", x + "px");
        el.style.setProperty("--y", y + "px");
        el.style.setProperty("--c", randomColor());
        el.style.animationDelay = delay + "ms";
        container.appendChild(el);
        setTimeout(() => el.remove(), 1800 + delay);
    }
}
function glitterBurstAt(container, cx, cy, rings = 3, base = 180, step = 60, perRing = 26, delayStep = 100) {
    for (let r = 0; r < rings; r++) {
        const radius = base + r * step;
        for (let i = 0; i < perRing; i++) {
            const theta = (i / perRing) * Math.PI * 2 + Math.random() * 0.2;
            const dist = radius + Math.random() * 30;
            const x = Math.cos(theta) * dist, y = Math.sin(theta) * dist;
            const s = document.createElement("div");
            s.className = "sparkler";
            s.style.left = cx + "px";
            s.style.top = cy + "px";
            s.style.setProperty("--x", x + "px");
            s.style.setProperty("--y", y + "px");
            s.style.setProperty("--c", randomColor());
            s.style.animationDelay = (r * delayStep) + "ms";
            container.appendChild(s);
            setTimeout(() => s.remove(), 2200 + r * delayStep);
        }
    }
}
function burstFireworksFullScreen() {
    const W = window.innerWidth, H = window.innerHeight;
    pageFX.innerHTML = "";
    const centers = [
        [W * 0.2, H * 0.35], [W * 0.5, H * 0.25], [W * 0.8, H * 0.42],
        [W * 0.3, H * 0.72], [W * 0.7, H * 0.76]
    ];
    centers.forEach((c, idx) => {
        const [cx, cy] = c, delay = idx * 160;
        fireworkBurstAt(pageFX, cx, cy, 280 + Math.random() * 90, 48 + Math.floor(Math.random() * 12), delay);
        glitterBurstAt(pageFX, cx, cy, 3, 190, 62, 24, 90);
    });
    setTimeout(() => { pageFX.innerHTML = ""; }, 3500);
}

function buildWheelSVG() {
    const mount = document.getElementById("wheel-svg");
    if (!mount) return;

    const size = 1000;
    const r = size / 2;
    const svgNS = "http://www.w3.org/2000/svg";
    const segAngle = (2 * Math.PI) / SEGMENTS.length;

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");

    /* ======= DEFS ======= */
    const defs = document.createElementNS(svgNS, "defs");
    defs.innerHTML = `
    <radialGradient id="bg-grad" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#1b2a4e"/>
      <stop offset="65%" stop-color="#0f1a33"/>
      <stop offset="100%" stop-color="#0b1429"/>
    </radialGradient>

    <!-- jeweled rim -->
    <linearGradient id="rim-metal" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b38f26"/>
      <stop offset="20%" stop-color="#ffe07a"/>
      <stop offset="50%" stop-color="#b38f26"/>
      <stop offset="80%" stop-color="#ffe07a"/>
      <stop offset="100%" stop-color="#b38f26"/>
    </linearGradient>

    <!-- gem looks -->
    <radialGradient id="gem-ruby" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#fff"/>
      <stop offset="40%" stop-color="#ff7a8a"/>
      <stop offset="100%" stop-color="#c4002b"/>
    </radialGradient>
    <radialGradient id="gem-emerald" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#fff"/>
      <stop offset="40%" stop-color="#7ef9c2"/>
      <stop offset="100%" stop-color="#008c5a"/>
    </radialGradient>
    <radialGradient id="gem-sapphire" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#fff"/>
      <stop offset="40%" stop-color="#6fb7ff"/>
      <stop offset="100%" stop-color="#0047a3"/>
    </radialGradient>

    <!-- center cap jewel -->
    <radialGradient id="center-jewel" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#fff7d1"/>
      <stop offset="45%" stop-color="#ffd54a"/>
      <stop offset="100%" stop-color="#c78900"/>
    </radialGradient>

    <!-- gloss (soft) -->
    <linearGradient id="gloss" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,.45)"/>
      <stop offset="70%" stop-color="rgba(255,255,255,.05)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>

    <!-- filters -->
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feOffset dx="0" dy="2"/>
      <feGaussianBlur stdDeviation="3" result="shadow"/>
      <feComposite in="shadow" in2="SourceAlpha" operator="out"/>
      <feColorMatrix type="matrix"
        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .5 0"/>
      <feBlend in="SourceGraphic" mode="normal"/>
    </filter>
  `;
    svg.appendChild(defs);

    /* background disk */
    const disk = document.createElementNS(svgNS, "circle");
    disk.setAttribute("cx", r);
    disk.setAttribute("cy", r);
    disk.setAttribute("r", r - 18);
    disk.setAttribute("fill", "url(#bg-grad)");
    disk.setAttribute("filter", "url(#innerShadow)");
    svg.appendChild(disk);

    /* segment palette */
    const PALETTE = [
        ["#ff4d6d", "#ff8fa3"], ["#ffd166", "#fca311"], ["#22d3ee", "#60a5fa"],
        ["#7ef9c2", "#34d399"], ["#ff9dff", "#a78bfa"], ["#ffb86b", "#ff6b6b"],
        ["#5af7b0", "#00e676"], ["#cbb2ff", "#7c4dff"]
    ];

    /* segments + labels */
    for (let i = 0; i < SEGMENTS.length; i++) {
        const start = i * segAngle - Math.PI / 2;
        const end = start + segAngle;
        const x1 = r + (r - 30) * Math.cos(start);
        const y1 = r + (r - 30) * Math.sin(start);
        const x2 = r + (r - 30) * Math.cos(end);
        const y2 = r + (r - 30) * Math.sin(end);

        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", `M ${r} ${r} L ${x1} ${y1} A ${r - 30} ${r - 30} 0 0 1 ${x2} ${y2} Z`);
        const [c1, c2] = PALETTE[i % PALETTE.length];

        const gradId = `seg-grad-${i}`;
        const grad = document.createElementNS(svgNS, "linearGradient");
        grad.setAttribute("id", gradId);
        grad.setAttribute("x1", "0%");
        grad.setAttribute("y1", "0%");
        grad.setAttribute("x2", "100%");
        grad.setAttribute("y2", "100%");
        grad.innerHTML = `<stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>`;
        defs.appendChild(grad);

        path.setAttribute("fill", `url(#${gradId})`);
        path.setAttribute("stroke", "rgba(0,0,0,.35)");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("filter", "url(#softGlow)");
        svg.appendChild(path);

        /* labels (bigger text – CSS handles size) */
        const mid = start + segAngle / 2;
        const labelRadius = r - 150;
        const tx = r + labelRadius * Math.cos(mid);
        const ty = r + labelRadius * Math.sin(mid);
        let deg = (mid * 180) / Math.PI + 90;
        if (deg > 90 && deg < 270) deg += 180;

        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", tx);
        text.setAttribute("y", ty + 2);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("transform", `rotate(${deg} ${tx} ${ty})`);
        text.textContent = SEGMENTS[i].label;
        svg.appendChild(text);
    }

    /* subtle top gloss */
    const gloss = document.createElementNS(svgNS, "ellipse");
    gloss.setAttribute("cx", r);
    gloss.setAttribute("cy", r - 180);
    gloss.setAttribute("rx", r - 80);
    gloss.setAttribute("ry", 180);
    gloss.setAttribute("fill", "url(#gloss)");
    gloss.setAttribute("opacity", "0.14");
    svg.appendChild(gloss);

    /* JEWELED RIM */
    const rim = document.createElementNS(svgNS, "circle");
    rim.setAttribute("cx", r);
    rim.setAttribute("cy", r);
    rim.setAttribute("r", r - 12);
    rim.setAttribute("fill", "transparent");
    rim.setAttribute("stroke", "url(#rim-metal)");
    rim.setAttribute("stroke-width", "16");
    rim.setAttribute("filter", "url(#softGlow)");
    svg.appendChild(rim);

    /* soft inner ring */
    const rim2 = document.createElementNS(svgNS, "circle");
    rim2.setAttribute("cx", r);
    rim2.setAttribute("cy", r);
    rim2.setAttribute("r", r - 4);
    rim2.setAttribute("fill", "transparent");
    rim2.setAttribute("stroke", "rgba(255,255,255,.10)");
    rim2.setAttribute("stroke-width", "2");
    svg.appendChild(rim2);

    const gemGroup = document.createElementNS(svgNS, "g");
    const rayGroup = document.createElementNS(svgNS, "g");
    rayGroup.setAttribute("class", "ray-group");

    const gemCount = 36;
    const gemRadius = r - 20;
    const rayInner = r - 60;
    const rayOuter = r - 10;

    for (let i = 0; i < gemCount; i++) {
        const a = (i / gemCount) * Math.PI * 2 - Math.PI / 2;
        const gx = r + gemRadius * Math.cos(a);
        const gy = r + gemRadius * Math.sin(a);

        const which = i % 3 === 0 ? "gem-ruby" : (i % 3 === 1 ? "gem-emerald" : "gem-sapphire");

        const gem = document.createElementNS(svgNS, "circle");
        gem.setAttribute("class", "gem");
        gem.setAttribute("cx", gx);
        gem.setAttribute("cy", gy);
        gem.setAttribute("r", 10);
        gem.setAttribute("fill", `url(#${which})`);
        gem.setAttribute("stroke", "rgba(255,255,255,.35)");
        gem.setAttribute("stroke-width", "1");
        gemGroup.appendChild(gem);

        if (i % 3 === 0) {
            const rx1 = r + rayInner * Math.cos(a);
            const ry1 = r + rayInner * Math.sin(a);
            const rx2 = r + rayOuter * Math.cos(a);
            const ry2 = r + rayOuter * Math.sin(a);
            const ray = document.createElementNS(svgNS, "line");
            ray.setAttribute("x1", rx1); ray.setAttribute("y1", ry1);
            ray.setAttribute("x2", rx2); ray.setAttribute("y2", ry2);
            ray.setAttribute("stroke", "#fff8d6");
            ray.setAttribute("stroke-width", "2");
            ray.setAttribute("class", "ray");
            rayGroup.appendChild(ray);
        }
    }
    svg.appendChild(rayGroup);
    svg.appendChild(gemGroup);

    const shineRing = document.createElementNS(svgNS, "g");
    shineRing.setAttribute("id", "shineRing");
    const stars = 14;
    const sr = r - 95;
    for (let i = 0; i < stars; i++) {
        const a = (i / stars) * Math.PI * 2 - Math.PI / 2;
        const sx = r + sr * Math.cos(a);
        const sy = r + sr * Math.sin(a);
        const s = document.createElementNS(svgNS, "circle");
        s.setAttribute("cx", sx);
        s.setAttribute("cy", sy);
        s.setAttribute("r", 3.2);
        s.setAttribute("fill", "#fff9c4");
        s.setAttribute("opacity", "0.9");
        s.setAttribute("filter", "url(#softGlow)");
        shineRing.appendChild(s);
    }
    svg.appendChild(shineRing);

    /* center cap */
    const cap = document.createElementNS(svgNS, "circle");
    cap.setAttribute("cx", r);
    cap.setAttribute("cy", r);
    cap.setAttribute("r", 84);
    cap.setAttribute("fill", "url(#center-jewel)");
    cap.setAttribute("filter", "url(#softGlow)");
    svg.appendChild(cap);

    mount.appendChild(svg);
}

