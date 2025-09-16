(function () {
    if (window.initMrSpinny) return;

    const SEGMENTS = [
        { label: '200% Bonus + 100 Free Spins', key: 'grand', grand: true, weight: 1 },
        { label: '100 Free Spins', value: 100, weight: 2 },
        { label: '75 Free Spins', value: 75, weight: 5 },
        { label: '50 Free Spins', value: 50, weight: 12 },
        { label: '25 Free Spins', value: 25, weight: 20 },
        { label: '10 Free Spins', value: 10, weight: 28 }
    ];
    const PROMO_URL = 'https://mrspinny.com/promotions';
    const REWARD_KEY = 'mrspinny_wheel_reward';

    let inited = false;
    let navToggle, mobileMenu, mobilePanel, backdrop, closeBtn;
    let wheelWrap, wheelEl, spinBtn, claimBtn, confettiLayer, coinLayer, fireworkLayer, pageFX;
    let spinSnd, winSnd;
    let isSpinning = false;
    const listeners = [];
    const fx = { timers: new Set(), addTimer(id) { this.timers.add(id) }, clearTimers() { this.timers.forEach(clearTimeout); this.timers.clear() } };

    const on = (el, type, fn, opt) => { if (!el) return; el.addEventListener(type, fn, opt); listeners.push([el, type, fn, opt]); };
    const offAll = () => { listeners.forEach(([el, t, f, o]) => { try { el.removeEventListener(t, f, o) } catch { } }); listeners.length = 0; };
    const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const PERF = (() => {
        const mem = navigator.deviceMemory || 4;
        const cores = navigator.hardwareConcurrency || 4;
        const w = Math.min(window.innerWidth || 0, screen?.width || 0);
        const lowWidth = w && w <= 480;
        const low = mem <= 4 || cores <= 4 || lowWidth;
        const mid = mem <= 6 || cores <= 6 || (w && w <= 768);
        const rm = reduceMotion();
        const scale = rm ? 0 : low ? 0.35 : mid ? 0.6 : 1;
        return {
            low,
            mid,
            rm,
            scale,
            coins: rm ? 12 : Math.max(8, Math.round(80 * scale)),
            embersPerCoin: rm ? 0 : low ? 1 : 2,
            fireworksBursts: rm ? 0 : low ? 2 : mid ? 3 : 5,
            fireworksParticles: rm ? 0 : low ? 18 : mid ? 30 : 46,
            ringsBurstTimes: rm ? 0 : low ? 2 : 4
        };
    })();

    function todayStr() {
        try {
            const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' });
            return fmt.format(new Date());
        } catch {
            const d = new Date(); const mm = String(d.getMonth() + 1).padStart(2, '0'); const dd = String(d.getDate()).padStart(2, '0');
            return `${d.getFullYear()}-${mm}-${dd}`;
        }
    }

    const checkSpinAllowed = async () => true;
    const markSpun = () => { };

    function setupSounds() {
        try {
            spinSnd = new Audio('/assets/sounds/wheel-spin.mp3');
            spinSnd.preload = 'none';
            spinSnd.volume = 0.9;
            spinSnd.loop = false;
            winSnd = new Audio('/assets/sounds/magical-coin-win.wav');
            winSnd.preload = 'none';
            winSnd.volume = 1.0;
            winSnd.loop = false;
        } catch { }
    }
    function playSpinSound() { if (!spinSnd) return; try { spinSnd.currentTime = 0; spinSnd.play().catch(() => { }); } catch { } }
    function stopSpinSound() { if (!spinSnd) return; try { spinSnd.pause(); spinSnd.currentTime = 0; } catch { } }
    function playWinSound() { if (!winSnd) return; try { winSnd.currentTime = 0; winSnd.play().catch(() => { }); } catch { } }

    function isMenuOpen() { return !!mobileMenu && !mobileMenu.hidden && mobileMenu.classList.contains('open'); }
    function openMenu() {
        if (!mobileMenu || !navToggle) return;
        mobileMenu.hidden = false;
        requestAnimationFrame(() => mobileMenu.classList.add('open'));
        navToggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('no-scroll');
        setTimeout(() => { mobilePanel?.querySelector('a, button')?.focus(); }, 220);
    }
    function closeMenu() {
        if (!mobileMenu || !navToggle) return;
        mobileMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
        setTimeout(() => (mobileMenu.hidden = true), 200);
    }

    function startCelebrationWindow(ms = 2200) { endCelebration(); const id = setTimeout(endCelebration, ms); fx.addTimer(id); }
    function endCelebration() {
        fx.clearTimers();
        try {
            if (confettiLayer) confettiLayer.innerHTML = '';
            if (coinLayer) coinLayer.innerHTML = '';
            if (fireworkLayer) fireworkLayer.innerHTML = '';
            if (pageFX) pageFX.innerHTML = '';
            const ring = document.getElementById('flameRing');
            if (ring) { ring.classList.remove('heatwave'); ring.innerHTML = ''; }
        } catch { }
        document.querySelectorAll('.flame-coin,.coin,.spark,.fw,.sparkler,.sparkler-xl,.fw-xl,.shockwave').forEach(n => n.remove());
        wheelWrap?.classList.remove('do-shake', 'spinning');
        wheelEl?.classList.remove('is-spinning', 'hit');
        stopSpinSound();
    }

    function pulseRingsBurst(times = 2, gap = 140) {
        if (PERF.rm || PERF.low) return;
        const wrap = wheelWrap; if (!wrap) return;
        for (let i = 0; i < Math.min(times, PERF.ringsBurstTimes); i++) {
            const tid = setTimeout(() => {
                const ring = document.createElement('div');
                ring.className = 'bg-ring';
                wrap.querySelector('.wheel-bg')?.appendChild(ring);
                const tid2 = setTimeout(() => ring.remove(), 1200);
                fx.addTimer(tid2);
            }, i * gap);
            fx.addTimer(tid);
        }
    }
    function idleBGKick() { if (PERF.rm) return; const t = setTimeout(() => pulseRingsBurst(1, 180), 400); fx.addTimer(t); }

    async function onSpin() {
        if (isSpinning || !wheelEl || !wheelWrap || !spinBtn) return;
        const allowed = await checkSpinAllowed();
        if (!allowed) { window.location.href = PROMO_URL; return; }
        endCelebration();
        isSpinning = true;
        spinBtn.disabled = true;
        spinBtn.classList.add('is-hidden');
        if (claimBtn) { claimBtn.hidden = true; claimBtn.classList.remove('show'); }
        wheelWrap.classList.add('spinning');
        wheelEl.classList.add('is-spinning');
        pulseRingsBurst(2, 130);
        playSpinSound();
        const chosen = pickSegment();
        const segmentCount = SEGMENTS.length;
        const index = SEGMENTS.findIndex((s) => s.label === chosen.label);
        const segmentAngle = 360 / segmentCount;
        const baseTurns = PERF.low ? 5 : 6;
        const base = 360 * baseTurns;
        const offset = segmentAngle * index + segmentAngle / 2;
        const jitter = rand(-4, 4);
        const finalDeg = base + (360 - offset) + jitter;
        requestAnimationFrame(() => { wheelEl.style.transform = `rotate(${finalDeg}deg)`; });
        const handler = () => {
            wheelEl.removeEventListener('transitionend', handler);
            onSpinEnd(finalDeg, chosen);
            isSpinning = false;
        };
        on(wheelEl, 'transitionend', handler, { once: true });
    }

    function onSpinEnd(finalDeg, chosen) {
        markSpun();
        try { localStorage.setItem(REWARD_KEY, JSON.stringify({ label: chosen.label, value: chosen.value ?? null, date: todayStr() })); } catch { }
        wheelWrap.classList.remove('spinning');
        wheelEl.classList.remove('is-spinning');
        startCelebrationWindow(PERF.rm ? 1200 : 2000);
        screenShake(PERF.low ? 6 : 10, PERF.low ? 360 : 500);
        igniteFlameRing(PERF.rm ? 1000 : 1800, PERF.low ? 16 : 28);
        heatWave(PERF.rm ? 800 : 1600);
        shockwave(PERF.low ? 1 : 2);
        burstFlamingCoins({ count: PERF.coins, embers: !PERF.rm, trails: !PERF.rm });
        burstFireworks();
        burstFireworksFullScreen();
        pulseRingsBurst(2, 140);
        stopSpinSound();
        playWinSound();
        const current = finalDeg % 360;
        wheelEl.style.transition = 'none';
        wheelEl.style.transform = `rotate(${current}deg)`;
        wheelEl.style.setProperty('--final', `${current}deg`);
        void wheelEl.offsetHeight;
        wheelEl.style.transition = '';
        wheelEl.classList.add('hit');
        const tHit = setTimeout(() => wheelEl.classList.remove('hit'), 700); fx.addTimer(tHit);
        const rewardParam = chosen.value ? `${chosen.value}FS` : encodeURIComponent(chosen.label);
        if (claimBtn) {
            claimBtn.href = `${PROMO_URL}?reward=${rewardParam}`;
            claimBtn.hidden = false;
            const tClaim = setTimeout(() => claimBtn.classList.add('show'), 160); fx.addTimer(tClaim);
        }
    }

    function pickSegment(segments = SEGMENTS) {
        const total = segments.reduce((s, seg) => s + seg.weight, 0);
        let r = Math.random() * total;
        for (const seg of segments) { if ((r -= seg.weight) <= 0) return seg; }
        return segments[segments.length - 1];
    }

    function injectHeatStyles() {
        if (document.getElementById('flameStyles')) return;
        const s = document.createElement('style');
        s.id = 'flameStyles';
        s.textContent = '#wheelWrap{position:relative}#flameRing{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:4;filter:drop-shadow(0 0 10px rgba(255,140,0,.35))}#flameRing .flame-jet{position:absolute;left:50%;top:25%;transform:rotate(var(--a)) translate(var(--d)) translate(-50%,-50%);border-radius:999px;background:radial-gradient(closest-side,rgba(255,220,150,.95),rgba(255,105,40,.82) 60%,rgba(150,15,0,.65) 92%,rgba(150,15,0,0) 100%);mix-blend-mode:screen;filter:url(#heatDistort) blur(.2px) drop-shadow(0 0 6px rgba(255,120,0,.5));animation:flameFlicker 240ms infinite alternate}#flameRing.heatwave{filter:url(#heatDistort) drop-shadow(0 0 10px rgba(255,160,0,.4))}@keyframes flameFlicker{from{transform:rotate(var(--a)) translate(var(--d)) translate(-50%,-50%) scale(1);opacity:.96}to{transform:rotate(var(--a)) translate(calc(var(--d) + 2%)) translate(-50%,-50%) scale(1.06);opacity:1}}';
        document.head.appendChild(s);
    }
    function ensureFlameRing() {
        if (!wheelWrap) return null;
        let ring = document.getElementById('flameRing');
        if (!ring) {
            ring = document.createElement('div'); ring.id = 'flameRing';
            const pointer = wheelWrap.querySelector('.wheel-pointer');
            if (pointer) wheelWrap.insertBefore(ring, pointer); else wheelWrap.appendChild(ring);
        }
        return ring;
    }
    function sizeAndCenterFlameRing() {
        const ring = ensureFlameRing(); if (!ring || !wheelEl) return;
        const w = wheelEl.getBoundingClientRect().width || wheelEl.offsetWidth || 600;
        const scale = 1.12;
        ring.style.inset = 'auto';
        ring.style.position = 'absolute';
        ring.style.left = '50%';
        ring.style.top = '50%';
        ring.style.transform = 'translate(-50%,-50%)';
        ring.style.width = `${w * scale}px`;
        ring.style.height = `${w * scale}px`;
    }
    function centerOf(el, relativeTo) {
        const a = el.getBoundingClientRect(); const b = relativeTo.getBoundingClientRect();
        return { x: a.left + a.width / 2 - b.left, y: a.top + a.height / 2 - b.top };
    }
    function igniteFlameRing(duration = 1800, jets = 28) {
        const ring = ensureFlameRing(); if (!ring) return;
        ring.innerHTML = '';
        const frag = document.createDocumentFragment();
        const n = PERF.rm ? 0 : Math.max(8, Math.round(jets * PERF.scale));
        for (let i = 0; i < n; i++) {
            const jet = document.createElement('div');
            jet.className = 'flame-jet';
            jet.style.setProperty('--a', (i / n) * 360 + 'deg');
            jet.style.setProperty('--d', 58 + Math.random() * 6 + '%');
            jet.style.height = 110 + Math.random() * 60 + 'px';
            jet.style.width = 18 + Math.random() * 10 + 'px';
            jet.style.animationDelay = Math.random() * 140 + 'ms';
            frag.appendChild(jet);
        }
        ring.appendChild(frag);
        const tid = setTimeout(() => { ring.innerHTML = ''; }, duration); fx.addTimer(tid);
    }
    function heatWave(duration = 1400) { const ring = document.getElementById('flameRing'); if (!ring) return; ring.classList.add('heatwave'); const tid = setTimeout(() => ring.classList.remove('heatwave'), duration); fx.addTimer(tid); }
    function shockwave(count = 1) {
        const container = coinLayer || fireworkLayer || pageFX;
        const n = Math.max(1, Math.round(count * (PERF.low ? 0.8 : 1)));
        for (let i = 0; i < n; i++) {
            const sw = document.createElement('div');
            sw.className = 'shockwave'; sw.style.left = '50%'; sw.style.top = '50%'; sw.style.animationDelay = `${i * 100}ms`;
            container.appendChild(sw);
            const tid = setTimeout(() => sw.remove(), 1000 + i * 100); fx.addTimer(tid);
        }
    }
    function screenShake(intensity = 8, duration = 450) {
        const el = wheelWrap; if (!el) return;
        el.style.setProperty('--shake-intensity', intensity + 'px');
        el.classList.add('do-shake');
        const tid = setTimeout(() => el.classList.remove('do-shake'), duration + 60); fx.addTimer(tid);
    }
    function burstFireworks() {
        if (!fireworkLayer || !wheelEl || PERF.rm) return;
        const { x: cx, y: cy } = centerOf(wheelEl, fireworkLayer);
        const COLORS = ['#ffd54a', '#f59e0b', '#ffcc33', '#b71c1c', '#8e0e0e', '#fff1a8'];
        const totalBursts = PERF.fireworksBursts;
        const frag = document.createDocumentFragment();
        for (let b = 0; b < totalBursts; b++) {
            const particles = PERF.fireworksParticles;
            const spread = 150 + Math.random() * 60;
            for (let i = 0; i < particles; i++) {
                const theta = (i / particles) * Math.PI * 2 + Math.random() * 0.1;
                const dist = spread + Math.random() * 40;
                const x = Math.cos(theta) * dist; const y = Math.sin(theta) * dist;
                const fw = document.createElement('div'); fw.className = 'fw';
                fw.style.left = cx + 'px'; fw.style.top = cy + 'px';
                fw.style.setProperty('--x', `${x}px`); fw.style.setProperty('--y', `${y}px`);
                fw.style.setProperty('--c', COLORS[(i + b) % COLORS.length]);
                fw.style.animationDelay = `${b * 100}ms`;
                frag.appendChild(fw);
                const tid = setTimeout(() => fw.remove(), 1400 + b * 100); fx.addTimer(tid);
            }
        }
        fireworkLayer.appendChild(frag);
    }
    function randomColor() { const c = ['#ffd54a', '#f59e0b', '#ffcc33', '#b71c1c', '#8e0e0e', '#fff1a8']; return c[Math.floor(Math.random() * c.length)]; }
    function fireworkBurstAt(container, cx, cy, radius = 220, particles = 30, delay = 0) {
        const frag = document.createDocumentFragment();
        for (let i = 0; i < particles; i++) {
            const theta = (i / particles) * Math.PI * 2 + Math.random() * 0.08;
            const dist = radius + Math.random() * 60;
            const x = Math.cos(theta) * dist; const y = Math.sin(theta) * dist;
            const el = document.createElement('div');
            el.className = 'fw'; el.style.left = cx + 'px'; el.style.top = cy + 'px';
            el.style.setProperty('--x', x + 'px'); el.style.setProperty('--y', y + 'px');
            el.style.setProperty('--c', randomColor()); el.style.animationDelay = delay + 'ms';
            frag.appendChild(el);
            const tid = setTimeout(() => el.remove(), 1400 + delay); fx.addTimer(tid);
        }
        container.appendChild(frag);
    }
    function burstFireworksFullScreen() {
        const W = window.innerWidth; const H = window.innerHeight;
        if (!pageFX || PERF.rm || PERF.low) return;
        pageFX.innerHTML = '';
        const centers = [[W * 0.25, H * 0.35], [W * 0.5, H * 0.25], [W * 0.75, H * 0.42]];
        centers.forEach((c, idx) => { const [cx, cy] = c; const delay = idx * 140; fireworkBurstAt(pageFX, cx, cy, 240 + Math.random() * 70, PERF.fireworksParticles, delay); });
        const tid = setTimeout(() => { pageFX.innerHTML = ''; }, 2800); fx.addTimer(tid);
    }
    function burstFlamingCoins({ count = 80, embers = true, trails = true } = {}) {
        if (!coinLayer || !wheelEl) return;
        const n = Math.max(6, Math.round(count));
        const { x: cx, y: cy } = centerOf(wheelEl, coinLayer);
        const frag = document.createDocumentFragment();
        for (let i = 0; i < n; i++) {
            const base = -Math.PI / 2; const spread = Math.PI * 0.9;
            const theta = base + (Math.random() - 0.5) * spread;
            const power = 140 + Math.random() * 160;
            const dx = Math.cos(theta) * power; const dy = Math.sin(theta) * power;
            const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
            const wrap = document.createElement('div');
            wrap.className = 'flame-coin'; wrap.style.left = cx - 8 + 'px'; wrap.style.top = cy - 8 + 'px';
            wrap.style.setProperty('--x', dx + 'px'); wrap.style.setProperty('--y', dy + 'px'); wrap.style.setProperty('--angle', angleDeg + 'deg');
            wrap.style.transformOrigin = 'center'; wrap.style.animationDuration = `${800 + Math.random() * 420}ms`; wrap.style.filter = `blur(${Math.random() * 0.4}px)`;
            const flame = document.createElement('div'); flame.className = 'flame';
            const coin = document.createElement('div'); coin.className = 'coin';
            wrap.appendChild(flame); wrap.appendChild(coin);
            if (trails && !PERF.rm) { const trail = document.createElement('div'); trail.className = 'coin-trail'; trail.style.setProperty('--angle', angleDeg + 'deg'); trail.style.animationDuration = `${620 + Math.random() * 360}ms`; wrap.appendChild(trail); }
            frag.appendChild(wrap);
            if (embers && !PERF.rm) {
                const emberCount = PERF.embersPerCoin;
                for (let e = 0; e < emberCount; e++) {
                    const sp = document.createElement('div'); sp.className = 'spark'; sp.style.left = cx + 'px'; sp.style.top = cy + 'px';
                    const jitter = 40 + Math.random() * 90;
                    const ex = Math.cos(theta + (Math.random() * 0.22 - 0.11)) * jitter;
                    const ey = Math.sin(theta + (Math.random() * 0.22 - 0.11)) * jitter;
                    sp.style.setProperty('--sx', ex + 'px'); sp.style.setProperty('--sy', ey + 'px'); sp.style.animationDuration = `${460 + Math.random() * 380}ms`;
                    frag.appendChild(sp);
                    const t2 = setTimeout(() => sp.remove(), 900); fx.addTimer(t2);
                }
            }
            const t1 = setTimeout(() => wrap.remove(), 1300); fx.addTimer(t1);
        }
        coinLayer.appendChild(frag);
    }
    function ensureBulbsLayer() {
        const wrap = wheelWrap; if (!wrap) return;
        let bulbs = wrap.querySelector('.wheel-lights'); if (bulbs) return;
        bulbs = document.createElement('div'); bulbs.className = 'wheel-lights';
        const flame = document.getElementById('flameRing') || wrap.querySelector('#flameRing');
        if (flame) wrap.insertBefore(bulbs, flame); else wrap.insertBefore(bulbs, wrap.querySelector('.wheel-pointer') || wrap.firstChild);
    }

    const measureCache = new Map();
    function buildWheelSVG() {
        const mount = document.getElementById('wheel-svg'); if (!mount) return;
        mount.innerHTML = '';
        const size = 1000; const r = size / 2; const svgNS = 'http://www.w3.org/2000/svg'; const segAngle = (2 * Math.PI) / SEGMENTS.length;
        const svg = document.createElementNS(svgNS, 'svg'); svg.setAttribute('viewBox', `0 0 ${size} ${size}`); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
        const defs = document.createElementNS(svgNS, 'defs');
        defs.innerHTML =
            '<radialGradient id="bg-grad" cx="50%" cy="50%" r="75%"><stop offset="0%" stop-color="#7a0004"/><stop offset="55%" stop-color="#3f0002"/><stop offset="100%" stop-color="#1a0001"/></radialGradient>' +
            '<linearGradient id="rim-metal" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#fff6c4"/><stop offset="32%" stop-color="#ffd659"/><stop offset="68%" stop-color="#ffb200"/><stop offset="100%" stop-color="#b87700"/></linearGradient>' +
            '<radialGradient id="center-jewel" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#fff6cf"/><stop offset="42%" stop-color="#ffd659"/><stop offset="100%" stop-color="#b87700"/></radialGradient>' +
            '<radialGradient id="gemGrad" cx="50%" cy="50%" r="65%"><stop offset="0%" stop-color="#fff7cf"/><stop offset="55%" stop-color="#ffd659"/><stop offset="100%" stop-color="#b87700"/></radialGradient>' +
            '<filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
            '<filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%"><feOffset dx="0" dy="2"/><feGaussianBlur stdDeviation="3" result="shadow"/><feComposite in="shadow" in2="SourceAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .5 0"/><feBlend in="SourceGraphic" mode="normal"/></filter>';
        svg.appendChild(defs);
        const disk = document.createElementNS(svgNS, 'circle'); disk.setAttribute('cx', r); disk.setAttribute('cy', r); disk.setAttribute('r', r - 18); disk.setAttribute('fill', 'url(#bg-grad)'); disk.setAttribute('filter', 'url(#innerShadow)'); svg.appendChild(disk);
        const PALETTE = [['#b81507', '#b81507'], ['#ff9c00', '#ff9c00']];
        const measureWidth = (text, fontSize = 26) => {
            const key = text + '|' + fontSize;
            if (measureCache.has(key)) return measureCache.get(key);
            const t = document.createElementNS(svgNS, 'text'); t.setAttribute('visibility', 'hidden'); t.setAttribute('font-size', fontSize);
            t.setAttribute('font-family', 'Arial, sans-serif'); t.setAttribute('font-weight', '900'); t.textContent = text; svg.appendChild(t);
            const w = t.getBBox().width; t.remove(); measureCache.set(key, w); return w;
        };
        const MIN_FONT = 18;
        const wrapToLines = (label, font, arcLen, maxLines = 3) => {
            if (label.includes('+')) {
                const [a, b] = label.split('+');
                const lines = [a.trim(), ('+ ' + b.trim())].filter(Boolean);
                if (Math.max(...lines.map(l => measureWidth(l, font))) <= arcLen) return lines;
            }
            const words = label.split(/\s+/); const lines = [''];
            const forceBreakLongWord = (word) => {
                let w = word;
                while (w && lines.length < maxLines) {
                    let lo = 1, hi = w.length, cut = 1;
                    while (lo <= hi) {
                        const mid = Math.max(1, Math.floor((lo + hi) / 2));
                        const candidate = ((lines.at(-1) ? lines.at(-1) + ' ' : '') + w.slice(0, mid) + '-').trim();
                        if (measureWidth(candidate, font) <= arcLen) { cut = mid; lo = mid + 1; } else { hi = mid - 1; }
                    }
                    const head = w.slice(0, cut) + (w.length > cut ? '-' : '');
                    lines[lines.length - 1] = ((lines.at(-1) + ' ' + head).trim());
                    w = w.slice(cut);
                    if (w && lines.length < maxLines) lines.push('');
                }
                if (w) lines[lines.length - 1] = ((lines.at(-1) + ' ' + w).trim());
            };
            for (const w of words) {
                const candidate = ((lines.at(-1) ? lines.at(-1) + ' ' : '') + w).trim();
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
                const p = document.createElementNS(svgNS, 'path'); p.setAttribute('id', id); p.setAttribute('fill', 'none');
                p.setAttribute('d', `M ${ax1} ${ay1} A ${radius} ${radius} 0 0 1 ${ax2} ${ay2}`); defs.appendChild(p); return id;
            });
            lines.forEach((textValue, i) => {
                const t = document.createElementNS(svgNS, 'text'); t.setAttribute('class', grand ? 'seg-label grand-text' : 'seg-label'); t.setAttribute('font-size', font);
                t.style.letterSpacing = (wheelPx < 520 ? '0.4px' : '0.6px');
                const tp = document.createElementNS(svgNS, 'textPath'); tp.setAttribute('href', `#${ids[i]}`); tp.setAttribute('startOffset', '50%'); tp.setAttribute('text-anchor', 'middle'); tp.textContent = textValue;
                t.appendChild(tp); svg.appendChild(t);
            });
        };
        for (let i = 0; i < SEGMENTS.length; i++) {
            const start = i * segAngle - Math.PI / 2; const end = start + segAngle;
            const x1 = r + (r - 30) * Math.cos(start); const y1 = r + (r - 30) * Math.sin(start);
            const x2 = r + (r - 30) * Math.cos(end); const y2 = r + (r - 30) * Math.sin(end);
            const path = document.createElementNS(svgNS, 'path'); path.setAttribute('d', `M ${r} ${r} L ${x1} ${y1} A ${r - 30} ${r - 30} 0 0 1 ${x2} ${y2} Z`);
            const seg = SEGMENTS[i];
            if (seg.grand) {
                const gradId = `grand-grad-${i}`; const grad = document.createElementNS(svgNS, 'linearGradient');
                grad.setAttribute('id', gradId); grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%'); grad.setAttribute('x2', '100%'); grad.setAttribute('y2', '100%');
                grad.innerHTML = '<stop offset="0%" stop-color="#fff6a3"/><stop offset="40%" stop-color="#ffd24a"/><stop offset="100%" stop-color="#c48300"/>';
                defs.appendChild(grad); path.setAttribute('fill', `url(#${gradId})`); path.setAttribute('class', 'grand-seg');
            } else {
                const [c1, c2] = PALETTE[i % PALETTE.length]; const gradId = `seg-grad-${i}`; const grad = document.createElementNS(svgNS, 'linearGradient');
                grad.setAttribute('id', gradId); grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%'); grad.setAttribute('x2', '100%'); grad.setAttribute('y2', '100%');
                grad.innerHTML = `<stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>`;
                defs.appendChild(grad); path.setAttribute('fill', `url(#${gradId})`);
            }
            path.setAttribute('stroke', '#5a0000'); path.setAttribute('stroke-width', '4'); path.setAttribute('filter', 'url(#softGlow)'); svg.appendChild(path);
            const mid = start + segAngle / 2; addCurvedLabel(i, seg.label, mid, seg.grand ? 40 : 36, !!seg.grand);
        }
        const rim = document.createElementNS(svgNS, 'circle'); rim.setAttribute('cx', r); rim.setAttribute('cy', r); rim.setAttribute('r', r - 12);
        rim.setAttribute('fill', 'transparent'); rim.setAttribute('stroke', 'url(#rim-metal)'); rim.setAttribute('stroke-width', '18'); rim.setAttribute('filter', 'url(#softGlow)'); svg.appendChild(rim);
        const studs = 36; const rr = r - 12 - 8;
        for (let i = 0; i < studs; i++) {
            const a = (i / studs) * Math.PI * 2; const cx = r + rr * Math.cos(a); const cy = r + rr * Math.sin(a);
            const dot = document.createElementNS(svgNS, 'circle'); dot.setAttribute('class', 'gem'); dot.setAttribute('cx', cx); dot.setAttribute('cy', cy);
            dot.setAttribute('r', 9); dot.setAttribute('fill', 'url(#gemGrad)'); dot.setAttribute('stroke', 'rgba(120,0,0,.65)'); dot.setAttribute('stroke-width', '1.5'); svg.appendChild(dot);
        }
        const cap = document.createElementNS(svgNS, 'circle'); cap.setAttribute('cx', r); cap.setAttribute('cy', r); cap.setAttribute('r', 84); cap.setAttribute('fill', 'url(#center-jewel)'); cap.setAttribute('filter', 'url(#softGlow)'); svg.appendChild(cap);
        mount.appendChild(svg);
    }

    function injectHeatFilter() {
        if (document.getElementById('heatDistort')) return;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('aria-hidden', 'true'); svg.style.position = 'absolute'; svg.style.width = 0; svg.style.height = 0;
        svg.innerHTML = '<filter id="heatDistort"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.08" numOctaves="2" seed="2"/><feDisplacementMap in="SourceGraphic" scale="12" xChannelSelector="R" yChannelSelector="G"/></filter>';
        document.body.appendChild(svg);
    }

    function ensurePageFX() {
        pageFX = document.getElementById('pageFX');
        if (!pageFX) { pageFX = document.createElement('div'); pageFX.id = 'pageFX'; pageFX.className = 'page-fx'; document.body.appendChild(pageFX); }
    }

    function bindGlobalKeys() {
        const escClose = (e) => { if (e.key === 'Escape' && isMenuOpen()) closeMenu(); };
        const tabTrap = (e) => {
            if (!isMenuOpen() || e.key !== 'Tab') return;
            const list = Array.from(mobilePanel?.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') || []) || [];
            if (!list.length) return;
            const first = list[0]; const last = list[list.length - 1]; const active = document.activeElement;
            if (e.shiftKey && active === first) { last.focus(); e.preventDefault(); }
            else if (!e.shiftKey && active === last) { first.focus(); e.preventDefault(); }
        };
        on(document, 'keydown', escClose, { passive: true });
        on(document, 'keydown', tabTrap);
    }

    function bindMenu() {
        navToggle = document.getElementById('navToggle');
        mobileMenu = document.getElementById('mobileMenu');
        mobilePanel = document.querySelector('#mobileMenu .mobile-menu-panel');
        backdrop = mobileMenu ? mobileMenu.querySelector('.mobile-menu-backdrop') : null;
        closeBtn = document.getElementById('mobileClose');
        on(navToggle, 'click', () => (mobileMenu?.hidden ? openMenu() : closeMenu()));
        on(backdrop, 'click', closeMenu);
        on(closeBtn, 'click', closeMenu);
        bindGlobalKeys();
    }

    function bindWheel() {
        wheelWrap = document.getElementById('wheelWrap');
        wheelEl = document.querySelector('.wheel');
        spinBtn = document.getElementById('spinBtn');
        claimBtn = document.getElementById('claimBtn');
        coinLayer = document.getElementById('coinLayer');
        fireworkLayer = document.getElementById('fireworkLayer');
        setupSounds();
        injectHeatFilter();
        injectHeatStyles();
        ensureFlameRing();
        ensureBulbsLayer();
        ensurePageFX();
        buildWheelSVG();
        if (wheelWrap) wheelWrap.style.marginBottom = '64px';
        if (claimBtn) { claimBtn.style.bottom = 'auto'; claimBtn.style.top = 'calc(100% + 18px)'; }
        let resizeRAF = 0;
        const resizeFn = () => {
            if (resizeRAF) cancelAnimationFrame(resizeRAF);
            resizeRAF = requestAnimationFrame(sizeAndCenterFlameRing);
        };
        sizeAndCenterFlameRing();
        on(window, 'resize', resizeFn, { passive: true });
        initWheel();
    }

    async function initWheel() {
        if (!spinBtn) return;
        const allowed = await checkSpinAllowed();
        if (!allowed) { spinBtn.remove(); spinBtn = null; return; }
        on(spinBtn, 'click', onSpin);
        idleBGKick();
    }

    function initWelcomeModal() {
        const MODAL_KEY = 'mrspinny_welcome_seen';
        const modal = document.getElementById('welcomeModal');
        const openBtn = document.getElementById('openWelcome');
        const openModal = () => { if (!modal) return; modal.hidden = false; requestAnimationFrame(() => modal.classList.add('open')); document.body.classList.add('no-scroll'); };
        const closeModal = () => { if (!modal) return; modal.classList.remove('open'); document.body.classList.remove('no-scroll'); setTimeout(() => (modal.hidden = true), 180); endCelebration(); };
        if (modal && !localStorage.getItem(MODAL_KEY)) {
            const t = setTimeout(openModal, 500); fx.addTimer(t);
            try { localStorage.setItem(MODAL_KEY, '1'); } catch { }
        }
        on(openBtn, 'click', (e) => { e.preventDefault(); openModal(); });
        on(modal, 'click', (e) => { if (e.target.matches('[data-close], .modal-backdrop')) closeModal(); });
        on(document, 'keydown', (e) => { if (e.key === 'Escape' && modal && !modal.hidden) closeModal(); });
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
        try { spinSnd && (spinSnd.pause(), spinSnd.src = '', spinSnd = null); } catch { }
        try { winSnd && (winSnd.pause(), winSnd.src = '', winSnd = null); } catch { }
        inited = false;
    };
})();
