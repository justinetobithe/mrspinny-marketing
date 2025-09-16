import { NavLink } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="container footer-top">
                <NavLink className="footer-brand" to="/" aria-label="MrSpinny home">
                    <img
                        src="/assets/images/logo.png"
                        alt="MrSpinny logo"
                        width="150"
                        height="50"
                    />
                </NavLink>

                <nav className="footer-links" aria-label="Footer">
                    <div className="footer-col">
                        <h4>Games</h4>
                        <ul>
                            <li><NavLink to="/slots">Slots</NavLink></li>
                            <li><NavLink to="/live-casino">Live Casino</NavLink></li>
                            <li><a href="#">Poker</a></li>
                            <li><a href="#">Lottery</a></li>
                            <li><a href="#">Roulette</a></li>
                            <li><NavLink to="/live-casino">Live Casino</NavLink></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Info</h4>
                        <ul>
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Terms of Service</a></li>
                            <li><a href="#">Responsible Gaming</a></li>
                            <li><a href="#">Support</a></li>
                        </ul>
                    </div>
                </nav>

                <div className="footer-badges">
                    <div className="age-badge">18+</div>
                    <div className="safe-badge">GambleAware</div>
                    <div className="safe-badge">Responsible Gaming</div>
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
                    MrSpinny.com is operated by Decordetails OÜ, Harju maakond, Tallinn, Kesklinna linnaosa,
                    Tornimäe tn 5, 10145, reg. no. 17011692. Gaming is offered in accordance with applicable laws
                    and age restrictions. For help, contact{" "}
                    <a href="mailto:support@mrspinny.com">support@mrspinny.com</a>.
                </p>
                <p className="copyright">© MrSpinny. All rights reserved | 2025.</p>
            </div>
        </footer>
    );
}
