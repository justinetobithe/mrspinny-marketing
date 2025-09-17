import { useEffect } from 'react';
import { pickAffiliateParams, saveAffiliateParams } from '@/utils/affiliate';

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
}
