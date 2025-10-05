import { useEffect, useLayoutEffect, useRef } from "react";
import AppModal from "@/components/AppModal.jsx";
import { useTranslation } from "react-i18next";
import { useModal } from "@/context/ModalContext.jsx";
import { affUrl } from "@/helpers/urls";
import { getAffiliateParams } from "@/helpers/storage";
import { logClick } from "@/helpers/logging";

const domain = "https://mrspinny.world";
const SEGMENTS = [
    { label: "200% Bonus + 100 Free Spins", key: "grand", grand: true, weight: 1 },
    { label: "100 Free Spins", value: 100, weight: 2 },
    { label: "75 Free Spins", value: 75, weight: 5 },
    { label: "50 Free Spins", value: 50, weight: 12 },
    { label: "25 Free Spins", value: 25, weight: 20 },
    { label: "10 Free Spins", value: 10, weight: 28 }
];

const PROMO_URL = "https://mrspinny.com";
const REWARD_KEY = "mrspinny_wheel_reward";
const SPIN_SOUND = "/assets/sounds/wheel-spin.mp3";
const WIN_SOUND = "/assets/sounds/magical-coin-win.wav";
const SPIN_TURNS = 10;

const GIFS = {
    coin: "/assets/gifs/coins.gif",
    confetti: "/assets/gifs/confetti.gif",
    fireworks: "/assets/gifs/fireworks.gif"
};

const Z = {
    MODAL: 2147483600,
    FX_OVER_MODAL: 2147483646,
    FX_TOP: 2147483647
};
function createAudio(src, vol = 1) {
    const a = new Audio(src);
    a.preload = "auto";
    a.crossOrigin = "anonymous";
    a.volume = vol;
    return a;
}

function ensureGlobalLayer(id, z = Z.FX_OVER_MODAL) {
    let el = document.getElementById(id);
    if (!el) {
        el = document.createElement("div");
        el.id = id;
        el.style.position = "fixed";
        el.style.inset = "0";
        el.style.pointerEvents = "none";
        el.style.zIndex = String(z);
        document.body.appendChild(el);
    } else {
        el.style.zIndex = String(z);
    }
    return el;
}

