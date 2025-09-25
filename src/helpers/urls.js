import { getAffiliateParams } from './storage';

export const ATTR_TARGETS = new Set(['mrspinny.com', 'www.mrspinny.com']);

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

export function affUrl(href) {
    return appendAffiliateParams(href);
}
