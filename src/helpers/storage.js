const STORAGE_KEY = 'affiliate_params';

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
