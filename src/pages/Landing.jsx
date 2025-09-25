// src/pages/Landing.jsx
import { useEffect, useCallback } from "react";
import { affUrl } from "@/helpers/urls";

export default function Landing() {
    const boot = useCallback(() => {
        if (typeof window.initMrSpinny === "function") {
            try { window.initMrSpinny(); } catch (e) { console.error("initMrSpinny failed:", e); }
        }
    }, []);

    useEffect(() => {
        let removeOnLoad;
        const existing = document.querySelector('script[data-mrspinny="1"]');
        const hasInit = typeof window.initMrSpinny === "function";

        if (!hasInit && !existing) {
            const s = document.createElement("script");
            s.src = "/js/script.js";
            s.defer = true;
            s.dataset.mrspinny = "1";
            s.onload = boot;
            s.onerror = () => console.error("Failed to load /js/script.js");
            document.body.appendChild(s);
        } else if (!hasInit && existing) {
            const onLoad = () => boot();
            existing.addEventListener("load", onLoad, { once: true });
            removeOnLoad = () => existing.removeEventListener("load", onLoad);
        } else {
            boot();
        }

        return () => {
            if (typeof window.destroyMrSpinny === "function") {
                try { window.destroyMrSpinny(); } catch (e) { console.warn("destroyMrSpinny failed:", e); }
            }
            if (removeOnLoad) removeOnLoad();
        };
    }, [boot]);

    const handleSpinClick = useCallback((e) => {
        if (typeof window.initMrSpinny !== "function") {
            e.preventDefault();
            window.location.assign(affUrl("https://mrspinny.com/promotions"));
        }
    }, []);

    return (
        <main>
            <section
                className="promo-hero"
                style={{ backgroundImage: "url('/assets/images/banner-2.png')" }}
            >
                <div className="container">
                    <h1>Spin to Unlock Your <span>Welcome Bonus</span></h1>
                    <p>New players only. Reveal your offer, register, and deposit to claim.</p>
                    <div className="promo-cta">
                        <a
                            id="openWelcome"
                            href="#welcome"
                            className="btn btn-primary"
                            aria-controls="welcomeModal"
                            data-link-id="landing_spin"
                            onClick={handleSpinClick}
                        >
                            Spin the Wheel
                        </a>
                        <a
                            href={affUrl("https://mrspinny.com/")}
                            className="btn btn-outline"
                            data-link-id="landing_play"
                        >
                            Play Now
                        </a>
                    </div>
                </div>
            </section>

            <section className="container why-grid">
                <h2 className="section-title">Why MrSpinny</h2>
                <div className="why-cards">
                    <div className="why-card">
                        <img src="/assets/images/icon-fast-payouts.png" alt="" width="64" height="64" loading="lazy" decoding="async" />
                        <h3>Fast Payouts</h3>
                        <p>Quick withdrawals to cards, bank, and crypto.</p>
                    </div>
                    <div className="why-card">
                        <img src="/assets/images/icon-fair-secure.png" alt="" width="64" height="64" loading="lazy" decoding="async" />
                        <h3>Fair &amp; Secure</h3>
                        <p>Modern security and responsible tools.</p>
                    </div>
                    <div className="why-card">
                        <img src="/assets/images/icon-huge-selection.png" alt="" width="64" height="64" loading="lazy" decoding="async" />
                        <h3>Hundreds of Games</h3>
                        <p>Top slots, tables, and live titles.</p>
                    </div>
                    <div className="why-card">
                        <img src="/assets/images/icon-247-support.png" alt="" width="64" height="64" loading="lazy" decoding="async" />
                        <h3>24/7 Support</h3>
                        <p>Real people, always on.</p>
                    </div>
                </div>
            </section>

            <section className="container play-steps">
                <h2 className="section-title">How It Works</h2>
                <div className="steps-grid">
                    <div className="step-card">
                        <img src="/assets/images/how-create.png" alt="" loading="lazy" decoding="async" />
                        <div className="step-num">1</div>
                        <h3>Spin</h3>
                        <p>Open the wheel to reveal your bonus.</p>
                    </div>
                    <div className="step-card">
                        <img src="/assets/images/how-deposit.png" alt="" loading="lazy" decoding="async" />
                        <div className="step-num">2</div>
                        <h3>Register</h3>
                        <p>Create your MrSpinny account.</p>
                    </div>
                    <div className="step-card">
                        <img src="/assets/images/how-play.png" alt="" loading="lazy" decoding="async" />
                        <div className="step-num">3</div>
                        <h3>Deposit</h3>
                        <p>Choose cards, bank, or crypto.</p>
                    </div>
                    <div className="step-card">
                        <img src="/assets/images/how-withdraw.png" alt="" loading="lazy" decoding="async" />
                        <div className="step-num">4</div>
                        <h3>Claim &amp; Play</h3>
                        <p>Activate your offer and start playing.</p>
                    </div>
                </div>
            </section>

            <section className="container bank-panels">
                <div className="bank-card">
                    <h3>Popular Methods</h3>
                    <ul className="bank-steps">
                        <li>Visa / Mastercard</li>
                        <li>Bank Transfer</li>
                        <li>Crypto (BTC, ETH, USDT)</li>
                    </ul>
                </div>
                <div className="bank-card">
                    <h3>Fair Limits</h3>
                    <ul className="bank-limits">
                        <li>Transparent min/max per method</li>
                        <li>Fast KYC when required</li>
                    </ul>
                </div>
                <div className="bank-card">
                    <h3>Support</h3>
                    <p className="bank-note">24/7 via chat and email</p>
                </div>
            </section>

            <section className="faq container">
                <h2 className="section-title">FAQ</h2>
                <div className="bank-card" style={{ maxWidth: 980, margin: "auto" }}>
                    <details open>
                        <summary><b>Is this real money?</b></summary>
                        <p className="bank-note">
                            This page is a marketing preview. Real play is at <a href="https://mrspinny.com/">mrspinny.com</a> for 18+ only.
                        </p>
                    </details>
                    <details>
                        <summary><b>How do I claim?</b></summary>
                        <p className="bank-note">Spin, register, deposit, then follow the Promotions page instructions.</p>
                    </details>
                    <details>
                        <summary><b>Any restrictions?</b></summary>
                        <p className="bank-note">Offers are subject to local laws and T&amp;Cs. See details on the promos page.</p>
                    </details>
                </div>
            </section>

            <div id="welcomeModal" className="modal" hidden>
                <div className="modal-backdrop" data-close />
                <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="wmTitle">
                    <button className="modal-close" aria-label="Close" data-close>×</button>
                    <header className="modal-head">
                        <h2 id="wmTitle">Spin for a Welcome Bonus</h2>
                        <p className="modal-sub">
                            This is a marketing preview (IP). Real play happens at <a href="https://mrspinny.com/">mrspinny.com</a>. 18+ only.
                        </p>
                    </header>
                    <div className="wheel-wrap" id="wheelWrap">
                        <div className="wheel-bg" aria-hidden="true">
                            <div className="bg-aura" />
                            <div className="bg-aurora" />
                            <div className="bg-stars" />
                            <div className="bg-spot" />
                        </div>
                        <div className="wheel-lights" aria-hidden="true" />
                        <div id="flameRing" className="flame-ring" aria-hidden="true" />
                        <div className="wheel-pointer" aria-hidden="true" />
                        <div id="wheel-svg" className="wheel" aria-live="polite" />
                        <button id="spinBtn" className="btn btn-primary wheel-btn">Spin Now</button>
                        <a id="claimBtn" className="btn btn-claim" href="https://mrspinny.com/promotions" hidden aria-live="polite">Claim Your Bonus</a>
                        <div id="confettiLayer" aria-hidden="true" />
                        <div id="coinLayer" aria-hidden="true" />
                        <div id="fireworkLayer" aria-hidden="true" />
                    </div>
                </div>
            </div>

            <noscript>
                <p style={{ textAlign: "center", margin: "16px 0" }}>
                    JavaScript is required to spin the wheel. You can still{" "}
                    <a href="https://mrspinny.com/promotions">view promotions here</a>.
                </p>
            </noscript>
        </main>
    );
}
