import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {
    useEffect(() => {
        const boot = () => window.initMrSpinny && window.initMrSpinny();

        const existing = document.querySelector('script[data-mrspinny="1"]');
        if (!window.initMrSpinny && !existing) {
            const s = document.createElement("script");
            s.src = "/js/script.js";
            s.async = false;
            s.dataset.mrspinny = "1";
            s.onload = boot;
            document.body.appendChild(s);
        } else if (!window.initMrSpinny && existing) {
            const onLoad = () => boot();
            existing.addEventListener("load", onLoad, { once: true });
            return () => existing.removeEventListener("load", onLoad);
        } else {
            boot();
        }

        return () => window.destroyMrSpinny && window.destroyMrSpinny();
    }, []);

    return (
        <main>
            <section
                className="hero"
                style={{ backgroundImage: "url('/assets/images/banner-1.png')" }}
            >
                <div className="hero-blur" aria-hidden="true" />
                <div className="hero-content">
                    <h1>
                        Reveal Your <span>Welcome Bonus</span>
                    </h1>
                    <p>Spin to see your reward. Create an account and deposit to claim.</p>
                    <div className="hero-cta">
                        <a id="openWelcome" href="#welcome" className="btn btn-primary">
                            Spin the Wheel
                        </a>
                        <a href="https://mrspinny.com/" className="btn btn-outline">
                            Play Now
                        </a>
                    </div>
                </div>
            </section>

            <section className="container visual-grid">
                <Link
                    to="/slots"
                    className="feat-card"
                    style={{ "--img": "url('/assets/images/feat-slots.jpg')" }}
                >
                    <div className="feat-badge">Hot</div>
                    <h3>Top Slots</h3>
                    <p>Spin trending reels with daily boosts.</p>
                    <span className="feat-cta">Explore</span>
                </Link>

                <Link
                    to="/live-casino"
                    className="feat-card"
                    style={{ "--img": "url('/assets/images/feat-live.jpg')" }}
                >
                    <div className="feat-badge">Live</div>
                    <h3>Live Casino</h3>
                    <p>Real dealers, instant thrills, anytime.</p>
                    <span className="feat-cta">Enter</span>
                </Link>

                <Link
                    to="/promotions"
                    className="feat-card"
                    style={{ "--img": "url('/assets/images/feat-bonus.jpg')" }}
                >
                    <div className="feat-badge">Bonus</div>
                    <h3>Daily Promos</h3>
                    <p>Reloads, free spins, and surprise drops.</p>
                    <span className="feat-cta">View All</span>
                </Link>
            </section>

            <section id="about" className="container about-wrap">
                <div className="about-media">
                    <img
                        src="/assets/images/about.jpg"
                        alt="Players enjoying MrSpinny games"
                        loading="lazy"
                        width="640"
                        height="420"
                    />
                </div>
                <div className="about-copy">
                    <h2 className="section-title">About MrSpinny</h2>
                    <p>
                        MrSpinny blends fair play, fast payouts, and generous rewards into a
                        smooth casino experience. Enjoy hundreds of premium games,
                        transparent limits, and friendly 24/7 support.
                    </p>
                    <ul className="about-points">
                        <li><span className="ico-dot" />Lightning-fast payouts to cards, bank, and crypto.</li>
                        <li><span className="ico-dot" />Responsible tools: limits, cooldowns, and reality checks.</li>
                        <li><span className="ico-dot" />Daily promos with free spins and reloads.</li>
                        <li><span className="ico-dot" />Secure platform with modern encryption.</li>
                    </ul>
                    <div className="about-actions">
                        <a href="https://mrspinny.com/" className="btn btn-primary">Play Now</a>
                        <a href="#how" className="btn btn-outline">How It Works</a>
                    </div>
                </div>
            </section>

            <section id="why" className="container why-grid">
                <h2 className="section-title">Why Choose Us</h2>
                <div className="why-cards">
                    <div className="why-card">
                        <img src="/assets/images/icon-fast-payouts.png" alt="" width="64" height="64" loading="lazy" />
                        <h3>Fast Payouts</h3>
                        <p>Cash out quickly to your preferred method.</p>
                    </div>
                    <div className="why-card">
                        <img src="/assets/images/icon-fair-secure.png" alt="" width="64" height="64" loading="lazy" />
                        <h3>Fair &amp; Secure</h3>
                        <p>Top-tier security and responsible gaming tools.</p>
                    </div>
                    <div className="why-card">
                        <img src="/assets/images/icon-huge-selection.png" alt="" width="64" height="64" loading="lazy" />
                        <h3>Huge Selection</h3>
                        <p>Slots, tables, and live titles from leading studios.</p>
                    </div>
                    <div className="why-card">
                        <img src="/assets/images/icon-247-support.png" alt="" width="64" height="64" loading="lazy" />
                        <h3>24/7 Support</h3>
                        <p>Real people ready to help, day or night.</p>
                    </div>
                </div>
            </section>

            <section id="how" className="container play-steps">
                <h2 className="section-title">How to Play</h2>
                <div className="steps-grid">
                    <div className="step-card">
                        <img src="/assets/images/how-create.png" alt="Create your MrSpinny account" loading="lazy" />
                        <div className="step-num">1</div>
                        <h3>Create</h3>
                        <p>Open your free account in under a minute.</p>
                    </div>
                    <div className="step-card">
                        <img src="/assets/images/how-deposit.png" alt="Deposit with cards, bank, or crypto" loading="lazy" />
                        <div className="step-num">2</div>
                        <h3>Deposit</h3>
                        <p>Choose cards, bank, or crypto and fund your wallet.</p>
                    </div>
                    <div className="step-card">
                        <img src="/assets/images/how-play.png" alt="Play slots, tables, and live casino" loading="lazy" />
                        <div className="step-num">3</div>
                        <h3>Play</h3>
                        <p>Explore slots, tables, and live casino with promos.</p>
                    </div>
                    <div className="step-card">
                        <img src="/assets/images/how-withdraw.png" alt="Withdraw quickly and securely" loading="lazy" />
                        <div className="step-num">4</div>
                        <h3>Withdraw</h3>
                        <p>Enjoy fast, transparent cashouts when you win.</p>
                    </div>
                </div>
            </section>

            <section className="container gallery">
                <div className="gal-card" style={{ backgroundImage: "url('/assets/images/gal-1.jpg')" }}>
                    <span>Roulette</span>
                </div>
                <div className="gal-card" style={{ backgroundImage: "url('/assets/images/gal-2.jpg')" }}>
                    <span>Blackjack</span>
                </div>
                <div className="gal-card" style={{ backgroundImage: "url('/assets/images/gal-3.jpg')" }}>
                    <span>Slots</span>
                </div>
                <div className="gal-card" style={{ backgroundImage: "url('/assets/images/gal-4.jpg')" }}>
                    <span>Live Tables</span>
                </div>
            </section>

            <section id="faq" className="faq container">
                <h2 className="section-title">Frequently Asked Questions</h2>
                <div className="bank-card" style={{ maxWidth: "980px", margin: "auto" }}>
                    <details open>
                        <summary><b>Is this real money play?</b></summary>
                        <p className="bank-note">
                            This page is a marketing preview. Real play takes place at{" "}
                            <a href="https://mrspinny.com/">mrspinny.com</a> and is for 18+ only,
                            subject to local laws.
                        </p>
                    </details>
                    <details>
                        <summary><b>How do I claim my bonus?</b></summary>
                        <p className="bank-note">
                            Spin the wheel, create an account, make your first deposit, and
                            follow the instructions on the promotions page.
                        </p>
                    </details>
                    <details>
                        <summary><b>What payment methods are supported?</b></summary>
                        <p className="bank-note">
                            Cards, bank transfer, and major crypto options like BTC, ETH, USDT
                            and more. See the Banking page for details.
                        </p>
                    </details>
                    <details>
                        <summary><b>Do you offer support?</b></summary>
                        <p className="bank-note">
                            Yes. Our team is available 24/7 via email and live chat.
                        </p>
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
                            This is a marketing preview (IP). Real play happens at{" "}
                            <a href="https://mrspinny.com/">mrspinny.com</a>. 18+ only.
                        </p>
                    </header>
                    <div className="wheel-wrap" id="wheelWrap">
                        <div className="wheel-bg" aria-hidden="true">
                            {/* <div className="bg-aura" />
                            <div className="bg-aurora" />
                            <div className="bg-stars" />
                            <div className="bg-spot" /> */}
                        </div>
                        {/* <div className="wheel-lights" aria-hidden="true" /> */}
                        <div id="flameRing" className="flame-ring" aria-hidden="true" />
                        <div className="wheel-pointer" aria-hidden="true" />
                        <div id="wheel-svg" className="wheel" aria-live="polite" />
                        <button id="spinBtn" className="btn btn-primary wheel-btn">Spin Now</button>
                        <a id="claimBtn" className="btn btn-claim" href="https://mrspinny.com/promotions" hidden aria-live="polite">Claim Your Bonus</a>
                        {/* <div id="confettiLayer" aria-hidden="true" /> */}
                        {/* <div id="coinLayer" aria-hidden="true" /> */}
                        <div id="fireworkLayer" aria-hidden="true" />
                    </div>
                </div>
            </div>
        </main>
    );
}