export default function WelcomeModal() {
    const { t } = useTranslation();
    const { isOpen, close } = useModal();
    const open = isOpen("welcome");

    const wheelHostRef = useRef(null);
    const spinRef = useRef(null);
    const claimRef = useRef(null);
    const rotorRef = useRef(null);
    const spinSndRef = useRef(null);
    const winSndRef = useRef(null);
    const spinningRef = useRef(false);
    const rotationRef = useRef(0);
    const openedOnceRef = useRef(false);

    const trackClick = (linkId, extra = {}) => {
        try {
            const aff = getAffiliateParams();
            logClick({ affParams: aff || {}, linkId, ...extra });
        } catch { }
    };

    useEffect(() => {
        if (!open) return;
        if (!spinSndRef.current) spinSndRef.current = createAudio(SPIN_SOUND, 0.9);
        if (!winSndRef.current) winSndRef.current = createAudio(WIN_SOUND, 1.0);
        ensureGlobalLayer("spinny-confetti-root", Z.FX_OVER_MODAL);
        ensureGlobalLayer("spinny-fireworks-root", Z.FX_TOP);
        if (!openedOnceRef.current) {
            trackClick("welcome_modal_open");
            openedOnceRef.current = true;
        }
    }, [open]);

    useLayoutEffect(() => {
        if (!open) return;

        const id = requestAnimationFrame(() => {
            const container = wheelHostRef.current;
            const spinBtn = spinRef.current;
            const claimBtn = claimRef.current;
            if (!container || !spinBtn || !claimBtn) return;

            if (rotorRef.current) {
                rotorRef.current.remove();
                rotorRef.current = null;
            }

            const N = SEGMENTS.length;
            const size = 1000;
            const radius = size / 2;

            const rotor = document.createElement("div");
            rotor.id = "wheel-rotor";
            rotor.className = "absolute inset-0 will-change-transform";
            rotor.style.transformOrigin = "50% 50%";
            rotor.style.transform = "rotate(0deg)";
            container.appendChild(rotor);
            rotorRef.current = rotor;

            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
            svg.setAttribute("class", "h-full w-full");
            rotor.appendChild(svg);

            const defs = document.createElementNS(svgNS, "defs");
            defs.innerHTML =
                '<filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
            svg.appendChild(defs);

            const fDrop = document.createElementNS(svgNS, "filter");
            fDrop.setAttribute("id", "txtShadow");
            const fe = document.createElementNS(svgNS, "feDropShadow");
            fe.setAttribute("dx", "0");
            fe.setAttribute("dy", "1.6");
            fe.setAttribute("stdDeviation", "1.6");
            fe.setAttribute("flood-color", "rgba(0,0,0,0.6)");
            fDrop.appendChild(fe);
            defs.appendChild(fDrop);

            const goldRad = document.createElementNS(svgNS, "radialGradient");
            goldRad.setAttribute("id", "goldRad");
            [["0%", "#fff6b0"], ["55%", "#ffd267"], ["100%", "#c27d0b"]].forEach(([o, c]) => {
                const s = document.createElementNS(svgNS, "stop");
                s.setAttribute("offset", o);
                s.setAttribute("stop-color", c);
                goldRad.appendChild(s);
            });
            defs.appendChild(goldRad);

            const rimGrad = document.createElementNS(svgNS, "linearGradient");
            rimGrad.setAttribute("id", "rimGrad");
            rimGrad.setAttribute("x1", "0%");
            rimGrad.setAttribute("y1", "0%");
            rimGrad.setAttribute("x2", "0%");
            rimGrad.setAttribute("y2", "100%");
            [["0%", "#f7cf5e"], ["50%", "#d89a1f"], ["100%", "#8b5a07"]].forEach(([o, c]) => {
                const s = document.createElementNS(svgNS, "stop");
                s.setAttribute("offset", o);
                s.setAttribute("stop-color", c);
                rimGrad.appendChild(s);
            });
            defs.appendChild(rimGrad);

            const palettes = [["#b81507", "#b81507"], ["#ff9c00", "#ff9c00"]];
            const angle = (2 * Math.PI) / N;
            const sliceStroke = 4;
            const OUTER_R = radius - 30;

            for (let i = 0; i < N; i++) {
                const start = i * angle - Math.PI / 2;
                const end = start + angle;
                const x1 = radius + OUTER_R * Math.cos(start);
                const y1 = radius + OUTER_R * Math.sin(start);
                const x2 = radius + OUTER_R * Math.cos(end);
                const y2 = radius + OUTER_R * Math.sin(end);
                const seg = SEGMENTS[i];
                const path = document.createElementNS(svgNS, "path");
                path.setAttribute("d", `M ${radius} ${radius} L ${x1} ${y1} A ${OUTER_R} ${OUTER_R} 0 0 1 ${x2} ${y2} Z`);
                if (seg.grand) {
                    const gradId = `grand-grad-${i}`;
                    const grad = document.createElementNS(svgNS, "linearGradient");
                    grad.setAttribute("id", gradId);
                    grad.setAttribute("x1", "0%");
                    grad.setAttribute("y1", "0%");
                    grad.setAttribute("x2", "100%");
                    grad.setAttribute("y2", "100%");
                    grad.innerHTML =
                        '<stop offset="0%" stop-color="#fff6a3"/><stop offset="40%" stop-color="#ffd24a"/><stop offset="100%" stop-color="#c48300"/>';
                    defs.appendChild(grad);
                    path.setAttribute("fill", `url(#${gradId})`);
                } else {
                    const [c1, c2] = palettes[i % palettes.length];
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
                }
                path.setAttribute("stroke", "#5a0000");
                path.setAttribute("stroke-width", String(sliceStroke));
                path.setAttribute("filter", "url(#softGlow)");
                svg.appendChild(path);
            }

            const measureWidth = (text, fontSize = 26) => {
                const t = document.createElementNS(svgNS, "text");
                t.setAttribute("visibility", "hidden");
                t.setAttribute("font-size", String(fontSize));
                t.setAttribute("font-family", "Arial, sans-serif");
                t.setAttribute("font-weight", "900");
                t.textContent = text;
                svg.appendChild(t);
                const w = t.getBBox().width;
                t.remove();
                return w;
            };

            const MIN_FONT = 18;

            const wrapToLines = (label, font, arcLen, maxLines = 3) => {
                if (label.includes("+")) {
                    const [a, b] = label.split("+");
                    const lines = [a.trim(), ("+ " + b.trim())].filter(Boolean);
                    if (Math.max(...lines.map((l) => measureWidth(l, font))) <= arcLen) return lines;
                }
                const words = label.split(/\s+/);
                const lines = [""];
                const forceBreakLongWord = (word) => {
                    let w = word;
                    while (w && lines.length < maxLines) {
                        let lo = 1, hi = w.length, cut = 1;
                        while (lo <= hi) {
                            const mid = Math.max(1, Math.floor((lo + hi) / 2));
                            const candidate = ((lines.at(-1) ? lines.at(-1) + " " : "") + w.slice(0, mid) + "-").trim();
                            if (measureWidth(candidate, font) <= arcLen) { cut = mid; lo = mid + 1; } else hi = mid - 1;
                        }
                        const head = w.slice(0, cut) + (w.length > cut ? "-" : "");
                        lines[lines.length - 1] = (lines.at(-1) + " " + head).trim();
                        w = w.slice(cut);
                        if (w && lines.length < maxLines) lines.push("");
                    }
                    if (w) lines[lines.length - 1] = (lines.at(-1) + " " + w).trim();
                };
                for (const w of words) {
                    const candidate = ((lines.at(-1) ? lines.at(-1) + " " : "") + w).trim();
                    if (measureWidth(candidate, font) <= arcLen || !lines.at(-1)) lines[lines.length - 1] = candidate;
                    else if (lines.length < maxLines) lines.push(w);
                    else forceBreakLongWord(w);
                }
                return lines.filter(Boolean).slice(0, maxLines);
            };

            const addCurvedLabel = (segIndex, label, midAngleRad, baseFont = 36, grand = false) => {
                const wheelPx = container.getBoundingClientRect().width || 520;
                const mobileBoost = wheelPx <= 360 ? 1.45 : wheelPx <= 420 ? 1.35 : wheelPx <= 480 ? 1.2 : 1;
                let font = Math.max(MIN_FONT, Math.round(baseFont * mobileBoost));
                const spread = (2 * Math.PI / N) * (wheelPx <= 480 ? 0.8 : 0.74);
                const arcLen = (radius - 156) * spread;
                let lines = wrapToLines(label, font, arcLen, grand ? 3 : 2);
                const fits = () => Math.max(...lines.map((l) => measureWidth(l, font))) <= arcLen;
                while (!fits() && font > MIN_FONT) font -= 1;
                const gap = Math.max(Math.round(font * 1.12), 22);
                const baseRadius = radius - (wheelPx <= 420 ? 140 : 148);
                const n = lines.length;
                const startOffset = -((n - 1) * gap) / 2;
                const radii = Array.from({ length: n }, (_, i) => baseRadius + startOffset + i * gap);
                const ids = lines.map((_, i) => {
                    const r = radii[i];
                    const start = midAngleRad - spread / 2;
                    const end = start + spread;
                    const ax1 = radius + r * Math.cos(start);
                    const ay1 = radius + r * Math.sin(start);
                    const ax2 = radius + r * Math.cos(end);
                    const ay2 = radius + r * Math.sin(end);
                    const id = `arc-${segIndex}-${i}`;
                    const p = document.createElementNS(svgNS, "path");
                    p.setAttribute("id", id);
                    p.setAttribute("fill", "none");
                    p.setAttribute("d", `M ${ax1} ${ay1} A ${r} ${r} 0 0 1 ${ax2} ${ay2}`);
                    defs.appendChild(p);
                    return id;
                });
                lines.forEach((textValue, i) => {
                    const t = document.createElementNS(svgNS, "text");
                    t.setAttribute("class", grand ? "seg-label grand-text" : "seg-label");
                    t.setAttribute("font-size", String(font));
                    t.style.letterSpacing = wheelPx < 520 ? "0.4px" : "0.6px";
                    t.setAttribute("fill", "#fff");
                    t.setAttribute("font-weight", "900");
                    t.setAttribute("stroke", "rgba(0,0,0,.75)");
                    t.setAttribute("stroke-width", "4");
                    t.setAttribute("paint-order", "stroke");
                    t.setAttribute("filter", "url(#txtShadow)");
                    const tp = document.createElementNS(svgNS, "textPath");
                    tp.setAttribute("href", `#${ids[i]}`);
                    tp.setAttribute("startOffset", "50%");
                    tp.setAttribute("text-anchor", "middle");
                    tp.textContent = textValue;
                    t.appendChild(tp);
                    svg.appendChild(t);
                });
            };

            for (let i = 0; i < N; i++) {
                const start = i * (2 * Math.PI / N) - Math.PI / 2;
                const mid = start + (2 * Math.PI / N) / 2;
                addCurvedLabel(i, SEGMENTS[i].label, mid, SEGMENTS[i].grand ? 42 : 38, !!SEGMENTS[i].grand);
            }

            const rim = document.createElementNS(svgNS, "circle");
            rim.setAttribute("cx", radius);
            rim.setAttribute("cy", radius);
            rim.setAttribute("r", radius - 12);
            rim.setAttribute("fill", "transparent");
            rim.setAttribute("stroke", "url(#rimGrad)");
            rim.setAttribute("stroke-width", "18");
            rim.setAttribute("filter", "url(#softGlow)");
            svg.appendChild(rim);

            const studs = 36;
            const rr = radius - 20;
            for (let i = 0; i < studs; i++) {
                const a = (i / studs) * Math.PI * 2;
                const cx = radius + rr * Math.cos(a);
                const cy = radius + rr * Math.sin(a);
                const dot = document.createElementNS(svgNS, "circle");
                dot.setAttribute("cx", cx);
                dot.setAttribute("cy", cy);
                dot.setAttribute("r", 9);
                dot.setAttribute("fill", "url(#goldRad)");
                dot.setAttribute("stroke", "rgba(120,0,0,.65)");
                dot.setAttribute("stroke-width", "1.5");
                svg.appendChild(dot);
            }

            const cap = document.createElementNS(svgNS, "circle");
            cap.setAttribute("cx", radius);
            cap.setAttribute("cy", radius);
            cap.setAttribute("r", 84);
            cap.setAttribute("fill", "url(#goldRad)");
            cap.setAttribute("filter", "url(#softGlow)");
            svg.appendChild(cap);

            const pickWeighted = () => {
                const total = SEGMENTS.reduce((s, x) => s + (x.weight || 1), 0);
                let r = Math.random() * total;
                for (let i = 0; i < SEGMENTS.length; i++) {
                    r -= SEGMENTS[i].weight || 1;
                    if (r <= 0) return i;
                }
                return SEGMENTS.length - 1;
            };

            const fx = {
                coinsBurst: (count = 80, duration = 1800) => {
                    const host = document.getElementById("coinLayer");
                    const wheel = document.getElementById("wheelWrap");
                    if (!host || !wheel) return;
                    const rect = wheel.getBoundingClientRect();
                    const cx = rect.width / 2;
                    const cy = rect.width / 2;
                    const items = [];
                    for (let i = 0; i < count; i++) {
                        const img = document.createElement("img");
                        img.src = GIFS.coin;
                        img.alt = "coin";
                        img.decoding = "async";
                        img.loading = "eager";
                        img.style.position = "absolute";
                        img.style.left = `${cx}px`;
                        img.style.top = `${cy}px`;
                        img.style.width = `${Math.round(22 + Math.random() * 22)}px`;
                        img.style.height = "auto";
                        img.style.transform = "translate(-50%, -50%)";
                        img.style.pointerEvents = "none";
                        img.style.opacity = "0";
                        const dx = (Math.random() - 0.5) * rect.width * 0.9;
                        const dy = rect.height * (0.45 + Math.random() * 0.55);
                        const rot = (Math.random() - 0.5) * 90;
                        const delay = Math.random() * 120;
                        const scale = 0.9 + Math.random() * 0.8;
                        img.style.setProperty("--dx", `${dx}px`);
                        img.style.setProperty("--dy", `${dy}px`);
                        img.style.setProperty("--rot", `${rot}deg`);
                        img.style.setProperty("--scale", `${scale}`);
                        img.style.animation = `spinny-coin ${duration}ms cubic-bezier(.22,.7,.24,1) ${Math.round(delay)}ms forwards`;
                        host.appendChild(img);
                        items.push(img);
                    }
                    setTimeout(() => items.forEach((n) => n.remove()), duration + 300);
                },
                confettiOverlay: (duration = 2000) => {
                    const root = ensureGlobalLayer("spinny-confetti-root", Z.FX_OVER_MODAL);
                    const img = document.createElement("img");
                    img.src = GIFS.confetti;
                    img.alt = "confetti";
                    img.decoding = "async";
                    img.loading = "eager";
                    img.style.position = "absolute";
                    img.style.inset = "0";
                    img.style.width = "100%";
                    img.style.height = "100%";
                    img.style.objectFit = "cover";
                    img.style.opacity = "0";
                    img.style.zIndex = "1";
                    img.style.animation = `spinny-fade-in-out ${duration}ms ease forwards`;
                    root.appendChild(img);
                    setTimeout(() => img.remove(), duration + 100);
                },
                fireworksPop: (bursts = 10, duration = 2000) => {
                    const root = ensureGlobalLayer("spinny-fireworks-root", Z.FX_TOP);
                    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
                    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                    const items = [];
                    for (let i = 0; i < bursts; i++) {
                        const img = document.createElement("img");
                        img.src = GIFS.fireworks;
                        img.alt = "fireworks";
                        img.decoding = "async";
                        img.loading = "eager";
                        const x = vw * (0.08 + Math.random() * 0.84);
                        const y = vh * (0.1 + Math.random() * 0.65);
                        img.style.position = "absolute";
                        img.style.left = `${x}px`;
                        img.style.top = `${y}px`;
                        img.style.width = `${Math.round(160 + Math.random() * 240)}px`;
                        img.style.height = "auto";
                        img.style.transform = "translate(-50%, -50%) scale(0.55)";
                        img.style.opacity = "0";
                        img.style.zIndex = "1";
                        const delay = Math.random() * 220;
                        img.style.animation = `spinny-burst ${duration}ms ease-out ${Math.round(delay)}ms forwards`;
                        root.appendChild(img);
                        items.push(img);
                    }
                    setTimeout(() => items.forEach((n) => n.remove()), duration + 350);
                }
            };

            const flashFlames = () => {
                const host = document.getElementById("wheelWrap");
                if (!host) return;
                const el = document.createElement("div");
                el.className = "pointer-events-none absolute inset-0 z-[89]";
                el.style.background = "radial-gradient(closest-side, rgba(255,165,0,0.45), rgba(255,120,0,0.22), transparent 70%)";
                el.style.filter = "blur(14px)";
                el.style.transform = "scale(0.9)";
                el.style.transition = "transform 450ms ease, opacity 1200ms ease";
                host.appendChild(el);
                requestAnimationFrame(() => {
                    el.style.transform = "scale(1.12)";
                    el.style.opacity = "1";
                });
                setTimeout(() => { el.style.opacity = "0"; }, 240);
                setTimeout(() => { el.remove(); }, 1200);
            };

            const triggerCelebration = (reward) => {
                const boost = reward?.grand ? 1.8 : 1.0;
                fx.coinsBurst(Math.floor(100 * boost), 2000);
                fx.confettiOverlay(2200);
                fx.fireworksPop(reward?.grand ? 14 : 10, 2200);
            };

            const onSpin = async () => {
                if (spinningRef.current) {
                    trackClick("welcome_spin_blocked");
                    return;
                }
                trackClick("welcome_spin_start");
                spinningRef.current = true;
                claimBtn.hidden = true;

                try { await spinSndRef.current.play(); } catch { }

                const idx = pickWeighted();
                const per = 360 / N;
                const center = idx * per + per / 2;
                const jitter = (Math.random() - 0.5) * (per * 0.5);
                const targetAngle = 360 - (center + jitter);

                const base = ((rotationRef.current % 360) + 360) % 360;
                const accelTurns = 1.2;
                const brakeTurns = 1.8;
                const cruiseTurns = Math.max(0, SPIN_TURNS - accelTurns - brakeTurns);

                const k0 = base;
                const k1 = base + accelTurns * 360;
                const k2 = base + (accelTurns + cruiseTurns) * 360;
                const final = k2 + brakeTurns * 360 + targetAngle;
                rotationRef.current = final;

                const fallbackMs = 9000;
                const durMs =
                    isFinite(spinSndRef.current.duration) && spinSndRef.current.duration > 0
                        ? spinSndRef.current.duration * 1000
                        : fallbackMs;

                let finished = false;
                const finish = () => {
                    if (finished) return;
                    finished = true;
                    spinningRef.current = false;
                    try { spinSndRef.current.pause(); spinSndRef.current.currentTime = 0; } catch { }
                    const reward = SEGMENTS[idx];
                    localStorage.setItem(REWARD_KEY, JSON.stringify({ ...reward, ts: Date.now() }));
                    claimBtn.hidden = false;
                    claimBtn.href = PROMO_URL;
                    flashFlames();
                    triggerCelebration(reward);
                    try { winSndRef.current.currentTime = 0; winSndRef.current.play().catch(() => { }); } catch { }
                    trackClick("welcome_spin_result", {
                        idx,
                        label: reward.label,
                        value: reward.value ?? null,
                        grand: !!reward.grand,
                        key: reward.key ?? null,
                        durationMs: durMs
                    });
                };

                if (rotor.animate) {
                    const animation = rotor.animate(
                        [
                            { offset: 0, transform: `rotate(${k0}deg)`, easing: "cubic-bezier(.55,.055,.675,.19)" },
                            { offset: 0.25, transform: `rotate(${k1}deg)`, easing: "linear" },
                            { offset: 0.75, transform: `rotate(${k2}deg)`, easing: "linear" },
                            { offset: 1, transform: `rotate(${final}deg)`, easing: "cubic-bezier(.16,1,.3,1)" }
                        ],
                        { duration: durMs, fill: "forwards" }
                    );
                    animation.addEventListener("finish", () => {
                        rotor.style.transform = `rotate(${final}deg)`;
                        finish();
                    }, { once: true });
                } else {
                    rotor.style.transition = `transform ${durMs}ms cubic-bezier(.16,1,.3,1)`;
                    requestAnimationFrame(() => (rotor.style.transform = `rotate(${final}deg)`));
                    setTimeout(finish, durMs + 80);
                }

                spinSndRef.current.addEventListener("ended", finish, { once: true });
                setTimeout(finish, durMs + 250);
            };

            spinBtn.addEventListener("click", onSpin);

            const cleanup = () => {
                spinBtn.removeEventListener("click", onSpin);
                if (rotorRef.current) {
                    rotorRef.current.remove();
                    rotorRef.current = null;
                }
            };
            rotorRef.current.__cleanup = cleanup;
        });

        return () => cancelAnimationFrame(id);
    }, [open]);

    useEffect(() => {
        return () => {
            if (rotorRef.current?.__cleanup) rotorRef.current.__cleanup();
        };
    }, [open]);

    return (
        <AppModal
            open={open}
            onClose={() => { trackClick("welcome_modal_close"); openedOnceRef.current = false; close("welcome"); }}
            title={t("home.modal.title")}
            subtitle={
                <>
                    {t("home.modal.sub", { domain: "mrspinny.world" })}{" "}
                    <a
                        href={affUrl(domain)}
                        className="text-amber-300 underline decoration-amber-300/60 underline-offset-2 hover:text-amber-200"
                        onClick={() => trackClick("home_modal_link")}
                    >
                        mrspinny.com
                    </a>
                    .
                </>
            }
            zIndex={Z.MODAL}
        >
            <style>{`
        @keyframes spinny-coin{0%{opacity:0;transform:translate(-50%,-50%) translate(0,0) rotate(0deg) scale(var(--scale));}5%{opacity:1;}100%{opacity:0;transform:translate(-50%,-50%) translate(var(--dx),var(--dy)) rotate(var(--rot)) scale(calc(var(--scale)*0.9));}}
        @keyframes spinny-fade-in-out{0%{opacity:0;}12%{opacity:1;}85%{opacity:1;}100%{opacity:0;}}
        @keyframes spinny-burst{0%{opacity:0;transform:translate(-50%,-50%) scale(0.55);}18%{opacity:1;transform:translate(-50%,-50%) scale(1.12);}65%{opacity:1;transform:translate(-50%,-50%) scale(1);}100%{opacity:0;transform:translate(-50%,-50%) scale(0.9);}}
      `}</style>

            <div className="mt-6" id="wheelWrap">
                <div className="mx-auto w/full max-w-xl">
                    <div className="relative mx-auto aspect-square w-full">
                        <div className="pointer-events-none absolute -inset-6 rounded-full bg-amber-400/20 blur-2xl" />
                        <div className="pointer-events-none absolute inset-0 rounded-full ring-8 ring-black/10 shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_8px_30px_rgba(0,0,0,0.55)]" />
                        <svg className="pointer-events-none absolute left-1/2 top-0 z-[84] -translate-x-1/2 -translate-y-[6px]" width="28" height="22" viewBox="0 0 28 22" aria-hidden="true">
                            <polygon points="14,22 0,0 28,0" fill="#fcd34d" stroke="rgba(0,0,0,.35)" strokeWidth="2" />
                            <circle cx="14" cy="4.5" r="3" fill="#fbbf24" stroke="rgba(0,0,0,.3)" strokeWidth="1" />
                        </svg>
                        <div id="wheel-svg" ref={wheelHostRef} className="absolute inset-0 z-[83]" aria-live="polite" />
                        <div id="confettiLayer" className="pointer-events-none absolute inset-0 z-[92] [mask-image:linear-gradient(to_bottom,black_80%,transparent)]" style={{ zIndex: 92 }} />
                        <div id="coinLayer" className="pointer-events-none absolute inset-0 z-[91] [mask-image:linear-gradient(to_bottom,black_85%,transparent)]" style={{ zIndex: 91 }} />
                        <div id="fireworkLayer" className="pointer-events-none absolute inset-0 z-[93]" style={{ zIndex: 93 }} />
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <button
                            id="spinBtn"
                            ref={spinRef}
                            type="button"
                            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 px-6 py-3 text-sm font-extrabold text-black shadow-[0_10px_30px_rgba(255,193,7,0.35)] ring-1 ring-amber-300/60 transition active:translate-y-[1px] hover:brightness-105"
                            data-link-id="welcome_spin_start"
                        >
                            {t("home.modal.spin")}
                        </button>
                        <a
                            id="claimBtn"
                            ref={claimRef}
                            href={PROMO_URL}
                            hidden
                            aria-live="polite"
                            onClick={() => trackClick("home_modal_claim")}
                            data-link-id="home_modal_claim"
                            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(16,185,129,0.35)] ring-1 ring-emerald-300/50 transition hover:brightness-105 active:translate-y-[1px]"
                        >
                            {t("home.modal.claim")}
                        </a>
                    </div>
                </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-xs text-slate-300/80">
                IP preview only. Real play happens at mrspinny.world. 18+.
            </div>
        </AppModal>
    );
}
