import { db } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { getAffiliateParams } from './storage';

function deviceHint() {
    const ua = navigator.userAgent || '';
    return /Android|iPhone|iPad|iPod/i.test(ua) ? 'mobile'
        : /Mac|Win|Linux/i.test(ua) ? 'desktop'
            : 'unknown';
}

function alreadyLoggedClick(key) {
    try { return !!sessionStorage.getItem(key); } catch { return false; }
}
function markLoggedClick(key) {
    try { sessionStorage.setItem(key, '1'); } catch { }
}

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
    Object.keys(doc).forEach((k) => doc[k] == null && delete doc[k]);

    try {
        await addDoc(collection(db, 'clicks'), doc);
        markLoggedClick(dedupKey);
    } catch { }
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

    try { await addDoc(collection(db, 'leads'), doc); } catch { }
}
