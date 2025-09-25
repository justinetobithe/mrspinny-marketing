import { useEffect } from 'react';
import {
    pickAffiliateParams,
    saveAffiliateParams,
    getAffiliateParams,
} from '@/utils/affiliate';

function buildAttributionLink(originalHref) {
    try {
        const url = new URL(originalHref, window.location.origin);
        if (url.hostname !== 'mrspinny.com') return originalHref;

        const saved = getAffiliateParams();
        const to = url.pathname + (url.search || '');
        const attr = new URL('https://mrspinny.com/aff/attribution');
        attr.searchParams.set('to', to);

        Object.entries(saved).forEach(([k, v]) => {
            if (v != null && v !== '') attr.searchParams.set(k, String(v));
        });

        return attr.toString();
    } catch {
        return originalHref;
    }
}

export default function useAffiliateTracking({ cleanUrl = true } = {}) {
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const picked = pickAffiliateParams();
        if (Object.keys(picked).length > 0) {
            saveAffiliateParams(picked);
            if (cleanUrl && window.history.replaceState) {
                const url = new URL(window.location.href);
                Object.keys(picked).forEach((k) => url.searchParams.delete(k));
                window.history.replaceState({}, '', url.toString());
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handler = (e) => {
            const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
            if (!a || !a.href) return;
            try {
                const u = new URL(a.href, window.location.origin);
                if (u.hostname !== 'mrspinny.com') return;
                a.href = buildAttributionLink(a.href);
            } catch { }
        };

        document.addEventListener('click', handler, { capture: true, passive: true });
        return () => document.removeEventListener('click', handler, { capture: true });
    }, []);
}
 
export function affUrl(href) {
    return buildAttributionLink(href);
}
