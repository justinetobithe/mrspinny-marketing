import { appendAffiliateParams, ATTR_TARGETS } from './urls';
import { getAffiliateParams } from './storage';

export function attachLinkDecorator() {
    const handler = (e) => {
        const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
        if (!a || !a.href) return;
        try {
            const u = new URL(a.href, window.location.origin);
            const sameOrigin = u.origin === window.location.origin;
            if (!sameOrigin && ATTR_TARGETS.has(u.hostname)) {
                a.href = appendAffiliateParams(a.href);
            }
        } catch { }
    };
    document.addEventListener('click', handler, { capture: true, passive: true });
    return () => document.removeEventListener('click', handler, { capture: true });
}

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
