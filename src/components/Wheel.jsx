import { useEffect, useRef, useState } from "react";

const SEGMENTS = [
    { label: "200% Bonus + 100 Free Spins", key: "grand", grand: true, weight: 1 },
    { label: "100 Free Spins", value: 100, weight: 2 },
    { label: "75 Free Spins", value: 75, weight: 5 },
    { label: "50 Free Spins", value: 50, weight: 12 },
    { label: "25 Free Spins", value: 25, weight: 20 },
    { label: "10 Free Spins", value: 10, weight: 28 },
];

const PROMO_URL = "https://mrspinny.com/promotions";
const REWARD_KEY = "mrspinny_wheel_reward";
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const reduceMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function Wheel() {
    const wrapRef = useRef(null);
    const wheelRef = useRef(null);         // container we rotate AND mount SVG into
    const spinBtnRef = useRef(null);
    const claimBtnRef = useRef(null);
    const confettiRef = useRef(null);
    const coinRef = useRef(null);
    const fireworkRef = useRef(null);
    const pageFXRef = useRef(null);
    const [spinning, setSpinning] = useState(false);

    useEffect(() => {
        const pageFX = document.createElement("div");
        pageFX.id = "pageFX";
        pageFX.className = "page-fx";
        document.body.appendChild(pageFX);
        pageFXRef.current = pageFX;

        injectHeatFilter();
        buildWheelSVG(wheelRef.current);     // mount into the same element we rotate
        initWheel();

        return () => {
            try { pageFX.remove(); } catch { }
            endCelebration();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function initWheel() {
        const btn = spinBtnRef.current;
        if (!btn) return;
        btn.addEventListener("click", onSpin);
        idleBGKick();
    }

    function pickSegment(list = SEGMENTS) {
        const total = list.reduce((s, seg) => s + seg.weight, 0);
        let r = Math.random() * total;
        for (const seg of list) {
            if ((r -= seg.weight) <= 0) return seg;
        }
        return list[list.length - 1];
    }

    const fx = {
        timers: new Set(),
        add(id) { this.timers.add(id); },
        clear() { this.timers.forEach(clearTimeout); this.timers.clear(); }
    };

    function startCelebrationWindow(ms = 2600) { endCelebration(); const id = setTimeout(endCelebration, ms); fx.add(id); }
    function endCelebration() {
        fx.clear();
        try {
            if (confettiRef.current) confettiRef.current.innerHTML = "";
            if (coinRef.current) coinRef.current.innerHTML = "";
            if (fireworkRef.current) fireworkRef.current.innerHTML = "";
            if (pageFXRef.current) pageFXRef.current.innerHTML = "";
            const ring = document.getElementById("flameRing");
            if (ring) { ring.classList.remove("heatwave"); ring.innerHTML = ""; }
        } catch { }
        document.querySelectorAll(".flame-coin,.coin,.spark,.fw,.sparkler,.sparkler-xl,.fw-xl,.shockwave").forEach(n => n.remove());
        wrapRef.current?.classList.remove("do-shake", "spinning");
        wheelRef.current?.classList.remove("is-spinning", "hit");
    }

    function pulseRingsBurst(times = 5, gap = 140) {
        const wrap = wrapRef.current;
        if (!wrap) return;
        for (let i = 0; i < times; i++) {
            const tid = setTimeout(() => {
                const ring = document.createElement("div");
                ring.className = "bg-ring";
                wrap.querySelector(".wheel-bg")?.appendChild(ring);
                const tid2 = setTimeout(() => ring.remove(), 1600);
                fx.add(tid2);
            }, i * gap);
            fx.add(tid);
        }
    }
    function idleBGKick() { const t = setTimeout(() => pulseRingsBurst(2, 220), 600); fx.add(t); }

    async function onSpin() {
        if (spinning || !wheelRef.current || !wrapRef.current) return;
        setSpinning(true);
        endCelebration();

        const btn = spinBtnRef.current;
        if (btn) { btn.disabled = true; btn.classList.add("is-hidden"); }
        const claim = claimBtnRef.current;
        if (claim) { claim.hidden = true; claim.classList.remove("show"); }

        wrapRef.current.classList.add("spinning");
        wheelRef.current.classList.add("is-spinning");

        pulseRingsBurst(4, 130);

        const chosen = pickSegment();
        const segmentCount = SEGMENTS.length;
        const index = SEGMENTS.findIndex(s => s.label === chosen.label);
        const segmentAngle = 360 / segmentCount;
        const baseTurns = 6;
        const base = 360 * baseTurns;
        const offset = segmentAngle * index + segmentAngle / 2;
        const jitter = rand(-6, 6);
        const finalDeg = base + (360 - offset) + jitter;

        requestAnimationFrame(() => { wheelRef.current.style.transform = `rotate(${finalDeg}deg)`; });

        wheelRef.current.addEventListener("transitionend", function handler() {
            wheelRef.current.removeEventListener("transitionend", handler);
            onSpinEnd(finalDeg, chosen);
            setSpinning(false);
        }, { once: true });
    }

    function onSpinEnd(finalDeg, chosen) {
        try {
            localStorage.setItem(REWARD_KEY, JSON.stringify({ label: chosen.label, value: chosen.value ?? null, date: todayStr() }));
        } catch { }

        wrapRef.current?.classList.remove("spinning");
        wheelRef.current?.classList.remove("is-spinning");

        startCelebrationWindow(reduceMotion() ? 1600 : 2600);
        screenShake(10, 500);
        igniteFlameRing(reduceMotion() ? 1600 : 2600, 32);
        heatWave(reduceMotion() ? 1200 : 2000);
        shockwave(2);
        burstFlamingCoins({ count: reduceMotion() ? 24 : 70, embers: true, trails: true });
        burstFireworks();
        burstConfetti();
        burstFireworksFullScreen();
        pulseRingsBurst(3, 160);

        const current = finalDeg % 360;
        const w = wheelRef.current;
        w.style.transition = "none";
        w.style.transform = `rotate(${current}deg)`;
        w.style.setProperty("--final", `${current}deg`);
        void w.offsetHeight;
        w.style.transition = "";
        w.classList.add("hit");
        const tHit = setTimeout(() => w.classList.remove("hit"), 800); fx.add(tHit);

        const claim = claimBtnRef.current;
        const rewardParam = chosen.value ? `${chosen.value}FS` : encodeURIComponent(chosen.label);
        if (claim) {
            claim.href = `${PROMO_URL}?reward=${rewardParam}`;
            claim.hidden = false;
            const t = setTimeout(() => claim.classList.add("show"), 200);
            fx.add(t);
        }
    }

    function igniteFlameRing(duration = 2800, jets = 28) {
        const ring = document.getElementById("flameRing"); if (!ring) return;
        ring.innerHTML = "";
        const frag = document.createDocumentFragment();
        for (let i = 0; i < jets; i++) {
            const jet = document.createElement("div");
            jet.className = "flame-jet";
            jet.style.setProperty("--a", (i / jets) * 360 + "deg");
            jet.style.setProperty("--d", 46 + Math.random() * 3 + "%");
            jet.style.height = 90 + Math.random() * 50 + "px";
            jet.style.width = 18 + Math.random() * 10 + "px";
            jet.style.animationDelay = Math.random() * 180 + "ms";
            frag.appendChild(jet);
        }
        ring.appendChild(frag);
        const tid = setTimeout(() => { ring.innerHTML = ""; }, duration); fx.add(tid);
    }
    function heatWave(duration = 1800) {
        const ring = document.getElementById("flameRing"); if (!ring) return;
        ring.classList.add("heatwave");
        const tid = setTimeout(() => ring.classList.remove("heatwave"), duration); fx.add(tid);
    }
    function shockwave(count = 1) {
        const n = Math.max(1, count);
        for (let i = 0; i < n; i++) {
            const sw = document.createElement("div");
            sw.className = "shockwave";
            sw.style.animationDelay = `${i * 120}ms`;
            pageFXRef.current.appendChild(sw);
            const tid = setTimeout(() => sw.remove(), 1200 + i * 120); fx.add(tid);
        }
    }
    function screenShake(intensity = 8, duration = 450) {
        const el = wrapRef.current; if (!el) return;
        el.style.setProperty("--shake-intensity", intensity + "px");
        el.classList.add("do-shake");
        const tid = setTimeout(() => el.classList.remove("do-shake"), duration + 60); fx.add(tid);
    }
    function burstConfetti() {
        const layer = confettiRef.current; if (!layer) return;
        const count = reduceMotion() ? 80 : 160;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const el = document.createElement("div");
            el.className = "confetti";
            el.style.left = Math.random() * 100 + "%";
            el.style.setProperty("--dx", Math.random() * 180 - 90 + "px");
            el.style.animationDelay = Math.random() * 0.45 + "s";
            frag.appendChild(el);
        }
        layer.appendChild(frag);
        const tid = setTimeout(() => (layer.innerHTML = ""), 1700); fx.add(tid);
    }
    function burstFireworks() {
        const layer = fireworkRef.current, wheel = wheelRef.current; if (!layer || !wheel) return;
        const rect = wheel.getBoundingClientRect();
        const cx = rect.width / 2, cy = rect.height / 2;
        const COLORS = ["#ffd54a", "#f59e0b", "#ffcc33", "#b71c1c", "#8e0e0e", "#fff1a8"];
        const total = reduceMotion() ? 3 : 5;
        const frag = document.createDocumentFragment();
        for (let b = 0; b < total; b++) {
            const particles = 34 + Math.floor(Math.random() * 10);
            const spread = 170 + Math.random() * 70;
            for (let i = 0; i < particles; i++) {
                const theta = (i / particles) * Math.PI * 2 + Math.random() * 0.12;
                const dist = spread + Math.random() * 60;
                const x = Math.cos(theta) * dist, y = Math.sin(theta) * dist;
                const fw = document.createElement("div");
                fw.className = "fw";
                fw.style.left = cx + "px"; fw.style.top = cy + "px";
                fw.style.setProperty("--x", `${x}px`);
                fw.style.setProperty("--y", `${y}px`);
                fw.style.setProperty("--c", COLORS[(i + b) % COLORS.length]);
                fw.style.animationDelay = `${b * 120}ms`;
                frag.appendChild(fw);
                const tid = setTimeout(() => fw.remove(), 1800 + b * 120); fx.add(tid);
            }
        }
        layer.appendChild(frag);
    }
    function randomColor() { const c = ["#ffd54a", "#f59e0b", "#ffcc33", "#b71c1c", "#8e0e0e", "#fff1a8"]; return c[Math.floor(Math.random() * c.length)]; }
    function fireworkBurstAt(container, cx, cy, radius = 280, particles = 46, delay = 0) {
        const frag = document.createDocumentFragment();
        for (let i = 0; i < particles; i++) {
            const theta = (i / particles) * Math.PI * 2 + Math.random() * 0.1;
            const dist = radius + Math.random() * 80;
            const x = Math.cos(theta) * dist, y = Math.sin(theta) * dist;
            const el = document.createElement("div");
            el.className = "fw";
            el.style.left = cx + "px"; el.style.top = cy + "px";
            el.style.setProperty("--x", x + "px"); el.style.setProperty("--y", y + "px");
            el.style.setProperty("--c", randomColor()); el.style.animationDelay = delay + "ms";
            frag.appendChild(el);
            const t = setTimeout(() => el.remove(), 1800 + delay); fx.add(t);
        }
        container.appendChild(frag);
    }
    function burstFireworksFullScreen() {
        const W = window.innerWidth, H = window.innerHeight;
        pageFXRef.current.innerHTML = "";
        if (reduceMotion()) return;
        const centers = [[W * .2, H * .35], [W * .5, H * .25], [W * .8, H * .42], [W * .3, H * .72], [W * .7, H * .76]];
        centers.forEach((c, idx) => {
            const [cx, cy] = c, delay = idx * 160;
            fireworkBurstAt(pageFXRef.current, cx, cy, 280 + Math.random() * 90, 48 + Math.floor(Math.random() * 12), delay);
        });
        const tid = setTimeout(() => { pageFXRef.current.innerHTML = ""; }, 3600); fx.add(tid);
    }
    function burstFlamingCoins({ count = 80, embers = true, trails = true } = {}) {
        const layer = coinRef.current; if (!layer) return;
        const rect = layer.getBoundingClientRect(), cx = rect.width / 2, cy = rect.height / 2;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const base = -Math.PI / 2, spread = Math.PI * .9;
            const theta = base + (Math.random() - .5) * spread;
            const power = 170 + Math.random() * 220;
            const dx = Math.cos(theta) * power, dy = Math.sin(theta) * power;
            const angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;
            const wrap = document.createElement("div");
            wrap.className = "flame-coin";
            wrap.style.left = cx - 8 + "px"; wrap.style.top = cy - 8 + "px";
            wrap.style.setProperty("--x", dx + "px"); wrap.style.setProperty("--y", dy + "px");
            wrap.style.setProperty("--angle", angleDeg + "deg");
            wrap.style.transformOrigin = "center";
            wrap.style.animationDuration = `${900 + Math.random() * 520}ms`;
            wrap.style.filter = `blur(${Math.random() * .6}px)`;
            const flame = document.createElement("div"); flame.className = "flame";
            const coin = document.createElement("div"); coin.className = "coin";
            wrap.appendChild(flame); wrap.appendChild(coin);
            if (trails) { const trail = document.createElement("div"); trail.className = "coin-trail"; trail.style.setProperty("--angle", angleDeg + "deg"); trail.style.animationDuration = `${700 + Math.random() * 420}ms`; wrap.appendChild(trail); }
            frag.appendChild(wrap);
            if (embers) {
                const emberCount = 2 + Math.floor(Math.random() * 3);
                for (let e = 0; e < emberCount; e++) {
                    const sp = document.createElement("div"); sp.className = "spark"; sp.style.left = cx + "px"; sp.style.top = cy + "px";
                    const jitter = 60 + Math.random() * 110;
                    const ex = Math.cos(theta + (Math.random() * .25 - .125)) * jitter;
                    const ey = Math.sin(theta + (Math.random() * .25 - .125)) * jitter;
                    sp.style.setProperty("--sx", ex + "px"); sp.style.setProperty("--sy", ey + "px");
                    sp.style.animationDuration = `${520 + Math.random() * 480}ms`;
                    frag.appendChild(sp);
                    const t2 = setTimeout(() => sp.remove(), 1100); fx.add(t2);
                }
            }
            const t1 = setTimeout(() => wrap.remove(), 1600); fx.add(t1);
        }
        layer.appendChild(frag);
    }

    function buildWheelSVG(mount) {
        if (!mount) return;
        mount.innerHTML = "";                       // avoid duplicates on remount
        const size = 1000, r = size / 2, svgNS = "http://www.w3.org/2000/svg";
        const segAngle = (2 * Math.PI) / SEGMENTS.length;
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        const defs = document.createElementNS(svgNS, "defs");
        defs.innerHTML = `
      <radialGradient id="bg-grad" cx="50%" cy="50%" r="75%">
        <stop offset="0%"  stop-color="#7a0004"/>
        <stop offset="55%" stop-color="#3f0002"/>
        <stop offset="100%" stop-color="#1a0001"/>
      </radialGradient>
      <linearGradient id="rim-metal" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#fff6c4"/><stop offset="32%" stop-color="#ffd659"/>
        <stop offset="68%" stop-color="#ffb200"/><stop offset="100%" stop-color="#b87700"/>
      </linearGradient>
      <radialGradient id="center-jewel" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#fff6cf"/><stop offset="42%" stop-color="#ffd659"/><stop offset="100%" stop-color="#b87700"/>
      </radialGradient>
      <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feOffset dx="0" dy="2"/><feGaussianBlur stdDeviation="3" result="shadow"/>
        <feComposite in="shadow" in2="SourceAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .5 0"/>
        <feBlend in="SourceGraphic" mode="normal"/>
      </filter>
    `;
        svg.appendChild(defs);

        const disk = document.createElementNS(svgNS, "circle");
        disk.setAttribute("cx", r); disk.setAttribute("cy", r); disk.setAttribute("r", r - 18);
        disk.setAttribute("fill", "url(#bg-grad)"); disk.setAttribute("filter", "url(#innerShadow)");
        svg.appendChild(disk);

        const PALETTE = [["#b81507", "#b81507"], ["#ff9c00", "#ff9c00"]];

        const measureWidth = (text, fontSize = 26) => {
            const t = document.createElementNS(svgNS, "text");
            t.setAttribute("visibility", "hidden");
            t.setAttribute("font-size", fontSize);
            t.setAttribute("font-family", "Arial, sans-serif");
            t.setAttribute("font-weight", "900");
            t.textContent = text;
            svg.appendChild(t);
            const w = t.getBBox().width;
            t.remove();
            return w;
        };
        const smartSplit = (label) => {
            if (label.includes("+")) {
                const [a, b] = label.split("+");
                return [a.trim(), `+ ${b.trim()}`];
            }
            const words = label.split(" ");
            if (words.length < 2) return [label];
            const mid = Math.round(words.length / 2);
            return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
        };
        const addCurvedLabel = (segIndex, label, midAngleRad, baseFont = 36, grand = false) => {
            const arcRadius1 = r - 140, arcRadius2 = r - 112;
            const spread = segAngle * .78;
            const arcLen1 = arcRadius1 * spread;
            let useLines = [label];
            if (measureWidth(label, baseFont) > arcLen1) useLines = smartSplit(label);
            let font = baseFont;
            const maxArc = Math.max(arcLen1, arcRadius2 * spread);
            const widest = Math.max(...useLines.map(l => measureWidth(l, font)));
            if (widest > maxArc) { const scale = Math.max(.7, maxArc / widest); font = Math.max(20, Math.floor(font * scale)); }

            const makeArc = (idx, radius) => {
                const start = midAngleRad - spread / 2, end = start + spread;
                const ax1 = r + radius * Math.cos(start), ay1 = r + radius * Math.sin(start);
                const ax2 = r + radius * Math.cos(end), ay2 = r + radius * Math.sin(end);
                const id = `arc-${segIndex}-${idx}`;
                const p = document.createElementNS(svgNS, "path");
                p.setAttribute("id", id); p.setAttribute("fill", "none");
                p.setAttribute("d", `M ${ax1} ${ay1} A ${radius} ${radius} 0 0 1 ${ax2} ${ay2}`);
                defs.appendChild(p); return id;
            };
            const ids = [];
            if (useLines.length === 1) ids.push(makeArc(0, arcRadius1));
            else { ids.push(makeArc(0, arcRadius1)); ids.push(makeArc(1, arcRadius2)); }

            useLines.forEach((val, i) => {
                const t = document.createElementNS(svgNS, "text");
                t.setAttribute("class", grand ? "seg-label grand-text" : "seg-label");
                t.setAttribute("font-size", font);
                const tp = document.createElementNS(svgNS, "textPath");
                tp.setAttribute("href", `#${ids[i] || ids[0]}`); tp.setAttribute("startOffset", "50%"); tp.setAttribute("text-anchor", "middle");
                tp.textContent = val; t.appendChild(tp); svg.appendChild(t);
            });
        };

        for (let i = 0; i < SEGMENTS.length; i++) {
            const start = i * segAngle - Math.PI / 2;
            const end = start + segAngle;
            const x1 = r + (r - 30) * Math.cos(start), y1 = r + (r - 30) * Math.sin(start);
            const x2 = r + (r - 30) * Math.cos(end), y2 = r + (r - 30) * Math.sin(end);
            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", `M ${r} ${r} L ${x1} ${y1} A ${r - 30} ${r - 30} 0 0 1 ${x2} ${y2} Z`);
            const seg = SEGMENTS[i];

            if (seg.grand) {
                const gradId = `grand-grad-${i}`;
                const grad = document.createElementNS(svgNS, "linearGradient");
                grad.setAttribute("id", gradId); grad.setAttribute("x1", "0%"); grad.setAttribute("y1", "0%"); grad.setAttribute("x2", "100%"); grad.setAttribute("y2", "100%");
                grad.innerHTML = `<stop offset="0%" stop-color="#fff6a3"/><stop offset="40%" stop-color="#ffd24a"/><stop offset="100%" stop-color="#c48300"/>`;
                defs.appendChild(grad);
                path.setAttribute("fill", `url(#${gradId})`);
                path.setAttribute("class", "grand-seg");
            } else {
                const [c1, c2] = PALETTE[i % PALETTE.length];
                const gradId = `seg-grad-${i}`;
                const grad = document.createElementNS(svgNS, "linearGradient");
                grad.setAttribute("id", gradId); grad.setAttribute("x1", "0%"); grad.setAttribute("y1", "0%"); grad.setAttribute("x2", "100%"); grad.setAttribute("y2", "100%");
                grad.innerHTML = `<stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>`;
                defs.appendChild(grad);
                path.setAttribute("fill", `url(#${gradId})`);
            }
            path.setAttribute("stroke", "#5a0000"); path.setAttribute("stroke-width", "4"); path.setAttribute("filter", "url(#softGlow)");
            svg.appendChild(path);

            const mid = start + segAngle / 2;
            addCurvedLabel(i, seg.label, mid, seg.grand ? 40 : 36, !!seg.grand);
        }

        const rim = document.createElementNS(svgNS, "circle");
        rim.setAttribute("cx", r); rim.setAttribute("cy", r); rim.setAttribute("r", r - 12);
        rim.setAttribute("fill", "transparent"); rim.setAttribute("stroke", "url(#rim-metal)"); rim.setAttribute("stroke-width", "18"); rim.setAttribute("filter", "url(#softGlow)");
        svg.appendChild(rim);

        const cap = document.createElementNS(svgNS, "circle");
        cap.setAttribute("cx", r); cap.setAttribute("cy", r); cap.setAttribute("r", 84);
        cap.setAttribute("fill", "url(#center-jewel)"); cap.setAttribute("filter", "url(#softGlow)");
        svg.appendChild(cap);

        mount.appendChild(svg);
    }

    function injectHeatFilter() {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("aria-hidden", "true");
        svg.style.position = "absolute"; svg.style.width = 0; svg.style.height = 0;
        svg.innerHTML = `<filter id="heatDistort"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.08" numOctaves="2" seed="2"/><feDisplacementMap in="SourceGraphic" scale="12" xChannelSelector="R" yChannelSelector="G"/></filter>`;
        document.body.appendChild(svg);
    }

    function todayStr() {
        try {
            const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" });
            return fmt.format(new Date());
        } catch {
            const d = new Date(), mm = String(d.getMonth() + 1).padStart(2, "0"), dd = String(d.getDate()).padStart(2, "0");
            return `${d.getFullYear()}-${mm}-${dd}`;
        }
    }

    return (
        <div ref={wrapRef} className="wheel-wrap">
            <div className="wheel-bg" aria-hidden="true">
                <div className="bg-aura"></div>
                <div className="bg-aurora"></div>
                <div className="bg-stars"></div>
                <div className="bg-spot"></div>
            </div>

            <div id="flameRing" className="flame-ring" aria-hidden="true"></div>
            <div className="wheel-pointer" aria-hidden="true"></div>

            <div ref={wheelRef} id="wheel-svg" className="wheel" aria-live="polite" />
            <button ref={spinBtnRef} className="btn btn-primary wheel-btn">Spin Now</button>
            <a ref={claimBtnRef} id="claimBtn" className="btn btn-claim" href={PROMO_URL} hidden aria-live="polite">Claim Your Bonus</a>

            <div ref={confettiRef} id="confettiLayer" aria-hidden="true"></div>
            <div ref={coinRef} id="coinLayer" aria-hidden="true"></div>
            <div ref={fireworkRef} id="fireworkLayer" aria-hidden="true"></div>
        </div>
    );
}
