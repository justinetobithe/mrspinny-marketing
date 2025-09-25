import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAffiliateParams } from './storage';

function deviceHint() {
    const ua = navigator.userAgent || '';
    if (/Android|iPhone|iPad|iPod/i.test(ua)) return 'mobile';
    if (/Mac|Win|Linux/i.test(ua)) return 'desktop';
    return 'unknown';
}

function alreadyLoggedClick(key) {
    try { return !!sessionStorage.getItem(key); } catch { return false; }
}
function markLoggedClick(key) {
    try { sessionStorage.setItem(key, '1'); } catch { }
}

export async function logClick({ affParams, linkId = null } = {}) {
    if (!affParams || !affParams.aff) return;
    const dedupKey = `click_${affParams.aff}_${new URL(window.location.href).pathname}${linkId ? '_' + linkId : ''}`;
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
        createdAt: serverTimestamp()
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
        topic: extra.topic || null,
        status,
        createdAt: serverTimestamp()
    };
    Object.keys(doc).forEach((k) => doc[k] == null && delete doc[k]);

    try { await addDoc(collection(db, 'leads'), doc); } catch { }
}

export function attachOutboundClickLogger() {
    const handler = (e) => {
        const a = e.target && e.target.closest ? e.target.closest('a[href][data-link-id]') : null;
        if (!a) return;
        const params = getAffiliateParams();
        if (!params.aff) return;
        const linkId = a.getAttribute('data-link-id') || null;
        logClick({ affParams: params, linkId });
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
}
