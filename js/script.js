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
    setTimeout(() => {
        const first = mobilePanel?.querySelector("a, button");
        first?.focus();
    }, 220);
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
    const focusables = mobilePanel?.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
    const list = focusables ? Array.from(focusables) : [];
    if (!list.length) return;
    const first = list[0], last = list[list.length - 1], active = document.activeElement;
    if (e.shiftKey && active === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && active === last) { first.focus(); e.preventDefault(); }
});

const SEGMENTS = [
    { label: "10 Free Spins", weight: 20, coupon: () => code("SPIN10") },
    { label: "$2 Bonus", weight: 18, coupon: () => code("BONUS2") },
    { label: "Mystery Box", weight: 10, coupon: () => code("MYSTERY") },
    { label: "20 Free Spins", weight: 12, coupon: () => code("SPIN20") },
    { label: "$5 Bonus", weight: 8, coupon: () => code("BONUS5") },
    { label: "Reroll", weight: 12, coupon: () => code("REROLL") },
    { label: "Lucky Chip", weight: 10, coupon: () => code("LUCKY") },
    { label: "5 Free Spins", weight: 10, coupon: () => code("SPIN5") }
];

function code(prefix) { return `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const SPIN_KEY = "mrspinny_wheel_spin";

const wheelWrap = document.getElementById("wheelWrap");
const wheelEl = document.querySelector(".wheel");
const spinBtn = document.getElementById("spinBtn");
const modalEl = document.getElementById("resultModal");
const modalClose = document.getElementById("modalClose");
const resultDesc = document.getElementById("resultDesc");
const couponCodeEl = document.getElementById("couponCode");
const copyCouponBtn = document.getElementById("copyCoupon");
const confettiLayer = document.getElementById("confettiLayer");
const coinLayer = document.getElementById("coinLayer");
const fireworkLayer = document.getElementById("fireworkLayer");
const sparkLayer = document.getElementById("sparkLayer");
const modalFX = document.getElementById("modalFX");

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
    modalClose?.addEventListener("click", closeModal);
    modalEl?.addEventListener("click", (e) => { if (e.target === modalEl) closeModal(); });
    copyCouponBtn?.addEventListener("click", copyCoupon);
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
    if (localStorage.getItem(SPIN_KEY) === "1") return;

    isSpinning = true;

    spinBtn.style.transition = "none";
    spinBtn.style.transform = "translate(-50%, -50%)";
    spinBtn.style.display = "none";

    spinBtn.disabled = true;
    wheelWrap.classList.add("spinning");
    wheelEl.classList.add("is-spinning");
    startSparkles();

    let chosen = pickSegment();
    let rerolled = false;
    if (chosen.label === "Reroll") { rerolled = true; chosen = pickSegment(); }

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

        burstFireworks();
        burstCoins();
        burstConfetti();
        megaSparkler();

        const coupon = chosen.coupon();
        const msg = rerolled
            ? `You landed on Reroll and got <strong>${chosen.label}</strong>!`
            : `You won <strong>${chosen.label}</strong>!`;
        if (couponCodeEl) couponCodeEl.textContent = coupon;
        if (resultDesc) resultDesc.innerHTML = `${msg}<br/>Use this coupon during signup.`;

        openModal();
        burstFireworksFullScreen();

        const current = finalDeg % 360;
        wheelEl.style.transition = "none";
        wheelEl.style.transform = `rotate(${current}deg)`;
        wheelEl.style.setProperty("--final", `${current}deg`);
        void wheelEl.offsetHeight;
        wheelEl.style.transition = "";
        wheelEl.classList.add("hit");
        setTimeout(() => wheelEl.classList.remove("hit"), 800);

        isSpinning = false;
    }, { once: true });
}

function openModal() {
    if (!modalEl) return;
    modalEl.hidden = false;
    if (modalFX) celebrationBackdrop(modalFX);
}
function closeModal() {
    if (!modalEl) return;
    modalEl.hidden = true;
    if (modalFX) modalFX.innerHTML = "";
    if (pageFX) pageFX.innerHTML = "";
}
async function copyCoupon() {
    if (!copyCouponBtn || !couponCodeEl) return;
    try {
        await navigator.clipboard.writeText(couponCodeEl.textContent);
        copyCouponBtn.textContent = "Copied!";
        setTimeout(() => (copyCouponBtn.textContent = "Copy"), 1500);
    } catch {
        alert("Copy failed. Please copy the code manually.");
    }
}

function burstConfetti() {
    if (!confettiLayer) return;
    const count = 130;
    for (let i = 0; i < count; i++) {
        const el = document.createElement("div");
        el.className = "confetti";
        el.style.left = Math.random() * 100 + "%";
        el.style.setProperty("--dx", (Math.random() * 160 - 80) + "px");
        el.style.animationDelay = (Math.random() * 0.35) + "s";
        confettiLayer.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    }
}
function burstCoins() {
    if (!coinLayer || !wheelEl) return;
    const rect = wheelEl.getBoundingClientRect();
    const centerX = rect.width / 2, centerY = rect.height / 2;
    const count = 26;
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const radius = 60 + Math.random() * 40;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const c = document.createElement("div");
        c.className = "coin";
        c.style.left = centerX + "px";
        c.style.top = centerY + "px";
        c.style.setProperty("--x", x + "px");
        c.style.setProperty("--y", y + "px");
        coinLayer.appendChild(c);
        setTimeout(() => c.remove(), 1000);
    }
}
function burstFireworks() {
    if (!fireworkLayer || !wheelEl) return;
    const rect = wheelEl.getBoundingClientRect();
    const cx = rect.width / 2, cy = rect.height / 2;
    const COLORS = ["#ff1744", "#ffd600", "#00e5ff", "#64ffda", "#ff6efb", "#ff9100", "#b388ff", "#00ff95"];
    const totalBursts = 4;
    for (let b = 0; b < totalBursts; b++) {
        const particles = Math.floor(30 + Math.random() * 10);
        const spread = 150 + Math.random() * 60;
        for (let i = 0; i < particles; i++) {
            const theta = (i / particles) * Math.PI * 2 + Math.random() * 0.1;
            const dist = spread + Math.random() * 50;
            const x = Math.cos(theta) * dist;
            const y = Math.sin(theta) * dist;
            const fw = document.createElement("div");
            fw.className = "fw";
            fw.style.left = cx + "px";
            fw.style.top = cy + "px";
            fw.style.setProperty("--x", `${x}px`);
            fw.style.setProperty("--y", `${y}px`);
            fw.style.setProperty("--c", COLORS[(i + b) % COLORS.length]);
            fw.style.animationDelay = `${b * 150}ms`;
            fireworkLayer.appendChild(fw);
            setTimeout(() => fw.remove(), 1600 + b * 150);
        }
    }
}
function startSparkles() {
    if (!sparkLayer || !wheelEl) return;
    const rect = wheelEl.getBoundingClientRect();
    const cx = rect.width / 2, cy = rect.height / 2;
    const tick = () => {
        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 80 + Math.random() * 40;
            const sx = Math.cos(angle) * radius;
            const sy = Math.sin(angle) * radius;
            const travel = 22 + Math.random() * 28;
            const dx = Math.cos(angle) * travel;
            const dy = Math.sin(angle) * travel;
            const sp = document.createElement("div");
            sp.className = "spark";
            sp.style.left = cx + sx + "px";
            sp.style.top = cy + sy + "px";
            sp.style.setProperty("--sx", dx + "px");
            sp.style.setProperty("--sy", dy + "px");
            sparkLayer.appendChild(sp);
            setTimeout(() => sp.remove(), 900);
        }
    };
    tick();
    sparkTimer = setInterval(tick, 110);
}
function stopSparkles() {
    if (sparkTimer) { clearInterval(sparkTimer); sparkTimer = null; }
}
function megaSparkler() {
    if (!sparkLayer || !wheelEl) return;
    const rect = wheelEl.getBoundingClientRect();
    const cx = rect.width / 2, cy = rect.height / 2;
    const COLORS = ["#fff", "#ffd600", "#ff6efb", "#00e5ff", "#64ffda", "#ff9100"];
    const bursts = 4;
    for (let b = 0; b < bursts; b++) {
        const count = 40;
        const spread = 140 + b * 30;
        for (let i = 0; i < count; i++) {
            const theta = (i / count) * Math.PI * 2 + Math.random() * 0.2;
            const dist = spread + Math.random() * 30;
            const x = Math.cos(theta) * dist;
            const y = Math.sin(theta) * dist;
            const s = document.createElement("div");
            s.className = "sparkler";
            s.style.left = cx + "px";
            s.style.top = cy + "px";
            s.style.setProperty("--x", `${x}px`);
            s.style.setProperty("--y", `${y}px`);
            s.style.setProperty("--c", COLORS[(i + b) % COLORS.length]);
            s.style.animationDelay = `${b * 80}ms`;
            sparkLayer.appendChild(s);
            setTimeout(() => s.remove(), 1400 + b * 80);
        }
    }
}
function celebrationBackdrop(container) {
    if (!container) return;
    container.innerHTML = "";
    const totalGlitter = 100;
    for (let i = 0; i < totalGlitter; i++) {
        const el = document.createElement("div");
        el.className = "sparkler";
        el.style.left = Math.random() * 100 + "%";
        el.style.top = Math.random() * -20 + "%";
        el.style.animationDelay = `${Math.random() * 1.5}s`;
        el.style.animationDuration = `${3 + Math.random() * 2}s`;
        el.style.setProperty("--dx", `${Math.random() * 20 - 10}px`);
        el.style.setProperty("--dy", `${Math.random() * 100 + 100}px`);
        el.style.setProperty("--x", `${Math.random() * 100 - 50}px`);
        container.appendChild(el);
        setTimeout(() => el.remove(), 5000);
    }
}

function randomColor() {
    const c = ["#ff1744", "#ffd600", "#00e5ff", "#64ffda", "#ff6efb", "#ff9100", "#b388ff", "#00ff95"];
    return c[Math.floor(Math.random() * c.length)];
}
function fireworkBurstAt(container, cx, cy, radius = 220, particles = 42, delay = 0, big = false) {
    for (let i = 0; i < particles; i++) {
        const theta = (i / particles) * Math.PI * 2 + Math.random() * 0.12;
        const dist = radius + Math.random() * 80;
        const x = Math.cos(theta) * dist;
        const y = Math.sin(theta) * dist;
        const el = document.createElement("div");
        el.className = big ? "fw-xl" : "fw";
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
function glitterBurstAt(container, cx, cy, rings = 3, base = 160, step = 60, perRing = 26, delayStep = 100) {
    for (let r = 0; r < rings; r++) {
        const radius = base + r * step;
        for (let i = 0; i < perRing; i++) {
            const theta = (i / perRing) * Math.PI * 2 + Math.random() * 0.2;
            const dist = radius + Math.random() * 30;
            const x = Math.cos(theta) * dist;
            const y = Math.sin(theta) * dist;
            const s = document.createElement("div");
            s.className = "sparkler sparkler-xl";
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
        [W * 0.25, H * 0.35], [W * 0.5, H * 0.25], [W * 0.75, H * 0.42], [W * 0.35, H * 0.7], [W * 0.65, H * 0.75]
    ];
    centers.forEach((c, idx) => {
        const [cx, cy] = c;
        const delay = idx * 180;
        fireworkBurstAt(pageFX, cx, cy, 260 + Math.random() * 80, 44 + Math.floor(Math.random() * 12), delay, true);
        glitterBurstAt(pageFX, cx, cy, 3, 180, 60, 24, 90);
    });
    setTimeout(() => { pageFX.innerHTML = ""; }, 3500);
}

function buildWheelSVG() {
    const mount = document.getElementById("wheel-svg");
    if (!mount) return;
    const size = 1000, r = size / 2, segAngle = (2 * Math.PI) / SEGMENTS.length, svgNS = "http://www.w3.org/2000/svg";
    const PALETTE = [
        ["#ff1744", "#ff5252"], ["#ffd600", "#ffab00"], ["#00e5ff", "#2979ff"], ["#64ffda", "#00e676"],
        ["#ff6efb", "#a100ff"], ["#ff9100", "#ff3d00"], ["#00ff95", "#00c853"], ["#b388ff", "#7c4dff"]
    ];
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    const defs = document.createElementNS(svgNS, "defs");
    svg.appendChild(defs);

    const bg = document.createElementNS(svgNS, "circle");
    bg.setAttribute("cx", r); bg.setAttribute("cy", r); bg.setAttribute("r", r - 16);
    bg.setAttribute("fill", "url(#bg-grad)");
    svg.appendChild(bg);

    const bgGrad = document.createElementNS(svgNS, "radialGradient");
    bgGrad.setAttribute("id", "bg-grad");
    bgGrad.innerHTML = `
    <stop offset="0%" stop-color="#1a2a4f"/>
    <stop offset="65%" stop-color="#0f1a33"/>
    <stop offset="100%" stop-color="#0c1429"/>
  `;
    defs.appendChild(bgGrad);

    for (let i = 0; i < SEGMENTS.length; i++) {
        const start = i * segAngle - Math.PI / 2;
        const end = start + segAngle;
        const x1 = r + (r - 20) * Math.cos(start);
        const y1 = r + (r - 20) * Math.sin(start);
        const x2 = r + (r - 20) * Math.cos(end);
        const y2 = r + (r - 20) * Math.sin(end);
        const path = document.createElementNS(svgNS, "path");
        const d = [`M ${r} ${r}`, `L ${x1} ${y1}`, `A ${r - 20} ${r - 20} 0 0 1 ${x2} ${y2}`, "Z"].join(" ");
        path.setAttribute("d", d);
        const [c1, c2] = PALETTE[i % PALETTE.length];
        const gradId = `seg-grad-${i}`;
        const grad = document.createElementNS(svgNS, "linearGradient");
        grad.setAttribute("id", gradId);
        grad.setAttribute("x1", "0%"); grad.setAttribute("y1", "0%"); grad.setAttribute("x2", "100%"); grad.setAttribute("y2", "100%");
        grad.innerHTML = `<stop offset="0%" stop-color="${c1}" /><stop offset="100%" stop-color="${c2}" />`;
        defs.appendChild(grad);
        path.setAttribute("fill", `url(#${gradId})`);
        path.setAttribute("stroke", "rgba(0,0,0,.35)");
        path.setAttribute("stroke-width", "2");
        svg.appendChild(path);

        const mid = start + segAngle / 2;
        const labelRadius = r - 140;
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

    const rim = document.createElementNS(svgNS, "circle");
    rim.setAttribute("cx", r); rim.setAttribute("cy", r); rim.setAttribute("r", r - 10);
    rim.setAttribute("fill", "transparent"); rim.setAttribute("stroke", "#ffd54a"); rim.setAttribute("stroke-width", "10");
    svg.appendChild(rim);

    const rim2 = document.createElementNS(svgNS, "circle");
    rim2.setAttribute("cx", r); rim2.setAttribute("cy", r); rim2.setAttribute("r", r - 2);
    rim2.setAttribute("fill", "transparent"); rim2.setAttribute("stroke", "rgba(255,255,255,.15)"); rim2.setAttribute("stroke-width", "2");
    svg.appendChild(rim2);

    mount.appendChild(svg);
}
