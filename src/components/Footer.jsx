import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
    const { t } = useTranslation();
    const year = new Date().getFullYear();
    const supportEmail = "support@mrspinny.com";

    return (
        <footer className="site-footer">
            <div className="container footer-top">
                <NavLink className="footer-brand" to="/" aria-label={t("footer.aria.brandHome")}>
                    <img
                        src="/assets/images/logo.png"
                        alt="MrSpinny logo"
                        width="150"
                        height="50"
                    />
                </NavLink>

                <nav className="footer-links" aria-label="Footer">
                    <div className="footer-col">
                        <h4>{t("footer.columns.games")}</h4>
                        <ul>
                            <li><NavLink to="/slots">{t("footer.links.slots")}</NavLink></li>
                            <li><NavLink to="/live-casino">{t("footer.links.liveCasino")}</NavLink></li>
                            <li><a href="#">{t("footer.links.poker")}</a></li>
                            <li><a href="#">{t("footer.links.lottery")}</a></li>
                            <li><a href="#">{t("footer.links.roulette")}</a></li>
                            <li><NavLink to="/live-casino">{t("footer.links.liveCasino")}</NavLink></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>{t("footer.columns.info")}</h4>
                        <ul>
                            <li><a href="#">{t("footer.links.privacyPolicy")}</a></li>
                            <li><a href="#">{t("footer.links.termsOfService")}</a></li>
                            <li><a href="#">{t("footer.links.responsibleGaming")}</a></li>
                            <li><a href="#">{t("footer.links.support")}</a></li>
                        </ul>
                    </div>
                </nav>

                <div className="footer-badges">
                    <div className="age-badge">{t("header.ageBadge")}</div>
                    <div className="safe-badge">{t("footer.badges.gambleAware")}</div>
                    <div className="safe-badge">{t("footer.badges.responsibleGaming")}</div>
                </div>
            </div>

            <div className="container footer-brands">
                <div className="brand-badge">VISA</div>
                <div className="brand-badge">Mastercard</div>
                <div className="brand-badge">Bitcoin</div>
                <div className="brand-badge">Litecoin</div>
                <div className="brand-badge">Ethereum</div>
                <div className="brand-badge">Tether</div>
                <div className="brand-badge">Dogecoin</div>
                <div className="brand-badge">Interac</div>
                <div className="brand-badge">Ripple</div>
                <div className="brand-badge">Solana</div>
                <div className="brand-badge">USDC</div>
                <div className="brand-badge">TON</div>
                <div className="brand-badge">Bank Transfer</div>
                <div className="brand-badge">UPI</div>
                <div className="brand-badge">Pay</div>
            </div>

            <div className="container footer-legal">
                <p className="legal-copy">
                    {t("footer.legal.operatorLine", { email: supportEmail })}{" "}
                    <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
                </p>
                <p className="copyright">
                    {t("footer.legal.copyright", { year })}
                </p>
            </div>
        </footer>
    );
}
