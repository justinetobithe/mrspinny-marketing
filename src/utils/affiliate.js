
const STORAGE_KEY = 'affiliate_params';

const WHITELIST = new Set([
    'aff', 'affiliate_id', 'sub1', 'sub2', 'sub3', 'sub4', 'sub5',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'click_id', 'gclid', 'fbclid'
]);

export function pickAffiliateParams(searchParams = new URLSearchParams(window.location.search)) {
    const out = {};
    for (const [k, v] of searchParams.entries()) {
        if (WHITELIST.has(k) && v != null && v !== '') out[k] = v;
    }
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

export function appendAffiliateParams(href) {
    try {
        const url = new URL(href, window.location.origin);
        const saved = getAffiliateParams();
        Object.entries(saved).forEach(([k, v]) => {
            if (!url.searchParams.has(k)) url.searchParams.set(k, v);
        });
        return url.toString();
    } catch {
        return href;
    }
}

export function buildShareUrl({ path = '/', base = window.location.origin, aff, extras = {} } = {}) {
    const url = new URL(path, base);
    if (aff) url.searchParams.set('aff', String(aff));
    Object.entries(extras).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    return url.toString();
}
