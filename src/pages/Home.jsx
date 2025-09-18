import { useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function Home() {
    const { t } = useTranslation();
    const domain = "https://mrspinny.com";
    const plainDomain = "mrspinny.com";

    const boot = useCallback(() => {
        if (typeof window.initMrSpinny === "function") {
            try {
                window.initMrSpinny();
            } catch (e) {
                console.error("initMrSpinny failed:", e);
            }
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
                try {
                    window.destroyMrSpinny();
                } catch (e) {
                    console.warn("destroyMrSpinny failed:", e);
                }
            }
            if (removeOnLoad) removeOnLoad();
        };
    }, [boot]);

    const handleSpinClick = useCallback((e) => {
        if (typeof window.initMrSpinny !== "function") {
            e.preventDefault();
            window.location.assign(`${domain}/promotions`);
        }
    }, []);

    return (
        <main>
            <section
                className="hero"
                style={{ backgroundImage: "url('/assets/images/banner-5.png')" }}
            >
                <div className="hero-blur" aria-hidden="true" />
                <div className="hero-content">
                    <h1>
                        {t("home.hero.titleA")} <span>{t("home.hero.titleB")}</span>
                    </h1>
                    <p>{t("home.hero.subtitle")}</p>
                    <div className="hero-cta">
                        <a
                            id="openWelcome"
                            href="#welcome"
                            className="btn btn-primary"
                            aria-controls="welcomeModal"
                            onClick={handleSpinClick}
                        >
                            {t("home.hero.cta.spin")}
                        </a>
                        <a href={domain} className="btn btn-outline">
                            {t("header.cta.playNow")}
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
                    <div className="feat-badge">{t("home.cards.slots.badge")}</div>
                    <h3>{t("home.cards.slots.title")}</h3>
                    <p>{t("home.cards.slots.desc")}</p>
                    <span className="feat-cta">{t("home.cards.slots.cta")}</span>
                </Link>

                <Link
                    to="/live-casino"
                    className="feat-card"
                    style={{ "--img": "url('/assets/images/feat-live.jpg')" }}
                >
                    <div className="feat-badge">{t("home.cards.live.badge")}</div>
                    <h3>{t("home.cards.live.title")}</h3>
                    <p>{t("home.cards.live.desc")}</p>
                    <span className="feat-cta">{t("home.cards.live.cta")}</span>
                </Link>

                <Link
                    to="/promotions"
                    className="feat-card"
                    style={{ "--img": "url('/assets/images/feat-bonus.jpg')" }}
                >
                    <div className="feat-badge">{t("home.cards.promos.badge")}</div>
                    <h3>{t("home.cards.promos.title")}</h3>
                    <p>{t("home.cards.promos.desc")}</p>
                    <span className="feat-cta">{t("home.cards.promos.cta")}</span>
                </Link>
            </section>

            <section id="about" className="container about-wrap">
                <div className="about-media">
                    <img
                        src="/assets/images/about-us.png"
                        alt={t("home.about.alt")}
                        loading="lazy"
                        decoding="async"
                        width="640"
                        height="420"
                    />
                </div>
                <div className="about-copy">
                    <h2 className="section-title">{t("home.about.title")}</h2>
                    <p>{t("home.about.body")}</p>
                    <ul className="about-points">
                        <li>
                            <span className="ico-dot" />
                            {t("home.about.points.p1")}
                        </li>
                        <li>
                            <span className="ico-dot" />
                            {t("home.about.points.p2")}
                        </li>
                        <li>
                            <span className="ico-dot" />
                            {t("home.about.points.p3")}
                        </li>
                        <li>
                            <span className="ico-dot" />
                            {t("home.about.points.p4")}
                        </li>
                    </ul>
                    <div className="about-actions">
                        <a href={domain} className="btn btn-primary">
                            {t("header.cta.playNow")}
                        </a>
                        <a href="#how" className="btn btn-outline">
                            {t("home.about.cta.how")}
                        </a>
                    </div>
                </div>
            </section>

            <section id="why" className="container why-grid">
                <h2 className="section-title">{t("home.why.title")}</h2>
                <div className="why-cards">
                    <div className="why-card">
                        <img
                            src="/assets/images/icon-fast-payouts.png"
                            alt=""
                            width="64"
                            height="64"
                            loading="lazy"
                            decoding="async"
                        />
                        <h3>{t("home.why.items.fast.title")}</h3>
                        <p>{t("home.why.items.fast.desc")}</p>
                    </div>
                    <div className="why-card">
                        <img
                            src="/assets/images/icon-fair-secure.png"
                            alt=""
                            width="64"
                            height="64"
                            loading="lazy"
                            decoding="async"
                        />
                        <h3>{t("home.why.items.secure.title")}</h3>
                        <p>{t("home.why.items.secure.desc")}</p>
                    </div>
                    <div className="why-card">
                        <img
                            src="/assets/images/icon-huge-selection.png"
                            alt=""
                            width="64"
                            height="64"
                            loading="lazy"
                            decoding="async"
                        />
                        <h3>{t("home.why.items.selection.title")}</h3>
                        <p>{t("home.why.items.selection.desc")}</p>
                    </div>
                    <div className="why-card">
                        <img
                            src="/assets/images/icon-247-support.png"
                            alt=""
                            width="64"
                            height="64"
                            loading="lazy"
                            decoding="async"
                        />
                        <h3>{t("home.why.items.support.title")}</h3>
                        <p>{t("home.why.items.support.desc")}</p>
                    </div>
                </div>
            </section>

            <section id="how" className="container play-steps">
                <h2 className="section-title">{t("home.how.title")}</h2>
                <div className="steps-grid">
                    <div className="step-card">
                        <img
                            src="/assets/images/how-create.png"
                            alt={t("home.how.steps.create.alt")}
                            loading="lazy"
                            decoding="async"
                        />
                        <div className="step-num">1</div>
                        <h3>{t("home.how.steps.create.title")}</h3>
                        <p>{t("home.how.steps.create.desc")}</p>
                    </div>
                    <div className="step-card">
                        <img
                            src="/assets/images/how-deposit.png"
                            alt={t("home.how.steps.deposit.alt")}
                            loading="lazy"
                            decoding="async"
                        />
                        <div className="step-num">2</div>
                        <h3>{t("home.how.steps.deposit.title")}</h3>
                        <p>{t("home.how.steps.deposit.desc")}</p>
                    </div>
                    <div className="step-card">
                        <img
                            src="/assets/images/how-play.png"
                            alt={t("home.how.steps.play.alt")}
                            loading="lazy"
                            decoding="async"
                        />
                        <div className="step-num">3</div>
                        <h3>{t("home.how.steps.play.title")}</h3>
                        <p>{t("home.how.steps.play.desc")}</p>
                    </div>
                    <div className="step-card">
                        <img
                            src="/assets/images/how-withdraw.png"
                            alt={t("home.how.steps.withdraw.alt")}
                            loading="lazy"
                            decoding="async"
                        />
                        <div className="step-num">4</div>
                        <h3>{t("home.how.steps.withdraw.title")}</h3>
                        <p>{t("home.how.steps.withdraw.desc")}</p>
                    </div>
                </div>
            </section>

            <section className="container gallery">
                <div
                    className="gal-card"
                    style={{ backgroundImage: "url('/assets/images/gal-1.jpg')" }}
                >
                    <span>{t("home.gallery.roulette")}</span>
                </div>
                <div
                    className="gal-card"
                    style={{ backgroundImage: "url('/assets/images/gal-2.jpg')" }}
                >
                    <span>{t("home.gallery.blackjack")}</span>
                </div>
                <div
                    className="gal-card"
                    style={{ backgroundImage: "url('/assets/images/gal-3.jpg')" }}
                >
                    <span>{t("home.gallery.slots")}</span>
                </div>
                <div
                    className="gal-card"
                    style={{ backgroundImage: "url('/assets/images/gal-4.jpg')" }}
                >
                    <span>{t("home.gallery.liveTables")}</span>
                </div>
            </section>

            <section id="faq" className="faq container">
                <h2 className="section-title">{t("home.faq.title")}</h2>
                <div className="bank-card" style={{ maxWidth: "980px", margin: "auto" }}>
                    <details open>
                        <summary>
                            <b>{t("home.faq.q1.q")}</b>
                        </summary>
                        <p className="bank-note">
                            {t("home.faq.q1.a", { domain: plainDomain })}{" "}
                            <a href={domain}>mrspinny.com</a>
                        </p>
                    </details>
                    <details>
                        <summary>
                            <b>{t("home.faq.q2.q")}</b>
                        </summary>
                        <p className="bank-note">{t("home.faq.q2.a")}</p>
                    </details>
                    <details>
                        <summary>
                            <b>{t("home.faq.q3.q")}</b>
                        </summary>
                        <p className="bank-note">{t("home.faq.q3.a")}</p>
                    </details>
                    <details>
                        <summary>
                            <b>{t("home.faq.q4.q")}</b>
                        </summary>
                        <p className="bank-note">{t("home.faq.q4.a")}</p>
                    </details>
                </div>
            </section>

            <div id="welcomeModal" className="modal" hidden>
                <div className="modal-backdrop" data-close />
                <div
                    className="modal-panel"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="wmTitle"
                >
                    <button className="modal-close" aria-label="Close" data-close>
                        ×
                    </button>
                    <header className="modal-head">
                        <h2 id="wmTitle">{t("home.modal.title")}</h2>
                        <p className="modal-sub">
                            {t("home.modal.sub", { domain: plainDomain })}{" "}
                            <a href={domain}>mrspinny.com</a>.
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
                        <button id="spinBtn" className="btn btn-primary wheel-btn">
                            {t("home.modal.spin")}
                        </button>
                        <a
                            id="claimBtn"
                            className="btn btn-claim"
                            href={`${domain}/promotions`}
                            hidden
                            aria-live="polite"
                        >
                            {t("home.modal.claim")}
                        </a>
                        <div id="confettiLayer" aria-hidden="true" />
                        <div id="coinLayer" aria-hidden="true" />
                        <div id="fireworkLayer" aria-hidden="true" />
                    </div>
                </div>
            </div>

            <noscript>
                <p style={{ textAlign: "center", margin: "16px 0" }}>
                    {t("home.noscript.text")}{" "}
                    <a href={`${domain}/promotions`}>{t("home.noscript.link")}</a>.
                </p>
            </noscript>
        </main>
    );
}
