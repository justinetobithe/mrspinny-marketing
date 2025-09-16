import { useEffect, useRef, useState } from "react";

const SEGMENTS = [
    { label: "200% Bonus + 100 Free Spins", key: "grand", grand: true, weight: 1 },
    { label: "100 Free Spins", value: 100, weight: 2 },
    { label: "75 Free Spins", value: 75, weight: 5 },
    { label: "50 Free Spins", value: 50, weight: 12 },
    { label: "25 Free Spins", value: 25, weight: 20 },
    { label: "10 Free Spins", value: 10, weight: 28 }
];

const PROMO_URL = "https://mrspinny.com/promotions";
const REWARD_KEY = "mrspinny_wheel_reward";

export default function Wheel() {
    const wrapRef = useRef(null);
    const wheelRef = useRef(null);
    const svgMountRef = useRef(null);
    const spinBtnRef = useRef(null);
    const claimBtnRef = useRef(null);
    const coinLayerRef = useRef(null);
    const fwLayerRef = useRef(null);
    const pageFXRef = useRef(null);
    const spinSndRef = useRef(null);
    const winSndRef = useRef(null);
    const timersRef = useRef(new Set());
    const isSpinningRef = useRef(false);
    const [ready, setReady] = useState(false);

    const addTimer = (id) => { timersRef.current.add(id); };
    const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current.clear(); };

    const reduceMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const todayStr = () => {
        try {
            const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" });
            return fmt.format(new Date());
        } catch {
            const d = new Date(); const mm = String(d.getMonth() + 1).padStart(2, "0"); const dd = String(d.getDate()).padStart(2, "0");
            return `${d.getFullYear()}-${mm}-${dd}`;
        }
    };
    const pickSegment = (segments = SEGMENTS) => {
        const total = segments.reduce((s, seg) => s + seg.weight, 0);
        let r = Math.random() * total;
        for (const seg of segments) { if ((r -= seg.weight) <= 0) return seg; }
        return segments[segments.length - 1];
    };

    const setupSounds = () => {
        try {
            spinSndRef.current = new Audio("/assets/sounds/wheel-spin.mp3");
            spinSndRef.current.preload = "auto";
            spinSndRef.current.volume = 0.9;
            spinSndRef.current.loop = false;
            winSndRef.current = new Audio("/assets/sounds/magical-coin-win.wav");
            winSndRef.current.preload = "auto";
            winSndRef.current.volume = 1.0;
            winSndRef.current.loop = false;
        } catch { }
    };
    const playSpinSound = () => { const a = spinSndRef.current; if (!a) return; try { a.currentTime = 0; a.play().catch(() => { }); } catch { } };
    const stopSpinSound = () => { const a = spinSndRef.current; if (!a) return; try { a.pause(); a.currentTime = 0; } catch { } };
    const playWinSound = () => { const a = winSndRef.current; if (!a) return; try { a.currentTime = 0; a.play().catch(() => { }); } catch { } };

    const currentAngle = (el) => {
        const st = getComputedStyle(el).transform;
        if (st && st !== "none") {
            const m = st.match(/matrix\(([-0-9.,\s]+)\)/);
            if (m) {
                const p = m[1].split(",").map(v => parseFloat(v.trim()));
                const a = Math.atan2(p[1], p[0]) * (180 / Math.PI);
                return (a + 360) % 360;
            }
        }
        const v = el.style.getPropertyValue("--final");
        if (v && v.endsWith("deg")) return (parseFloat(v) + 360) % 360;
        return 0;
    };

    const injectHeatFilter = () => {
        if (document.getElementById("heatDistort")) return;
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("aria-hidden", "true");
        svg.style.position = "absolute";
        svg.style.width = 0;
        svg.style.height = 0;
        svg.innerHTML = '<filter id="heatDistort"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.08" numOctaves="2" seed="2"/><feDisplacementMap in="SourceGraphic" scale="12" xChannelSelector="R" yChannelSelector="G"/></filter>';
        document.body.appendChild(svg);
    };

    const injectHeatStyles = () => {
        if (document.getElementById("flameStyles")) return;
        const s = document.createElement("style");
        s.id = "flameStyles";
        s.textContent = '#wheelWrap{position:relative}#flameRing{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:4;filter:drop-shadow(0 0 10px rgba(255,140,0,.35))}#flameRing .flame-jet{position:absolute;left:50%;top:25%;transform:rotate(var(--a)) translate(var(--d)) translate(-50%,-50%);border-radius:999px;background:radial-gradient(closest-side,rgba(255,220,150,.95),rgba(255,105,40,.82) 60%,rgba(150,15,0,.65) 92%,rgba(150,15,0,0) 100%);mix-blend-mode:screen;filter:url(#heatDistort) blur(.2px) drop-shadow(0 0 6px rgba(255,120,0,.5));animation:flameFlicker 240ms infinite alternate}#flameRing.heatwave{filter:url(#heatDistort) drop-shadow(0 0 10px rgba(255,160,0,.4))}@keyframes flameFlicker{from{transform:rotate(var(--a)) translate(var(--d)) translate(-50%,-50%) scale(1);opacity:.96}to{transform:rotate(var(--a)) translate(calc(var(--d) + 2%)) translate(-50%,-50%) scale(1.06);opacity:1}}';
        document.head.appendChild(s);
    };

    const ensureFlameRing = () => {
        const wrap = wrapRef.current;
        if (!wrap) return null;
        let ring = document.getElementById("flameRing");
        if (!ring) {
            ring = document.createElement("div");
            ring.id = "flameRing";
            const pointer = wrap.querySelector(".wheel-pointer");
            if (pointer) wrap.insertBefore(ring, pointer); else wrap.appendChild(ring);
        }
        return ring;
    };

    const sizeAndCenterFlameRing = () => {
        const ring = ensureFlameRing(); const wheel = wheelRef.current;
        if (!ring || !wheel) return;
        const w = wheel.getBoundingClientRect().width || wheel.offsetWidth || 600;
        const scale = 1.12;
        ring.style.left = "50%";
        ring.style.top = "50%";
        ring.style.transform = "translate(-50%,-50%)";
        ring.style.width = `${w * scale}px`;
        ring.style.height = `${w * scale}px`;
    };

    const centerOf = (el, relativeTo) => {
        const a = el.getBoundingClientRect(); const b = relativeTo.getBoundingClientRect();
        return { x: a.left + a.width / 2 - b.left, y: a.top + a.height / 2 - b.top };
    };

    const igniteFlameRing = (duration = 2800, jets = 40) => {
        const ring = ensureFlameRing(); if (!ring) return;
        ring.innerHTML = "";
        const frag = document.createDocumentFragment();
        for (let i = 0; i < jets; i++) {
            const jet = document.createElement("div");
            jet.className = "flame-jet";
            jet.style.setProperty("--a", (i / jets) * 360 + "deg");
            jet.style.setProperty("--d", 58 + Math.random() * 6 + "%");
            jet.style.height = 130 + Math.random() * 70 + "px";
            jet.style.width = 22 + Math.random() * 12 + "px";
            jet.style.animationDelay = Math.random() * 160 + "ms";
            frag.appendChild(jet);
        }
        ring.appendChild(frag);
        const tid = setTimeout(() => { ring.innerHTML = ""; }, duration); addTimer(tid);
    };

    const heatWave = (duration = 1800) => {
        const ring = document.getElementById("flameRing"); if (!ring) return;
        ring.classList.add("heatwave");
        const tid = setTimeout(() => ring.classList.remove("heatwave"), duration);
        addTimer(tid);
    };

    const shockwave = (count = 1) => {
        const container = coinLayerRef.current || fwLayerRef.current || pageFXRef.current;
        const n = Math.max(1, count);
        for (let i = 0; i < n; i++) {
            const sw = document.createElement("div");
            sw.className = "shockwave";
            sw.style.left = "50%";
            sw.style.top = "50%";
            sw.style.animationDelay = `${i * 120}ms`;
            container.appendChild(sw);
            const tid = setTimeout(() => sw.remove(), 1200 + i * 120);
            addTimer(tid);
        }
    };

    const screenShake = (intensity = 8, duration = 450) => {
        const el = wrapRef.current; if (!el) return;
        el.style.setProperty("--shake-intensity", intensity + "px");
        el.classList.add("do-shake");
        const tid = setTimeout(() => el.classList.remove("do-shake"), duration + 60);
        addTimer(tid);
    };

    const burstFireworks = () => {
        const layer = fwLayerRef.current; const wheel = wheelRef.current;
        if (!layer || !wheel) return;
        const { x: cx, y: cy } = centerOf(wheel, layer);
        const COLORS = ["#ffd54a", "#f59e0b", "#ffcc33", "#b71c1c", "#8e0e0e", "#fff1a8"];
        const totalBursts = reduceMotion() ? 3 : 5;
        const frag = document.createDocumentFragment();
        for (let b = 0; b < totalBursts; b++) {
            const particles = 34 + Math.floor(Math.random() * 10);
            const spread = 170 + Math.random() * 70;
            for (let i = 0; i < particles; i++) {
                const theta = (i / particles) * Math.PI * 2 + Math.random() * 0.12;
                const dist = spread + Math.random() * 60;
                const x = Math.cos(theta) * dist; const y = Math.sin(theta) * dist;
                const fw = document.createElement("div"); fw.className = "fw";
                fw.style.left = cx + "px"; fw.style.top = cy + "px";
                fw.style.setProperty("--x", `${x}px`); fw.style.setProperty("--y", `${y}px`);
                fw.style.setProperty("--c", COLORS[(i + b) % COLORS.length]);
                fw.style.animationDelay = `${b * 120}ms`;
                frag.appendChild(fw);
                const tid = setTimeout(() => fw.remove(), 1800 + b * 120); addTimer(tid);
            }
        }
        layer.appendChild(frag);
    };

    const fireworkBurstAt = (container, cx, cy, radius = 260, particles = 46, delay = 0) => {
        const frag = document.createDocumentFragment();
        for (let i = 0; i < particles; i++) {
            const theta = (i / particles) * Math.PI * 2 + Math.random() * 0.1;
            const dist = radius + Math.random() * 80;
            const x = Math.cos(theta) * dist; const y = Math.sin(theta) * dist;
            const el = document.createElement("div");
            el.className = "fw"; el.style.left = cx + "px"; el.style.top = cy + "px";
            el.style.setProperty("--x", x + "px"); el.style.setProperty("--y", y + "px");
            el.style.setProperty("--c", ["#ffd54a", "#f59e0b", "#ffcc33", "#b71c1c", "#8e0e0e", "#fff1a8"][Math.floor(Math.random() * 6)]);
            el.style.animationDelay = delay + "ms";
            frag.appendChild(el);
            const tid = setTimeout(() => el.remove(), 1800 + delay); addTimer(tid);
        }
        container.appendChild(frag);
    };

    const burstFireworksFullScreen = () => {
        const W = window.innerWidth; const H = window.innerHeight;
        const page = pageFXRef.current; if (!page) return;
        page.innerHTML = "";
        if (reduceMotion()) return;
        const centers = [[W * 0.2, H * 0.35], [W * 0.5, H * 0.25], [W * 0.8, H * 0.42], [W * 0.3, H * 0.72], [W * 0.7, H * 0.76]];
        centers.forEach((c, idx) => { const [cx, cy] = c; const delay = idx * 160; fireworkBurstAt(page, cx, cy, 280 + Math.random() * 90, 48 + Math.floor(Math.random() * 12), delay); });
        const tid = setTimeout(() => { page.innerHTML = ""; }, 3600); addTimer(tid);
    };

    const burstFlamingCoins = ({ count = 80, embers = true, trails = true } = {}) => {
        const layer = coinLayerRef.current; const wheel = wheelRef.current;
        if (!layer || !wheel) return;
        const { x: cx, y: cy } = centerOf(wheel, layer);
        const frag = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const base = -Math.PI / 2; const spread = Math.PI * 0.9;
            const theta = base + (Math.random() - 0.5) * spread;
            const power = 170 + Math.random() * 220;
            const dx = Math.cos(theta) * power; const dy = Math.sin(theta) * power;
            const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
            const wrap = document.createElement("div");
            wrap.className = "flame-coin"; wrap.style.left = cx - 8 + "px"; wrap.style.top = cy - 8 + "px";
            wrap.style.setProperty("--x", dx + "px"); wrap.style.setProperty("--y", dy + "px"); wrap.style.setProperty("--angle", angleDeg + "deg");
            wrap.style.transformOrigin = "center";
            const flame = document.createElement("div"); flame.className = "flame";
            const coin = document.createElement("div"); coin.className = "coin";
            wrap.appendChild(flame); wrap.appendChild(coin);
            if (trails) { const trail = document.createElement("div"); trail.className = "coin-trail"; trail.style.setProperty("--angle", angleDeg + "deg"); wrap.appendChild(trail); }
            frag.appendChild(wrap);
            if (embers) {
                const emberCount = 2 + Math.floor(Math.random() * 3);
                for (let e = 0; e < emberCount; e++) {
                    const sp = document.createElement("div"); sp.className = "spark"; sp.style.left = cx + "px"; sp.style.top = cy + "px";
                    const jitter = 60 + Math.random() * 110;
                    const ex = Math.cos(theta + (Math.random() * 0.25 - 0.125)) * jitter;
                    const ey = Math.sin(theta + (Math.random() * 0.25 - 0.125)) * jitter;
                    sp.style.setProperty("--sx", ex + "px"); sp.style.setProperty("--sy", ey + "px");
                    frag.appendChild(sp);
                    const t2 = setTimeout(() => sp.remove(), 1100); addTimer(t2);
                }
            }
            const t1 = setTimeout(() => wrap.remove(), 1600); addTimer(t1);
        }
        layer.appendChild(frag);
    };

    const startCelebrationWindow = (ms = 2600) => { endCelebration(); const id = setTimeout(endCelebration, ms); addTimer(id); };
    const endCelebration = () => {
        clearTimers();
        try {
            if (coinLayerRef.current) coinLayerRef.current.innerHTML = "";
            if (fwLayerRef.current) fwLayerRef.current.innerHTML = "";
            if (pageFXRef.current) pageFXRef.current.innerHTML = "";
            const ring = document.getElementById("flameRing");
            if (ring) { ring.classList.remove("heatwave"); ring.innerHTML = ""; }
        } catch { }
        document.querySelectorAll(".flame-coin,.coin,.spark,.fw,.sparkler,.sparkler-xl,.fw-xl,.shockwave").forEach(n => n.remove());
        wrapRef.current?.classList.remove("do-shake", "spinning");
        wheelRef.current?.classList.remove("is-spinning", "hit");
        stopSpinSound();
    };

    const buildWheelSVG = () => {
        const mount = svgMountRef.current; if (!mount) return;
        mount.innerHTML = "";
        const size = 1000; const r = size / 2; const svgNS = "http://www.w3.org/2000/svg"; const segAngle = (2 * Math.PI) / SEGMENTS.length;
        const svg = document.createElementNS(svgNS, "svg"); svg.setAttribute("viewBox", `0 0 ${size} ${size}`); svg.setAttribute("width", "100%"); svg.setAttribute("height", "100%");
        const defs = document.createElementNS(svgNS, "defs");
        defs.innerHTML =
            '<radialGradient id="bg-grad" cx="50%" cy="50%" r="75%"><stop offset="0%" stop-color="#7a0004"/><stop offset="55%" stop-color="#3f0002"/><stop offset="100%" stop-color="#1a0001"/></radialGradient>' +
            '<linearGradient id="rim-metal" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#fff6c4"/><stop offset="32%" stop-color="#ffd659"/><stop offset="68%" stop-color="#ffb200"/><stop offset="100%" stop-color="#b87700"/></linearGradient>' +
            '<radialGradient id="center-jewel" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#fff6cf"/><stop offset="42%" stop-color="#ffd659"/><stop offset="100%" stop-color="#b87700"/></radialGradient>' +
            '<radialGradient id="gemGrad" cx="50%" cy="50%" r="65%"><stop offset="0%" stop-color="#fff7cf"/><stop offset="55%" stop-color="#ffd659"/><stop offset="100%" stop-color="#b87700"/></radialGradient>' +
            '<filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
            '<filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%"><feOffset dx="0" dy="2"/><feGaussianBlur stdDeviation="3" result="shadow"/><feComposite in="shadow" in2="SourceAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .5 0"/><feBlend in="SourceGraphic" mode="normal"/></filter>';
        svg.appendChild(defs);

        const disk = document.createElementNS(svgNS, "circle"); disk.setAttribute("cx", r); disk.setAttribute("cy", r); disk.setAttribute("r", r - 18); disk.setAttribute("fill", "url(#bg-grad)"); disk.setAttribute("filter", "url(#innerShadow)"); svg.appendChild(disk);

        const PALETTE = [["#b81507", "#b81507"], ["#ff9c00", "#ff9c00"]];
        const measureWidth = (text, fontSize = 26) => {
            const t = document.createElementNS(svgNS, "text"); t.setAttribute("visibility", "hidden"); t.setAttribute("font-size", fontSize);
            t.setAttribute("font-family", "Arial, sans-serif"); t.setAttribute("font-weight", "900"); t.textContent = text; svg.appendChild(t);
            const w = t.getBBox().width; t.remove(); return w;
        };
        const MIN_FONT = 18;
        const wrapToLines = (label, font, arcLen, maxLines = 3) => {
            if (label.includes("+")) {
                const [a, b] = label.split("+"); const lines = [a.trim(), ("+ " + b.trim())].filter(Boolean);
                if (Math.max(...lines.map(l => measureWidth(l, font))) <= arcLen) return lines;
            }
            const words = label.split(/\s+/); const lines = [""];
            const forceBreakLongWord = (word) => {
                let w = word;
                while (w && lines.length < maxLines) {
                    let lo = 1, hi = w.length, cut = 1;
                    while (lo <= hi) {
                        const mid = Math.max(1, Math.floor((lo + hi) / 2));
                        const candidate = ((lines.at(-1) ? lines.at(-1) + " " : "") + w.slice(0, mid) + "-").trim();
                        if (measureWidth(candidate, font) <= arcLen) { cut = mid; lo = mid + 1; } else { hi = mid - 1; }
                    }
                    const head = w.slice(0, cut) + (w.length > cut ? "-" : "");
                    lines[lines.length - 1] = ((lines.at(-1) + " " + head).trim());
                    w = w.slice(cut);
                    if (w && lines.length < maxLines) lines.push("");
                }
                if (w) lines[lines.length - 1] = ((lines.at(-1) + " " + w).trim());
            };
            for (const wd of words) {
                const candidate = ((lines.at(-1) ? lines.at(-1) + " " : "") + wd).trim();
                if (measureWidth(candidate, font) <= arcLen || !lines.at(-1)) lines[lines.length - 1] = candidate;
                else if (lines.length < maxLines) lines.push(wd);
                else forceBreakLongWord(wd);
            }
            return lines.filter(Boolean).slice(0, maxLines);
        };
        const addCurvedLabel = (segIndex, label, midAngleRad, baseFont = 36, grand = false) => {
            const wheelPx = wrapRef.current?.getBoundingClientRect?.().width || 520;
            let font = Math.max(MIN_FONT, Math.round(baseFont * Math.min(1, wheelPx / 520)));
            const spread = segAngle * 0.74;
            const arcLen = (r - 156) * spread;
            let lines = wrapToLines(label, font, arcLen, grand ? 3 : 2);
            const fits = () => Math.max(...lines.map(l => measureWidth(l, font))) <= arcLen;
            while (!fits() && font > MIN_FONT) font -= 1;
            const gap = Math.max(Math.round(font * 1.12), 22);
            const baseRadius = r - 148;
            const n = lines.length;
            const startOffset = -((n - 1) * gap) / 2;
            const radii = Array.from({ length: n }, (_, i) => baseRadius + startOffset + i * gap);
            const ids = lines.map((_, i) => {
                const radius = radii[i]; const start = midAngleRad - spread / 2; const end = start + spread;
                const ax1 = r + radius * Math.cos(start); const ay1 = r + radius * Math.sin(start);
                const ax2 = r + radius * Math.cos(end); const ay2 = r + radius * Math.sin(end);
                const id = `arc-${segIndex}-${i}`;
                const p = document.createElementNS(svgNS, "path"); p.setAttribute("id", id); p.setAttribute("fill", "none");
                p.setAttribute("d", `M ${ax1} ${ay1} A ${radius} ${radius} 0 0 1 ${ax2} ${ay2}`); defs.appendChild(p); return id;
            });
            lines.forEach((textValue, i) => {
                const t = document.createElementNS(svgNS, "text"); t.setAttribute("class", grand ? "seg-label grand-text" : "seg-label"); t.setAttribute("font-size", font);
                t.style.letterSpacing = (wheelPx < 520 ? "0.4px" : "0.6px");
                const tp = document.createElementNS(svgNS, "textPath"); tp.setAttribute("href", `#${ids[i]}`); tp.setAttribute("startOffset", "50%"); tp.setAttribute("text-anchor", "middle"); tp.textContent = textValue;
                t.appendChild(tp); svg.appendChild(t);
            });
        };

        for (let i = 0; i < SEGMENTS.length; i++) {
            const start = i * segAngle - Math.PI / 2; const end = start + segAngle;
            const x1 = r + (r - 30) * Math.cos(start); const y1 = r + (r - 30) * Math.sin(start);
            const x2 = r + (r - 30) * Math.cos(end); const y2 = r + (r - 30) * Math.sin(end);
            const path = document.createElementNS(svgNS, "path"); path.setAttribute("d", `M ${r} ${r} L ${x1} ${y1} A ${r - 30} ${r - 30} 0 0 1 ${x2} ${y2} Z`);
            const seg = SEGMENTS[i];
            if (seg.grand) {
                const gradId = `grand-grad-${i}`; const grad = document.createElementNS(svgNS, "linearGradient");
                grad.setAttribute("id", gradId); grad.setAttribute("x1", "0%"); grad.setAttribute("y1", "0%"); grad.setAttribute("x2", "100%"); grad.setAttribute("y2", "100%");
                grad.innerHTML = '<stop offset="0%" stop-color="#fff6a3"/><stop offset="40%" stop-color="#ffd24a"/><stop offset="100%" stop-color="#c48300"/>';
                defs.appendChild(grad); path.setAttribute("fill", `url(#${gradId})`); path.setAttribute("class", "grand-seg");
            } else {
                const [c1, c2] = [["#b81507", "#b81507"], ["#ff9c00", "#ff9c00"]][i % 2];
                const gradId = `seg-grad-${i}`; const grad = document.createElementNS(svgNS, "linearGradient");
                grad.setAttribute("id", gradId); grad.setAttribute("x1", "0%"); grad.setAttribute("y1", "0%"); grad.setAttribute("x2", "100%"); grad.setAttribute("y2", "100%");
                grad.innerHTML = `<stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>`;
                defs.appendChild(grad); path.setAttribute("fill", `url(#${gradId})`);
            }
            path.setAttribute("stroke", "#5a0000"); path.setAttribute("stroke-width", "4"); path.setAttribute("filter", "url(#softGlow)"); svg.appendChild(path);
            const mid = start + segAngle / 2; addCurvedLabel(i, seg.label, mid, seg.grand ? 40 : 36, !!seg.grand);
        }

        const rim = document.createElementNS(svgNS, "circle"); rim.setAttribute("cx", r); rim.setAttribute("cy", r); rim.setAttribute("r", r - 12);
        rim.setAttribute("fill", "transparent"); rim.setAttribute("stroke", "url(#rim-metal)"); rim.setAttribute("stroke-width", "18"); rim.setAttribute("filter", "url(#softGlow)"); svg.appendChild(rim);

        const studs = 36; const rr = r - 12 - 8;
        for (let i = 0; i < studs; i++) {
            const a = (i / studs) * Math.PI * 2; const cx = r + rr * Math.cos(a); const cy = r + rr * Math.sin(a);
            const dot = document.createElementNS(svgNS, "circle"); dot.setAttribute("class", "gem"); dot.setAttribute("cx", cx); dot.setAttribute("cy", cy);
            dot.setAttribute("r", 9); dot.setAttribute("fill", "url(#gemGrad)"); dot.setAttribute("stroke", "rgba(120,0,0,.65)"); dot.setAttribute("stroke-width", "1.5"); svg.appendChild(dot);
        }

        const cap = document.createElementNS(svgNS, "circle"); cap.setAttribute("cx", r); cap.setAttribute("cy", r); cap.setAttribute("r", 84); cap.setAttribute("fill", "url(#center-jewel)"); cap.setAttribute("filter", "url(#softGlow)"); svg.appendChild(cap);

        mount.appendChild(svg);
    };

    const endSpinSettle = (finalDeg) => {
        const el = wheelRef.current;
        const current = finalDeg % 360;
        el.style.transition = "none";
        el.style.transform = `rotate(${current}deg) translateZ(0)`;
        el.style.setProperty("--final", `${current}deg`);
        void el.offsetHeight;
        el.style.transition = "";
        el.classList.add("hit");
        const tHit = setTimeout(() => el.classList.remove("hit"), 800); addTimer(tHit);
    };

    const onSpinEnd = (finalDeg, chosen) => {
        try { localStorage.setItem(REWARD_KEY, JSON.stringify({ label: chosen.label, value: chosen.value ?? null, date: todayStr() })); } catch { }
        wrapRef.current.classList.remove("spinning");
        wheelRef.current.classList.remove("is-spinning");
        startCelebrationWindow(reduceMotion() ? 1600 : 2600);
        screenShake(10, 500);
        igniteFlameRing(reduceMotion() ? 1600 : 2600, 32);
        heatWave(reduceMotion() ? 1200 : 2000);
        shockwave(2);
        burstFlamingCoins({ count: reduceMotion() ? 24 : 70, embers: true, trails: true });
        burstFireworks();
        burstFireworksFullScreen();
        stopSpinSound();
        playWinSound();
        endSpinSettle(finalDeg);
        const chosenParam = chosen.value ? `${chosen.value}FS` : encodeURIComponent(chosen.label);
        if (claimBtnRef.current) {
            claimBtnRef.current.href = `${PROMO_URL}?reward=${chosenParam}`;
            claimBtnRef.current.hidden = false;
            const t = setTimeout(() => claimBtnRef.current.classList.add("show"), 200);
            addTimer(t);
        }
    };

    const handleSpin = async () => {
        if (isSpinningRef.current) return;
        const el = wheelRef.current; const wrap = wrapRef.current; const btn = spinBtnRef.current;
        if (!el || !wrap || !btn) return;
        endCelebration();
        isSpinningRef.current = true;
        btn.disabled = true;
        btn.classList.add("is-hidden");
        if (claimBtnRef.current) { claimBtnRef.current.hidden = true; claimBtnRef.current.classList.remove("show"); }
        wrap.classList.add("spinning");
        el.classList.add("is-spinning");
        playSpinSound();

        const chosen = pickSegment();
        const segmentCount = SEGMENTS.length;
        const index = SEGMENTS.findIndex(s => s.label === chosen.label);
        const segmentAngle = 360 / segmentCount;
        const baseTurns = reduceMotion() ? 4 : 8;
        const offset = segmentAngle * index + segmentAngle / 2;
        const jitter = rand(-3, 3);
        const from = currentAngle(el);
        const to = from + baseTurns * 360 + (360 - offset) + jitter;

        el.style.transition = "none";
        el.style.willChange = "transform";
        el.style.transform = `rotate(${from}deg) translateZ(0)`;
        void el.offsetHeight;
        const dur = reduceMotion() ? 3600 : 5600;
        el.style.transition = `transform ${dur}ms cubic-bezier(0.08, 0.72, 0.0, 1)`;
        requestAnimationFrame(() => { el.style.transform = `rotate(${to}deg) translateZ(0)`; });

        const onEnd = () => {
            el.removeEventListener("transitionend", onEnd);
            el.style.willChange = "";
            isSpinningRef.current = false;
            onSpinEnd(to, chosen);
        };
        el.addEventListener("transitionend", onEnd, { once: true });
    };

    useEffect(() => {
        setupSounds();
        injectHeatFilter();
        injectHeatStyles();
        buildWheelSVG();
        sizeAndCenterFlameRing();
        const ro = new ResizeObserver(() => sizeAndCenterFlameRing());
        if (wrapRef.current) ro.observe(wrapRef.current);
        setReady(true);
        return () => {
            ro.disconnect();
            clearTimers();
            try { const a = spinSndRef.current; if (a) { a.pause(); a.src = ""; } } catch { }
            try { const a = winSndRef.current; if (a) { a.pause(); a.src = ""; } } catch { }
        };
    }, []);

    return (
        <div className="wheel-section">
            <div id="wheelWrap" ref={wrapRef} className="wheel-wrap">
                <div className="wheel-bg" />
                <div className="wheel-lights" />
                <div className="wheel-pointer" />
                <div className="wheel-viewport">
                    <div className="wheel" ref={wheelRef}>
                        <div id="wheel-svg" ref={svgMountRef} />
                    </div>
                </div>
                <div id="coinLayer" ref={coinLayerRef} className="coin-layer" />
                <div id="fireworkLayer" ref={fwLayerRef} className="firework-layer" />
                <a id="claimBtn" ref={claimBtnRef} className="btn btn-primary claim-btn" hidden>Claim Reward</a>
                <button id="spinBtn" ref={spinBtnRef} className="btn btn-primary spin-btn" onClick={handleSpin} disabled={!ready}>Spin</button>
            </div>
            <div id="pageFX" ref={pageFXRef} className="page-fx" />
        </div>
    );
}
