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

function code(prefix) {
    const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${prefix}-${rnd}`;
}

const SPIN_KEY = "mrspinny_wheel_spin";

const wheelEl = document.querySelector(".wheel");
const spinBtn = document.getElementById("spinBtn");
const modalEl = document.getElementById("resultModal");
const modalClose = document.getElementById("modalClose");
const resultDesc = document.getElementById("resultDesc");
const couponCodeEl = document.getElementById("couponCode");
const copyCouponBtn = document.getElementById("copyCoupon");
const confettiLayer = document.getElementById("confettiLayer");
const coinLayer = document.getElementById("coinLayer");

buildWheelSVG();
init();

function init() {
    if (localStorage.getItem(SPIN_KEY) === "1") {
        spinBtn.textContent = "Already Spin";
        spinBtn.disabled = true;
    }
    spinBtn.addEventListener("click", onSpin);
    modalClose.addEventListener("click", closeModal);
    modalEl.addEventListener("click", (e) => { if (e.target === modalEl) closeModal(); });
    copyCouponBtn.addEventListener("click", copyCoupon);
}

function pickSegment(segments = SEGMENTS) {
    const total = segments.reduce((s, seg) => s + seg.weight, 0);
    let r = Math.random() * total;
    for (const seg of segments) { if ((r -= seg.weight) <= 0) return seg; }
    return segments[segments.length - 1];
}

let isSpinning = false;

function onSpin() {
    if (isSpinning) return;
    if (localStorage.getItem(SPIN_KEY) === "1") return;

    isSpinning = true;
    spinBtn.disabled = true;
    spinBtn.textContent = "Spinning...";

    let chosen = pickSegment();
    let rerolled = false;
    if (chosen.label === "Reroll") { rerolled = true; chosen = pickSegment(); }

    const segmentCount = SEGMENTS.length;
    const index = SEGMENTS.findIndex((s) => s.label === chosen.label);
    const segmentAngle = 360 / segmentCount;
    const base = 360 * 5;
    const offset = segmentAngle * index + segmentAngle / 2;
    const finalDeg = base + (360 - offset) + rand(-6, 6);

    requestAnimationFrame(() => { wheelEl.style.transform = `rotate(${finalDeg}deg)`; });

    wheelEl.addEventListener("transitionend", function handler() {
        wheelEl.removeEventListener("transitionend", handler);

        localStorage.setItem(SPIN_KEY, "1");

        burstConfetti();
        burstCoins();

        const coupon = chosen.coupon();
        const msg = rerolled
            ? `You landed on Reroll and got <strong>${chosen.label}</strong>!`
            : `You won <strong>${chosen.label}</strong>!`;

        couponCodeEl.textContent = coupon;
        resultDesc.innerHTML = `${msg}<br/>Use this coupon during signup.`;

        openModal();

        spinBtn.textContent = "Already Spin";
        spinBtn.disabled = true;

        const current = finalDeg % 360;
        wheelEl.style.transition = "none";
        wheelEl.style.transform = `rotate(${current}deg)`;
        wheelEl.offsetHeight;
        wheelEl.style.transition = "";
        isSpinning = false;
    }, { once: true });
}

function openModal() { modalEl.hidden = false; }
function closeModal() { modalEl.hidden = true; }

async function copyCoupon() {
    try {
        await navigator.clipboard.writeText(couponCodeEl.textContent);
        copyCouponBtn.textContent = "Copied!";
        setTimeout(() => (copyCouponBtn.textContent = "Copy"), 1500);
    } catch {
        alert("Copy failed. Please copy the code manually.");
    }
}

function burstConfetti() {
    const count = 120;
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
    const rect = wheelEl.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
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

function buildWheelSVG() {
    const size = 1000;
    const r = size / 2;
    const segAngle = (2 * Math.PI) / SEGMENTS.length;
    const svgNS = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");

    const bg = document.createElementNS(svgNS, "circle");
    bg.setAttribute("cx", r);
    bg.setAttribute("cy", r);
    bg.setAttribute("r", r - 16);
    bg.setAttribute("fill", "#16233b");
    svg.appendChild(bg);

    for (let i = 0; i < SEGMENTS.length; i++) {
        const start = i * segAngle - Math.PI / 2;
        const end = start + segAngle;

        const x1 = r + (r - 20) * Math.cos(start);
        const y1 = r + (r - 20) * Math.sin(start);
        const x2 = r + (r - 20) * Math.cos(end);
        const y2 = r + (r - 20) * Math.sin(end);

        const largeArc = segAngle > Math.PI ? 1 : 0;

        const path = document.createElementNS(svgNS, "path");
        const d = [`M ${r} ${r}`, `L ${x1} ${y1}`, `A ${r - 20} ${r - 20} 0 ${largeArc} 1 ${x2} ${y2}`, "Z"].join(" ");
        path.setAttribute("d", d);
        path.setAttribute("fill", i % 2 ? "#1b2a49" : "#21355b");
        path.setAttribute("stroke", "#0b1424");
        path.setAttribute("stroke-width", "2");
        svg.appendChild(path);

        const mid = start + segAngle / 2;
        const labelRadius = r - 140;
        const tx = r + labelRadius * Math.cos(mid);
        const ty = r + labelRadius * Math.sin(mid);
        let deg = mid * 180 / Math.PI + 90;
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
    rim.setAttribute("cx", r);
    rim.setAttribute("cy", r);
    rim.setAttribute("r", r - 10);
    rim.setAttribute("fill", "transparent");
    rim.setAttribute("stroke", "#f1c40f");
    rim.setAttribute("stroke-width", "10");
    svg.appendChild(rim);

    document.getElementById("wheel-svg").appendChild(svg);
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
