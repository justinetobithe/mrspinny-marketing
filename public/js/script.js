(function () {
    if (window.initMrSpinny) return;

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
    const MODAL_KEY = "mrspinny_welcome_seen";

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    let inited = false;
    let navToggle, mobileMenu, mobilePanel, backdrop, closeBtn;
    let wheelWrap, wheelEl, spinBtn, claimBtn, fireworkLayer, pageFX, modal, openBtn;
    let spinSnd, winSnd;
    let audioCtx, audioUnlocked = false;
    let isSpinning = false;
    const listeners = [];
    const fx = { timers: new Set(), addTimer(id) { this.timers.add(id) }, clearTimers() { this.timers.forEach(clearTimeout); this.timers.clear() } };

    const on = (el, type, fn, opt) => { if (!el) return; el.addEventListener(type, fn, opt); listeners.push([el, type, fn, opt]); };
    const offAll = () => { listeners.forEach(([el, t, f, o]) => { try { el.removeEventListener(t, f, o) } catch { } }); listeners.length = 0; };
    const reduceMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const isModalOpen = () => modal && !modal.hidden && modal.classList.contains("open");

    const perfProfile = (() => {
        const mem = (navigator.deviceMemory || 4);
        const cores = (navigator.hardwareConcurrency || 4);
        const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 480;
        const rm = reduceMotion();
        let fxScale = 1;
        if (rm) fxScale = 0.35;
        else if (mem <= 2 || cores <= 4 || smallScreen || isIOS) fxScale = 0.6;
        else if (mem <= 4) fxScale = 0.8;
        return { fxScale, rm };
    })();

    function todayStr() {
        try {
            const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" });
            return fmt.format(new Date());
        } catch {
            const d = new Date(); const mm = String(d.getMonth() + 1).padStart(2, "0"); const dd = String(d.getDate()).padStart(2, "0");
            return `${d.getFullYear()}-${mm}-${dd}`;
        }
    }

    const checkSpinAllowed = async () => true;
    const markSpun = () => { };

    function createAudio(src, volume = 1) {
        const a = new Audio(src);
        a.preload = "auto";
        a.volume = volume;
        a.crossOrigin = "anonymous";
        a.muted = false;
        return a;
    }

    function ensureAudioContext() {
        if (audioCtx) return audioCtx;
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) audioCtx = new Ctx();
        return audioCtx;
    }

    function unlockAudioOnce() {
        if (audioUnlocked) return;
        audioUnlocked = true;
        const ctx = ensureAudioContext();
        if (ctx && ctx.state === "suspended") ctx.resume().catch(() => { });
        const o = ctx && ctx.createOscillator ? ctx.createOscillator() : null;
        const g = ctx && ctx.createGain ? ctx.createGain() : null;
        if (o && g) { g.gain.value = 0.0001; o.connect(g).connect(ctx.destination); o.start(0); o.stop(ctx.currentTime + 0.02); }
    }

    function bindAudioUnlock() {
        const handler = () => unlockAudioOnce();
        on(window, "touchstart", handler, { passive: true, once: true });
        on(window, "pointerdown", handler, { passive: true, once: true });
        on(window, "click", handler, { passive: true, once: true });
    }

    function setupSounds() {
        if (spinSnd || winSnd) return;
        spinSnd = createAudio("/assets/sounds/wheel-spin.mp3", 0.9);
        winSnd = createAudio("/assets/sounds/magical-coin-win.wav", 1.0);
        bindAudioUnlock();
    }

    function teardownSounds() {
        try { if (spinSnd) { spinSnd.pause(); spinSnd.src = ""; spinSnd.load(); } } catch { }
        try { if (winSnd) { winSnd.pause(); winSnd.src = ""; winSnd.load(); } } catch { }
        spinSnd = null; winSnd = null;
    }

    function playSpinSound() {
        if (!isModalOpen() || !spinSnd) return;
        try { spinSnd.currentTime = 0; spinSnd.play().catch(() => { }); } catch { }
    }
    function stopSpinSound() {
        if (!spinSnd) return;
        try { spinSnd.pause(); spinSnd.currentTime = 0; } catch { }
    }
    function playWinSound(onEnded) {
        if (!isModalOpen() || !winSnd) { if (onEnded) onEnded(); return; }
        try {
            winSnd.currentTime = 0;
            const done = () => { winSnd.removeEventListener("ended", done); onEnded && onEnded(); };
            winSnd.addEventListener("ended", done, { once: true });
            winSnd.play().catch(() => done());
        } catch { onEnded && onEnded(); }
    }

    function isMenuOpen() { return !!mobileMenu && !mobileMenu.hidden && mobileMenu.classList.contains("open"); }
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

    function startCelebrationWindow(ms = 2600) { endCelebration(); const id = setTimeout(endCelebration, Math.round(ms * (0.65 + 0.35 * perfProfile.fxScale))); fx.addTimer(id); }
    function endCelebration() {
        fx.clearTimers();
        try {
            if (fireworkLayer) fireworkLayer.innerHTML = "";
            if (pageFX) pageFX.innerHTML = "";
            const ring = document.getElementById("flameRing");
            if (ring) { ring.classList.remove("heatwave"); ring.innerHTML = ""; }
        } catch { }
        document.querySelectorAll(".flame-coin,.coin,.spark,.fw,.sparkler,.sparkler-xl,.fw-xl,.shockwave,.coin-trail").forEach(n => n.remove());
        wheelWrap?.classList.remove("do-shake", "spinning");
        wheelEl?.classList.remove("is-spinning", "hit");
        stopSpinSound();
    }

    function pulseRingsBurst(times = 5, gap = 140) {
        const wrap = wheelWrap; if (!wrap) return;
        times = Math.max(1, Math.round(times * (0.6 + 0.4 * perfProfile.fxScale)));
        for (let i = 0; i < times; i++) {
            const tid = setTimeout(() => {
                const ring = document.createElement("div");
                ring.className = "bg-ring";
                wrap.querySelector(".wheel-bg")?.appendChild(ring);
                const tid2 = setTimeout(() => ring.remove(), 1200);
                fx.addTimer(tid2);
            }, i * gap);
            fx.addTimer(tid);
        }
    }
    function idleBGKick() { const t = setTimeout(() => pulseRingsBurst(2, 220), 600); fx.addTimer(t); }

    function pool(createFn, size) {
        const free = [];
        for (let i = 0; i < size; i++) free.push(createFn());
        return {
            take() { return free.pop() || createFn(); },
            release(el) { if (!el) return; el.remove(); free.push(el); }
        }
    }

    let fwPool, coinPool, sparkPool, shockPool, trailPool;

    function ensurePools() {
        if (!fwPool) fwPool = pool(() => { const d = document.createElement("div"); d.className = "fw"; d.style.willChange = "transform, opacity"; return d; }, 120);
        if (!coinPool) coinPool = pool(() => { const wrap = document.createElement("div"); wrap.className = "flame-coin"; wrap.style.willChange = "transform, opacity"; const flame = document.createElement("div"); flame.className = "flame"; const coin = document.createElement("div"); coin.className = "coin"; wrap.appendChild(flame); wrap.appendChild(coin); return wrap; }, 80);
        if (!sparkPool) sparkPool = pool(() => { const d = document.createElement("div"); d.className = "spark"; d.style.willChange = "transform, opacity"; return d; }, 120);
        if (!shockPool) shockPool = pool(() => { const d = document.createElement("div"); d.className = "shockwave"; d.style.willChange = "transform, opacity"; return d; }, 6);
        if (!trailPool) trailPool = pool(() => { const d = document.createElement("div"); d.className = "coin-trail"; d.style.willChange = "transform, opacity"; return d; }, 60);
    }

    async function onSpin() {
        if (isSpinning || !wheelEl || !wheelWrap || !spinBtn) return;
        if (!isModalOpen()) return;
        const allowed = await checkSpinAllowed();
        if (!allowed) { window.location.href = PROMO_URL; return; }
        endCelebration();
        isSpinning = true;
        spinBtn.disabled = true;
        spinBtn.classList.add("is-hidden");
        if (claimBtn) { claimBtn.hidden = true; claimBtn.classList.remove("show"); }
        wheelWrap.classList.add("spinning");
        wheelEl.classList.add("is-spinning");

        wheelEl.style.transition = "transform 3200ms cubic-bezier(0.19, 1, 0.22, 1)";
        void wheelEl.offsetWidth;

        pulseRingsBurst(isIOS ? 2 : Math.max(2, Math.round(4 * perfProfile.fxScale)), 130);
        playSpinSound();

        const chosen = pickSegment();
        const segmentCount = SEGMENTS.length;
        const index = SEGMENTS.findIndex((s) => s.label === chosen.label);
        const segmentAngle = 360 / segmentCount;
        const baseTurns = perfProfile.rm ? 4 : (perfProfile.fxScale < 0.7 ? 5 : 6);
        const base = 360 * baseTurns;
        const offset = segmentAngle * index + segmentAngle / 2;
        const jitter = rand(-6, 6);
        const finalDeg = base + (360 - offset) + jitter;

        requestAnimationFrame(() => { wheelEl.style.transform = `rotate(${finalDeg}deg)`; });

        const endOnce = () => {
            wheelEl.removeEventListener("transitionend", endOnce);
            onSpinEnd(finalDeg, chosen);
            isSpinning = false;
        };
        on(wheelEl, "transitionend", endOnce, { once: true });
        const safety = setTimeout(() => { if (isSpinning) endOnce(); }, 6500);
        fx.addTimer(safety);
    }

    function clearSpinCaches() { try { localStorage.removeItem(REWARD_KEY); } catch { } }

    function onSpinEnd(finalDeg, chosen) {
        markSpun();
        try { localStorage.setItem(REWARD_KEY, JSON.stringify({ label: chosen.label, value: chosen.value ?? null, date: todayStr() })); } catch { }
        wheelWrap.classList.remove("spinning");
        wheelEl.classList.remove("is-spinning");

        const lightFX = perfProfile.rm || isIOS;
        startCelebrationWindow(lightFX ? 1200 : 2200);
        screenShake(lightFX ? 6 : 9, lightFX ? 320 : 440);
        if (!lightFX) {
            igniteFlameRing(1800, isIOS ? 18 : Math.max(22, Math.round(32 * perfProfile.fxScale)));
            heatWave(1400);
        }
        shockwave(lightFX ? 1 : 2);
        burstFlamingCoins({ count: lightFX ? 24 : 54, embers: !lightFX, trails: !lightFX });
        burstFireworks();
        burstFireworksFullScreen();
        pulseRingsBurst(lightFX ? 1 : 3, 140);
        stopSpinSound();

        const current = finalDeg % 360;
        wheelEl.style.transition = "none";
        wheelEl.style.transform = `rotate(${current}deg)`;
        wheelEl.style.setProperty("--final", `${current}deg`);
        void wheelEl.offsetHeight;
        wheelEl.style.transition = "";
        wheelEl.classList.add("hit");
        const tHit = setTimeout(() => wheelEl.classList.remove("hit"), 800); fx.addTimer(tHit);

        const rewardParam = chosen.value ? `${chosen.value}FS` : encodeURIComponent(chosen.label);
        if (claimBtn) {
            claimBtn.href = `${PROMO_URL}?reward=${rewardParam}`;
            claimBtn.hidden = false;
            claimBtn.style.zIndex = "10";
            claimBtn.style.pointerEvents = "auto";
            const panel = claimBtn.closest(".modal-panel");
            if (panel) panel.style.overflow = "visible";
            void claimBtn.offsetWidth;
            const tClaim = setTimeout(() => claimBtn.classList.add("show"), 50);
            fx.addTimer(tClaim);
            const forceVisible = setTimeout(() => { if (claimBtn.hidden) { claimBtn.hidden = false; claimBtn.classList.add("show"); } }, 500);
            fx.addTimer(forceVisible);
        }

        playWinSound(() => { clearSpinCaches(); teardownSounds(); });
    }

    function pickSegment(segments = SEGMENTS) {
        const total = segments.reduce((s, seg) => s + seg.weight, 0);
        let r = Math.random() * total;
        for (const seg of segments) { if ((r -= seg.weight) <= 0) return seg; }
        return segments[segments.length - 1];
    }

    function injectHeatStyles() {
        if (document.getElementById("flameStyles")) return;
        const s = document.createElement("style");
        s.id = "flameStyles";
        s.textContent = "#wheelWrap{position:relative}#flameRing{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:4;filter:drop-shadow(0 0 10px rgba(255,140,0,.35))}#flameRing .flame-jet{position:absolute;left:50%;top:25%;transform:rotate(var(--a)) translate(var(--d)) translate(-50%,-50%);border-radius:999px;background:radial-gradient(closest-side,rgba(255,220,150,.95),rgba(255,105,40,.82) 60%,rgba(150,15,0,.65) 92%,rgba(150,15,0,0) 100%);mix-blend-mode:screen;filter:url(#heatDistort) blur(.2px) drop-shadow(0 0 6px rgba(255,120,0,.5));animation:flameFlicker 240ms infinite alternate}#flameRing.heatwave{filter:url(#heatDistort) drop-shadow(0 0 10px rgba(255,160,0,.4))}@keyframes flameFlicker{from{transform:rotate(var(--a)) translate(var(--d)) translate(-50%,-50%) scale(1);opacity:.96}to{transform:rotate(var(--a)) translate(calc(var(--d) + 2%)) translate(-50%,-50%) scale(1.06);opacity:1}}";
        document.head.appendChild(s);
    }
    function ensureFlameRing() {
        if (!wheelWrap) return null;
        let ring = document.getElementById("flameRing");
        if (!ring) {
            ring = document.createElement("div"); ring.id = "flameRing";
            const pointer = wheelWrap.querySelector(".wheel-pointer");
            if (pointer) wheelWrap.insertBefore(ring, pointer); else wheelWrap.appendChild(ring);
        }
        return ring;
    }
    function sizeAndCenterFlameRing() {
        const ring = ensureFlameRing(); if (!ring || !wheelEl) return;
        const w = wheelEl.getBoundingClientRect().width || wheelEl.offsetWidth || 600;
        const scale = 1.12;
        ring.style.inset = "auto";
        ring.style.position = "absolute";
        ring.style.left = "50%";
        ring.style.top = "50%";
        ring.style.transform = "translate(-50%,-50%)";
        ring.style.width = `${w * scale}px`;
        ring.style.height = `${w * scale}px`;
    }
    function centerOf(el, relativeTo) {
        const a = el.getBoundingClientRect(); const b = relativeTo.getBoundingClientRect();
        return { x: a.left + a.width / 2 - b.left, y: a.top + a.height / 2 - b.top };
    }
    function igniteFlameRing(duration = 1800, jets = 40) {
        const ring = ensureFlameRing(); if (!ring) return;
        ring.innerHTML = "";
        const frag = document.createDocumentFragment();
        const j = Math.max(14, Math.round(jets * (0.6 + 0.4 * perfProfile.fxScale)));
        for (let i = 0; i < j; i++) {
            const jet = document.createElement("div");
            jet.className = "flame-jet";
            jet.style.setProperty("--a", (i / j) * 360 + "deg");
            jet.style.setProperty("--d", 58 + Math.random() * 6 + "%");
            jet.style.height = 110 + Math.random() * 60 + "px";
            jet.style.width = 20 + Math.random() * 10 + "px";
            jet.style.animationDelay = Math.random() * 160 + "ms";
            frag.appendChild(jet);
        }
        ring.appendChild(frag);
        const tid = setTimeout(() => { ring.innerHTML = ""; }, Math.round(duration * (0.65 + 0.35 * perfProfile.fxScale))); fx.addTimer(tid);
    }
    function heatWave(duration = 1400) { const ring = document.getElementById("flameRing"); if (!ring) return; ring.classList.add("heatwave"); const tid = setTimeout(() => ring.classList.remove("heatwave"), Math.round(duration * (0.65 + 0.35 * perfProfile.fxScale))); fx.addTimer(tid); }
    function shockwave(count = 1) {
        ensurePools();
        const container = fireworkLayer || pageFX;
        const n = Math.max(1, count);
        for (let i = 0; i < n; i++) {
            const sw = shockPool.take();
            sw.style.left = "50%";
            sw.style.top = "50%";
            sw.style.animationDelay = `${i * 100}ms`;
            container && container.appendChild(sw);
            const tid = setTimeout(() => shockPool.release(sw), 1000 + i * 100); fx.addTimer(tid);
        }
    }
    function screenShake(intensity = 8, duration = 450) {
        const el = wheelWrap; if (!el) return;
        intensity = Math.max(3, Math.round(intensity * perfProfile.fxScale));
        duration = Math.round(duration * (0.65 + 0.35 * perfProfile.fxScale));
        el.style.setProperty("--shake-intensity", intensity + "px");
        el.classList.add("do-shake");
        const tid = setTimeout(() => el.classList.remove("do-shake"), duration + 60); fx.addTimer(tid);
    }
    function burstFireworks() {
        ensurePools();
        if (!fireworkLayer || !wheelEl) return;
        const { x: cx, y: cy } = centerOf(wheelEl, fireworkLayer);
        const COLORS = ["#ffd54a", "#f59e0b", "#ffcc33", "#b71c1c", "#8e0e0e", "#fff1a8"];
        const totalBursts = perfProfile.rm ? 1 : Math.max(2, Math.round(4 * perfProfile.fxScale));
        const radius = 210;
        const frag = document.createDocumentFragment();
        for (let b = 0; b < totalBursts; b++) {
            const particles = Math.max(16, Math.round(28 * perfProfile.fxScale));
            for (let i = 0; i < particles; i++) {
                const theta = (i / particles) * Math.PI * 2 + Math.random() * 0.12;
                const dist = radius + Math.random() * 60;
                const x = Math.cos(theta) * dist; const y = Math.sin(theta) * dist;
                const fw = fwPool.take();
                fw.style.left = cx + "px"; fw.style.top = cy + "px";
                fw.style.setProperty("--x", `${x}px`); fw.style.setProperty("--y", `${y}px`);
                fw.style.setProperty("--c", COLORS[(i + b) % COLORS.length]);
                fw.style.animationDelay = `${b * 100}ms`;
                frag.appendChild(fw);
                const tid = setTimeout(() => fwPool.release(fw), Math.round(1100 + b * 100)); fx.addTimer(tid);
            }
        }
        fireworkLayer.appendChild(frag);
    }
    function randomColor() { const c = ["#ffd54a", "#f59e0b", "#ffcc33", "#b71c1c", "#8e0e0e", "#fff1a8"]; return c[Math.floor(Math.random() * c.length)]; }
    function fireworkBurstAt(container, cx, cy, radius = 260, particles = 46, delay = 0) {
        ensurePools();
        const frag = document.createDocumentFragment();
        for (let i = 0; i < particles; i++) {
            const theta = (i / particles) * Math.PI * 2 + Math.random() * 0.1;
            const dist = radius + Math.random() * 80;
            const x = Math.cos(theta) * dist; const y = Math.sin(theta) * dist;
            const el = fwPool.take();
            el.style.left = cx + "px"; el.style.top = cy + "px";
            el.style.setProperty("--x", x + "px"); el.style.setProperty("--y", y + "px");
            el.style.setProperty("--c", randomColor()); el.style.animationDelay = delay + "ms";
            frag.appendChild(el);
            const tid = setTimeout(() => fwPool.release(el), Math.round(1200 + delay)); fx.addTimer(tid);
        }
        container.appendChild(frag);
    }
    function burstFireworksFullScreen() {
        ensurePools();
        const W = window.innerWidth; const H = window.innerHeight;
        if (!pageFX) return;
        pageFX.innerHTML = "";
        if (perfProfile.rm || isIOS) return;
        const centers = [[W * 0.2, H * 0.35], [W * 0.5, H * 0.25], [W * 0.8, H * 0.42]].slice(0, Math.max(1, Math.round(3 * perfProfile.fxScale)));
        centers.forEach((c, idx) => { const [cx, cy] = c; const delay = idx * 140; fireworkBurstAt(pageFX, cx, cy, 260 + Math.random() * 60, Math.max(14, Math.round(30 * perfProfile.fxScale)), delay); });
        const tid = setTimeout(() => { pageFX.innerHTML = ""; }, Math.round(2200 * (0.7 + 0.3 * perfProfile.fxScale))); fx.addTimer(tid);
    }
    function burstFlamingCoins({ count = 80, embers = true, trails = true } = {}) {
        ensurePools();
        if (!fireworkLayer || !wheelEl) return;
        const { x: cx, y: cy } = centerOf(wheelEl, fireworkLayer);
        const frag = document.createDocumentFragment();
        count = Math.max(18, Math.round(count * (0.55 + 0.45 * perfProfile.fxScale)));
        if (perfProfile.rm || isIOS) { embers = false; trails = false; }
        for (let i = 0; i < count; i++) {
            const base = -Math.PI / 2; const spread = Math.PI * 0.9;
            const theta = base + (Math.random() - 0.5) * spread;
            const power = 180 + Math.random() * 180;
            const dx = Math.cos(theta) * power; const dy = Math.sin(theta) * power;
            const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
            const wrap = coinPool.take();
            wrap.style.left = cx - 8 + "px"; wrap.style.top = cy - 8 + "px";
            wrap.style.setProperty("--x", dx + "px"); wrap.style.setProperty("--y", dy + "px"); wrap.style.setProperty("--angle", angleDeg + "deg");
            wrap.style.transformOrigin = "center"; wrap.style.animationDuration = `${700 + Math.random() * 320}ms`;
            const hasTrail = trails && !isIOS;
            if (hasTrail) {
                const trail = trailPool.take();
                trail.style.setProperty("--angle", angleDeg + "deg");
                trail.style.animationDuration = `${560 + Math.random() * 320}ms`;
                wrap.appendChild(trail);
                setTimeout(() => trailPool.release(trail), 1000);
            }
            frag.appendChild(wrap);
            if (embers && !isIOS) {
                const emberCount = 1 + Math.floor(Math.random() * 2);
                for (let e = 0; e < emberCount; e++) {
                    const sp = sparkPool.take(); sp.style.left = cx + "px"; sp.style.top = cy + "px";
                    const jitter = 70 + Math.random() * 110;
                    const ex = Math.cos(theta + (Math.random() * 0.25 - 0.125)) * jitter;
                    const ey = Math.sin(theta + (Math.random() * 0.25 - 0.125)) * jitter;
                    sp.style.setProperty("--sx", ex + "px"); sp.style.setProperty("--sy", ey + "px"); sp.style.animationDuration = `${520 + Math.random() * 420}ms`;
                    frag.appendChild(sp);
                    const t2 = setTimeout(() => sparkPool.release(sp), 900); fx.addTimer(t2);
                }
            }
            const t1 = setTimeout(() => coinPool.release(wrap), 1200); fx.addTimer(t1);
        }
        fireworkLayer.appendChild(frag);
    }
    function ensureBulbsLayer() {
        const wrap = wheelWrap; if (!wrap) return;
        let bulbs = wrap.querySelector(".wheel-lights"); if (bulbs) return;
        bulbs = document.createElement("div"); bulbs.className = "wheel-lights";
        const flame = document.getElementById("flameRing") || wrap.querySelector("#flameRing");
        if (flame) wrap.insertBefore(bulbs, flame); else wrap.insertBefore(bulbs, wrap.querySelector(".wheel-pointer") || wrap.firstChild);
    }

    function buildWheelSVG() {
        const mount = document.getElementById("wheel-svg"); if (!mount) return;
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
                const [a, b] = label.split("+");
                const lines = [a.trim(), ("+ " + b.trim())].filter(Boolean);
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
            for (const w of words) {
                const candidate = ((lines.at(-1) ? lines.at(-1) + " " : "") + w).trim();
                if (measureWidth(candidate, font) <= arcLen || !lines.at(-1)) lines[lines.length - 1] = candidate;
                else if (lines.length < maxLines) lines.push(w);
                else forceBreakLongWord(w);
            }
            return lines.filter(Boolean).slice(0, maxLines);
        };

        const addCurvedLabel = (segIndex, label, midAngleRad, baseFont = 36, grand = false) => {
            const wheelPx = (wheelWrap?.getBoundingClientRect?.().width) || 520;
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
                const [c1, c2] = PALETTE[i % PALETTE.length]; const gradId = `seg-grad-${i}`; const grad = document.createElementNS(svgNS, "linearGradient");
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
    }

    function injectHeatFilter() {
        if (document.getElementById("heatDistort")) return;
        if (isIOS) return;
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("aria-hidden", "true"); svg.style.position = "absolute"; svg.style.width = 0; svg.style.height = 0;
        svg.innerHTML = '<filter id="heatDistort"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.08" numOctaves="2" seed="2"/><feDisplacementMap in="SourceGraphic" scale="12" xChannelSelector="R" yChannelSelector="G"/></filter>';
        document.body.appendChild(svg);
    }

    function ensurePageFX() {
        pageFX = document.getElementById("pageFX");
        if (!pageFX) { pageFX = document.createElement("div"); pageFX.id = "pageFX"; pageFX.className = "page-fx"; pageFX.style.willChange = "transform, opacity"; pageFX.style.contain = "layout paint size style"; document.body.appendChild(pageFX); }
    }

    function bindGlobalKeys() {
        const escClose = (e) => { if (e.key === "Escape" && isMenuOpen()) closeMenu(); };
        const tabTrap = (e) => {
            if (!isMenuOpen() || e.key !== "Tab") return;
            const list = Array.from(mobilePanel?.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') || []) || [];
            if (!list.length) return;
            const first = list[0]; const last = list[list.length - 1]; const active = document.activeElement;
            if (e.shiftKey && active === first) { last.focus(); e.preventDefault(); }
            else if (!e.shiftKey && active === last) { first.focus(); e.preventDefault(); }
        };
        on(document, "keydown", escClose);
        on(document, "keydown", tabTrap);
    }

    function bindMenu() {
        mobileMenu = document.getElementById("mobileMenu");
        if (mobileMenu?.dataset.reactMenu === "1") return;
        navToggle = document.getElementById("navToggle");
        mobilePanel = document.querySelector("#mobileMenu .mobile-menu-panel");
        backdrop = mobileMenu ? mobileMenu.querySelector(".mobile-menu-backdrop") : null;
        closeBtn = document.getElementById("mobileClose");
        on(navToggle, "click", () => (mobileMenu?.hidden ? openMenu() : closeMenu()));
        on(backdrop, "click", closeMenu);
        on(closeBtn, "click", closeMenu);
        bindGlobalKeys();
    }

    function bindWheel() {
        wheelWrap = document.getElementById("wheelWrap");
        wheelEl = document.querySelector(".wheel");
        spinBtn = document.getElementById("spinBtn");
        claimBtn = document.getElementById("claimBtn");
        fireworkLayer = document.getElementById("fireworkLayer");

        injectHeatFilter();
        if (!isIOS) injectHeatStyles();
        ensureFlameRing();
        ensureBulbsLayer();
        ensurePageFX();
        buildWheelSVG();

        if (wheelWrap) { wheelWrap.style.marginBottom = "64px"; wheelWrap.style.willChange = "transform"; }
        if (wheelEl) { wheelEl.style.willChange = "transform"; wheelEl.style.contain = "layout paint size style"; wheelEl.style.transform = "rotate(0deg)"; }
        if (fireworkLayer) { fireworkLayer.style.willChange = "transform, opacity"; fireworkLayer.style.contain = "layout paint size style"; }
        if (claimBtn) { claimBtn.style.zIndex = "10"; claimBtn.style.pointerEvents = "auto"; const panel = claimBtn.closest(".modal-panel"); if (panel) panel.style.overflow = "visible"; }

        const resizeFn = (() => {
            let raf = 0;
            return () => {
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => { sizeAndCenterFlameRing(); });
            };
        })();
        sizeAndCenterFlameRing();
        on(window, "resize", resizeFn, { passive: true });

        initWheel();
    }

    async function initWheel() {
        if (!spinBtn) return;
        const allowed = await checkSpinAllowed();
        if (!allowed) { spinBtn.remove(); spinBtn = null; return; }
        on(spinBtn, "click", onSpin);
        idleBGKick();
        ensurePools();
    }

    function resetWheelUI() {
        if (!wheelWrap || !wheelEl) return;
        isSpinning = false;
        if (spinBtn) { spinBtn.disabled = false; spinBtn.classList.remove("is-hidden"); }
        if (claimBtn) { claimBtn.hidden = true; claimBtn.classList.remove("show"); }
        endCelebration();
        wheelEl.classList.remove("is-spinning", "hit");
        wheelWrap.classList.remove("spinning");
        wheelEl.style.transition = "none";
        wheelEl.style.transform = "rotate(0deg)";
        wheelEl.style.removeProperty("--final");
        void wheelEl.offsetHeight;
        wheelEl.style.transition = "";
    }

    function initWelcomeModal() {
        modal = document.getElementById("welcomeModal");
        openBtn = document.getElementById("openWelcome");
        const openModal = () => {
            if (!modal) return;
            modal.hidden = false;
            requestAnimationFrame(() => modal.classList.add("open"));
            document.body.classList.add("no-scroll");
            setupSounds();
            resetWheelUI();
        };
        const closeModal = () => {
            if (!modal) return;
            modal.classList.remove("open");
            document.body.classList.remove("no-scroll");
            setTimeout(() => (modal.hidden = true), 180);
            resetWheelUI();
            teardownSounds();
            try { localStorage.removeItem(REWARD_KEY); } catch { }
        };

        if (modal && !localStorage.getItem(MODAL_KEY)) {
            const t = setTimeout(openModal, 500); fx.addTimer(t);
            try { localStorage.setItem(MODAL_KEY, "1"); } catch { }
        }
        on(openBtn, "click", (e) => { e.preventDefault(); openModal(); });
        on(modal, "click", (e) => { if (e.target.matches("[data-close], .modal-backdrop")) closeModal(); });
        on(document, "keydown", (e) => { if (e.key === "Escape" && modal && !modal.hidden) closeModal(); });
        if (claimBtn) {
            on(claimBtn, "click", () => {
                resetWheelUI();
                if (modal && !modal.hidden) closeModal();
            }, { passive: true });
        }
    }

    window.initMrSpinny = function () {
        if (inited) return;
        bindMenu();
        bindWheel();
        initWelcomeModal();
        inited = true;
    };

    window.destroyMrSpinny = function () {
        fx.clearTimers();
        offAll();
        endCelebration();
        document.body.classList.remove("no-scroll");
        teardownSounds();
        try { audioCtx && audioCtx.close && audioCtx.close(); } catch { }
        inited = false;
    };
})();
