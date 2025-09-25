export const WHITELIST = new Set([
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
    if (!out.aff && out.affiliate_id) out.aff = out.affiliate_id;
    return out;
}
