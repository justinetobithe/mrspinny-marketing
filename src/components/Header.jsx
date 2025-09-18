import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Home as HomeIcon, Dice5, Tv, Banknote, Mail, Menu as MenuIcon, X as XIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/LanguageContext";

export default function Header() {
    const { t } = useTranslation();
    const { languages, selectedLanguage, setLanguage } = useLanguage();

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(selectedLanguage.code);

    const [langOpen, setLangOpen] = useState(false);
    const langMenuRef = useRef(null);
    const location = useLocation();

    useEffect(() => setSelected(selectedLanguage.code), [selectedLanguage]);

    useEffect(() => {
        setOpen(false);
        document.body.classList.remove("no-scroll");
        setLangOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.classList.toggle("no-scroll", open);
        return () => document.body.classList.remove("no-scroll");
    }, [open]);

    useEffect(() => {
        function onDocClick(e) {
            if (!langMenuRef.current) return;
            if (!langMenuRef.current.contains(e.target)) setLangOpen(false);
        }
        function onKey(e) {
            if (e.key === "Escape") setLangOpen(false);
        }
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onKey);
        };
    }, []);

    const iconCls = "ico h-4 w-4 stroke-[2] fill-none";
    const menuIconCls = "burger h-6 w-6 stroke-[2] fill-none";

    const onChangeLang = (code) => {
        setSelected(code);
        setLanguage(code); // <- context updates i18n + localStorage
    };

    const renderLangOptions = () =>
        languages.map((l) => (
            <option key={l.code} value={l.code}>
                {l.flag} {l.name}
            </option>
        ));

    const currentLang = languages.find((l) => l.code === selected) || languages[0];

    return (
        <header className="header">
            <div className="container nav">
                <Link className="logo" to="/" aria-label={t("header.aria.brandHome")}>
                    <img src="/assets/images/logo.png" alt="MrSpinny logo" width="120" height="40" />
                </Link>

                <nav className="menu" aria-label="Primary">
                    <NavLink to="/" end>
                        <HomeIcon className={iconCls} aria-hidden="true" />
                        {t("header.nav.home")}
                    </NavLink>
                    <NavLink to="/slots">
                        <Dice5 className={iconCls} aria-hidden="true" />
                        {t("header.nav.slots")}
                    </NavLink>
                    <NavLink to="/live-casino">
                        <Tv className={iconCls} aria-hidden="true" />
                        {t("header.nav.liveCasino")}
                    </NavLink>
                    <NavLink to="/banking">
                        <Banknote className={iconCls} aria-hidden="true" />
                        {t("header.nav.banking")}
                    </NavLink>
                    <NavLink to="/contact">
                        <Mail className={iconCls} aria-hidden="true" />
                        {t("header.nav.contact")}
                    </NavLink>

                    <div className="desktop-lang relative hidden md:flex items-center" ref={langMenuRef}>
                        <span className="text-xl leading-none px-2" aria-hidden="true" title={`${currentLang.flag} ${currentLang.name}`}>
                            {currentLang.flag}
                        </span>
                        <select
                            aria-label="Language"
                            value={selected}
                            onChange={(e) => onChangeLang(e.target.value)}
                            className="lang-select absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            style={{ appearance: "none", WebkitAppearance: "none", MozAppearance: "none", paddingRight: 12 }}
                            title={`${currentLang.flag} ${currentLang.name}`}
                        >
                            {renderLangOptions()}
                        </select>
                    </div>
                </nav>

                <div className="auth-buttons" style={{ gap: 8 }}>
                    <a href="https://mrspinny.com/" className="btn btn-primary">
                        {t("header.cta.playNow")}
                    </a>
                </div>

                <button
                    id="navToggle"
                    className="nav-toggle"
                    aria-controls="mobileMenu"
                    aria-expanded={open ? "true" : "false"}
                    aria-label={t("header.aria.openMenu")}
                    onClick={() => setOpen(true)}
                    type="button"
                >
                    <MenuIcon className={menuIconCls} aria-hidden="true" />
                </button>
            </div>

            <div id="mobileMenu" className={`mobile-menu ${open ? "open" : ""}`} hidden={!open} data-react-menu="1">
                <div className="mobile-menu-backdrop" onClick={() => setOpen(false)} />
                <div className="mobile-menu-panel" role="dialog" aria-modal="true" aria-label={t("header.aria.mainMenu")}>
                    <button className="mobile-close" id="mobileClose" aria-label={t("header.aria.closeMenu")} onClick={() => setOpen(false)} type="button">
                        <XIcon className="h-6 w-6 stroke-[2] fill-none" aria-hidden="true" />
                    </button>

                    <nav className="mobile-links" aria-label="Mobile">
                        <NavLink to="/" end onClick={() => setOpen(false)}>
                            <HomeIcon className={iconCls} aria-hidden="true" />
                            {t("header.nav.home")}
                        </NavLink>
                        <NavLink to="/slots" onClick={() => setOpen(false)}>
                            <Dice5 className={iconCls} aria-hidden="true" />
                            {t("header.nav.slots")}
                        </NavLink>
                        <NavLink to="/live-casino" onClick={() => setOpen(false)}>
                            <Tv className={iconCls} aria-hidden="true" />
                            {t("header.nav.liveCasino")}
                        </NavLink>
                        <NavLink to="/banking" onClick={() => setOpen(false)}>
                            <Banknote className={iconCls} aria-hidden="true" />
                            {t("header.nav.banking")}
                        </NavLink>
                        <NavLink to="/contact" onClick={() => setOpen(false)}>
                            <Mail className={iconCls} aria-hidden="true" />
                            {t("header.nav.contact")}
                        </NavLink>
                    </nav>

                    <hr className="mobile-divider" />

                    <div className="mobile-lang">
                        <select
                            aria-label="Language"
                            value={selected}
                            onChange={(e) => onChangeLang(e.target.value)}
                            className="lang-select"
                            style={{ appearance: "none", WebkitAppearance: "none", MozAppearance: "none", paddingRight: 12, cursor: "pointer" }}
                        >
                            {renderLangOptions()}
                        </select>
                    </div>

                    <ul className="mobile-secondary">
                        <li><a href="#">{t("header.legal.support")}</a></li>
                        <li><a href="#">{t("header.legal.privacyPolicy")}</a></li>
                        <li><a href="#">{t("header.legal.termsOfService")}</a></li>
                        <li><a href="#">{t("header.legal.responsibleGaming")}</a></li>
                    </ul>

                    <div className="mobile-age">{t("header.ageBadge")}</div>

                    <div className="mobile-cta">
                        <a href="https://mrspinny.com/" className="btn btn-primary">
                            {t("header.cta.playNow")}
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
}
