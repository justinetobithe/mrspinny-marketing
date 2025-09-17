import React from 'react';
import { appendAffiliateParams } from '@/utils/affiliate';

export default function TrackedLink({ href, children, ...rest }) {
    const finalHref = typeof window !== 'undefined' ? appendAffiliateParams(href) : href;
    return (
        <a href={finalHref} {...rest}>
            {children}
        </a>
    );
}
