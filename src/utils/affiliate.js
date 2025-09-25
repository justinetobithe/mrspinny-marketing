// src/utils/affiliate.js
import { db } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';

const STORAGE_KEY = 'affiliate_params';

// Domains that should receive the attribution params automatically
const ATTR_TARGETS = new Set([
    'mrspinny.com',
    'www.mrspinny.com',
]);

// -------------- param helpers --------------
const WHITELIST = new Set([
    'aff', 'affiliate_id',
    'sub1', 'sub2', 'sub3', 'sub4', 'sub5',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'click_id', 'gclid', 'fbclid'
]);

export function pickAffiliateParams(searchParams = new URLSearchParams(window.location.search)) {
    const out = {};
    for (const [k, v] of searchParams.entries()) {
        if (WHITELIST.has(k) && v != null && v !== '') out[k] = v;
    }
    // Normalize: support affiliate_id alias
    if (!out.aff && out.affiliate_id) out.aff = out.affiliate_id;
    return out;
}

export function saveAffiliateParams(params) {
    if (!params || Object.keys(params).length === 0) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(params)); } catch { }
}

export function getAffiliateParams() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

// Build a URL with saved attribution params
export function appendAffiliateParams(href) {
    try {
        const url = new URL(href, window.location.origin);
        const saved = getAffiliateParams();
        Object.entries(saved).forEach(([k, v]) => {
            if (v != null && v !== '' && !url.searchParams.has(k)) {
                url.searchParams.set(k, v);
            }
        });
        return url.toString();
    } catch {
        return href;
    }
}

// Sugar for buttons/redirects
export function affUrl(href) {
    return appendAffiliateParams(href);
}

// -------------- logging helpers --------------
function deviceHint() {
    const ua = navigator.userAgent || '';
    const m = /Android|iPhone|iPad|iPod/i.test(ua) ? 'mobile'
        : /Mac|Win|Linux/i.test(ua) ? 'desktop'
            : 'unknown';
    return m;
}

// Dedup per session so we don’t spam clicks
function alreadyLoggedClick(key) {
    try {
        const s = sessionStorage.getItem(key);
        return !!s;
    } catch { return false; }
}
function markLoggedClick(key) {
    try { sessionStorage.setItem(key, '1'); } catch { }
}

// write-only per your Firestore rules
export async function logClick({ affParams, linkId = null } = {}) {
    if (!affParams || !affParams.aff) return;

    const dedupKey = `click_${affParams.aff}_${new URL(window.location.href).pathname}`;
    if (alreadyLoggedClick(dedupKey)) return;

    const doc = {
        affId: String(affParams.aff),
        linkId: linkId ? String(linkId) : null,
        campaign: affParams.utm_campaign || null,
        source: affParams.utm_source || null,
        sub1: affParams.sub1 || null,
        sub2: affParams.sub2 || null,
        sub3: affParams.sub3 || null,
        sub4: affParams.sub4 || null,
        sub5: affParams.sub5 || null,
        ua: navigator.userAgent || '',
        ref: document.referrer || '',
        device: deviceHint(),
        ts: new Date()
    };

    // remove nulls to keep rules simple
    Object.keys(doc).forEach((k) => doc[k] == null && delete doc[k]);

    try {
        await addDoc(collection(db, 'clicks'), doc);
        markLoggedClick(dedupKey);
    } catch (e) {
        // fail-soft on client
        // console.warn('click log failed', e);
    }
}

export async function logLead({ status = 'new', extra = {} } = {}) {
    const p = getAffiliateParams();
    if (!p.aff) return;

    const doc = {
        affId: String(p.aff),
        linkId: extra.linkId || null,
        campaign: p.utm_campaign || null,
        source: p.utm_source || null,
        sub1: p.sub1 || null,
        sub2: p.sub2 || null,
        sub3: p.sub3 || null,
        sub4: p.sub4 || null,
        sub5: p.sub5 || null,
        email: extra.email || null,
        name: extra.name || null,
        country: extra.country || null,
        status,
        ts: new Date()
    };
    Object.keys(doc).forEach((k) => doc[k] == null && delete doc[k]);

    try { await addDoc(collection(db, 'leads'), doc); } catch (e) { }
}

// -------------- DOM helpers --------------
// For every <a> click, append params if going to mrspinny.com
export function attachLinkDecorator() {
    const handler = (e) => {
        const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
        if (!a || !a.href) return;
        try {
            const u = new URL(a.href, window.location.origin);

            // don’t touch in-app SPA routes (same origin) — we persist in storage instead
            const sameOrigin = u.origin === window.location.origin;

            // only decorate external links to real site(s)
            if (!sameOrigin && ATTR_TARGETS.has(u.hostname)) {
                a.href = appendAffiliateParams(a.href);
            }
        } catch { }
    };
    document.addEventListener('click', handler, { capture: true, passive: true });
    return () => document.removeEventListener('click', handler, { capture: true });
}

// For <form action="https://mrspinny.com/..."> add hidden inputs with params
export function attachFormDecorator() {
    const onSubmit = (e) => {
        const form = e.target;
        if (!(form && form.tagName === 'FORM')) return;
        try {
            const action = form.getAttribute('action') || '';
            if (!action) return;
            const u = new URL(action, window.location.origin);
            if (!ATTR_TARGETS.has(u.hostname)) return;

            const params = getAffiliateParams();
            Object.entries(params).forEach(([k, v]) => {
                if (!v) return;
                // If action is GET, append to URL; if POST, add hidden input
                if ((form.method || '').toUpperCase() === 'GET') {
                    if (!u.searchParams.has(k)) u.searchParams.set(k, v);
                } else {
                    if (!form.querySelector(`input[name="${k}"]`)) {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = k;
                        input.value = v;
                        form.appendChild(input);
                    }
                }
            });

            if ((form.method || '').toUpperCase() === 'GET') {
                form.setAttribute('action', u.toString());
            }
        } catch { }
    };
    document.addEventListener('submit', onSubmit, true);
    return () => document.removeEventListener('submit', onSubmit, true);
}
