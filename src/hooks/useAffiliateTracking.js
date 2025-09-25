import { useEffect } from 'react';
import { pickAffiliateParams } from '@/helpers/params';
import { saveAffiliateParams } from '@/helpers/storage';
import { attachLinkDecorator, attachFormDecorator } from '@/helpers/decorators';
import { logClick, attachOutboundClickLogger } from '@/helpers/logging';

export default function useAffiliateTracking({ cleanUrl = true } = {}) {
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const picked = pickAffiliateParams();
        if (Object.keys(picked).length > 0) {
            saveAffiliateParams(picked);
            logClick({ affParams: picked });
            if (cleanUrl && window.history.replaceState) {
                const url = new URL(window.location.href);
                Object.keys(picked).forEach(k => url.searchParams.delete(k));
                window.history.replaceState({}, '', url.toString());
            }
        }
    }, [cleanUrl]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const detachLinks = attachLinkDecorator();
        const detachForms = attachFormDecorator();
        const detachOutbound = attachOutboundClickLogger();
        return () => {
            detachLinks && detachLinks();
            detachForms && detachForms();
            detachOutbound && detachOutbound();
        };
    }, []);
}
