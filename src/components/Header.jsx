import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

export default function Header() {
    const [open, setOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setOpen(false);
        document.body.classList.remove('no-scroll');
    }, [location.pathname]);

    useEffect(() => {
        document.body.classList.toggle('no-scroll', open);
        return () => document.body.classList.remove('no-scroll');
    }, [open]);

    return (
        <header className="header">
            <div className="container nav">
                <Link className="logo" to="/" aria-label="MrSpinny home">
                    <img src="/assets/images/logo.png" alt="MrSpinny logo" width="120" height="40" />
                </Link>

                <nav className="menu" aria-label="Primary">
                    <NavLink to="/" end>
                        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 3l9 8h-2v8h-5v-5H10v5H5v-8H3l9-8z" />
                        </svg>
                        Home
                    </NavLink>
                    <NavLink to="/slots">
                        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 7h18v10H3zM5 5h14v2H5zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
                        </svg>
                        Slots
                    </NavLink>
                    <NavLink to="/live-casino">
                        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M4 6h16v10H4zM2 18h20v2H2zM8 8h2v6H8zM14 8h2v6h-2z" />
                        </svg>
                        Live Casino
                    </NavLink>
                    <NavLink to="/banking">
                        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 10h18v2H3zm2 3h2v5H5zm4 0h2v5H9zm4 0h2v5h-2zm4 0h2v5h-2zM3 8l9-5 9 5H3z" />
                        </svg>
                        Banking
                    </NavLink>
                    <NavLink to="/contact">
                        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M4 6h16v12H4z" />
                            <path d="M4 6l8 6 8-6" />
                        </svg>
                        Contact
                    </NavLink>
                </nav>

                <div className="auth-buttons">
                    <a href="https://mrspinny.com/" className="btn btn-primary">Play Now</a>
                </div>

                <button
                    id="navToggle"
                    className="nav-toggle"
                    aria-controls="mobileMenu"
                    aria-expanded={open ? "true" : "false"}
                    aria-label="Open Menu"
                    onClick={() => setOpen(true)}
                >
                    <svg className="burger" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <line className="burger-line top" x1="3" y1="6" x2="21" y2="6"></line>
                        <line className="burger-line middle" x1="3" y1="12" x2="21" y2="12"></line>
                        <line className="burger-line bottom" x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div
                id="mobileMenu"
                className={`mobile-menu ${open ? 'open' : ''}`}
                hidden={!open}
                data-react-menu="1"
            >
                <div className="mobile-menu-backdrop" onClick={() => setOpen(false)} />
                <div className="mobile-menu-panel" role="dialog" aria-modal="true" aria-label="Main Menu">
                    <button className="mobile-close" id="mobileClose" aria-label="Close Menu" onClick={() => setOpen(false)}>×</button>

                    <nav className="mobile-links" aria-label="Mobile">
                        <NavLink to="/" end onClick={() => setOpen(false)}>Home</NavLink>
                        <NavLink to="/slots" onClick={() => setOpen(false)}>Slots</NavLink>
                        <NavLink to="/live-casino" onClick={() => setOpen(false)}>Live Casino</NavLink>
                        <NavLink to="/banking" onClick={() => setOpen(false)}>Banking</NavLink>
                        <NavLink to="/contact" onClick={() => setOpen(false)}>Contact</NavLink>
                    </nav>

                    <hr className="mobile-divider" />
                    <div className="mobile-lang">
                        <button className="lang-select">
                            <img src="https://flagcdn.com/w20/gb.png" alt="" /> English
                            <svg viewBox="0 0 24 24" className="chev"><path d="M7 10l5 5 5-5" /></svg>
                        </button>
                    </div>

                    <ul className="mobile-secondary">
                        <li><a href="#">Support</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                        <li><a href="#">Terms of Service</a></li>
                        <li><a href="#">Responsible Gaming</a></li>
                    </ul>

                    <div className="mobile-age">18+</div>
                    <div className="mobile-cta">
                        <a href="https://mrspinny.com/" className="btn btn-primary">Play Now</a>
                    </div>
                </div>
            </div>
        </header>
    );
}
