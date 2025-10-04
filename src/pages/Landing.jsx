import { useCallback } from "react";
import { affUrl } from "@/helpers/urls";
import { useModal } from "@/context/ModalContext.jsx";

export default function Landing() {
    const { open } = useModal();

    const handleSpinClick = useCallback((e) => {
        e.preventDefault();
        open("welcome");
    }, [open]);

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
                            data-link-id="landing_spin"
                            onClick={handleSpinClick}
                        >
                            Spin the Wheel
                        </a>
                        <a
                            href={affUrl("https://mrspinny.world/")}
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
                            This page is a marketing preview. Real play is at <a href="https://mrspinny.world/">mrspinny.world</a> for 18+ only.
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

            <noscript>
                <p style={{ textAlign: "center", margin: "16px 0" }}>
                    JavaScript is required to spin the wheel. You can still{" "}
                    <a href="https://mrspinny.world/promotions">view promotions here</a>.
                </p>
            </noscript>
        </main>
    );
}
