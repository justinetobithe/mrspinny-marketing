import { useMemo, useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { affUrl } from "@/helpers/urls";
import { logClick } from "@/helpers/logging";
import { getAffiliateParams } from "@/helpers/storage";

const LIVE_GAMES = [
    { title: "Live Blackjack A", type: "blackjack", imgVar: "/assets/images/gallery/live_blackjack.png", href: "#" },
    { title: "Lightning Roulette", type: "roulette", imgVar: "/assets/images/gallery/lightning_roulette.png", href: "#" },
    { title: "Live Baccarat", type: "baccarat", imgVar: "/assets/images/gallery/live_baccarat.png", href: "#" },
    { title: "Crazy Time", type: "game-show", imgVar: "/assets/images/gallery/crazy_time.png", href: "#" },
    { title: "Casino Hold’em", type: "poker", imgVar: "/assets/images/gallery/casino_holdem.png", href: "#" },
    { title: "Auto Roulette", type: "roulette", imgVar: "/assets/images/gallery/auto_roulette.png", href: "#" }
];

export default function LiveCasino() {
    const { t } = useTranslation();
    const [query, setQuery] = useState("");
    const [cat, setCat] = useState("all");
    const domain = "https://mrspinny.world";

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, []);

    const trackClick = useCallback((linkId, extra = {}) => {
        try {
            const aff = getAffiliateParams();
            logClick({ affParams: aff, linkId, ...extra });
        } catch { }
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return LIVE_GAMES.filter((g) => {
            const matchCat = cat === "all" || g.type === cat;
            const matchText = !q || g.title.toLowerCase().includes(q);
            return matchCat && matchText;
        });
    }, [query, cat]);

    const cats = ["all", "blackjack", "roulette", "baccarat", "poker", "game-show"];

    return (
        <>
            <section className="hero" style={{ backgroundImage: "url('/assets/images/banner-3.png')", backgroundPosition: "top" }}>
                <div className="hero-blur" aria-hidden="true" />
                <div className="hero-content">
                    <h1>
                        {t("live.hero.titleA")} <span>{t("live.hero.titleB")}</span> {t("live.hero.titleC")}
                    </h1>
                    <p>{t("live.hero.subtitle")}</p>
                    <a
                        href={affUrl(domain)}
                        className="btn btn-primary"
                        data-link-id="live_hero_play"
                        onClick={() => trackClick("live_hero_play")}
                    >
                        {t("live.hero.cta")}
                    </a>
                </div>
            </section>

            <section className="container live-toolbar" aria-label={t("live.toolbar.ariaLabel")}>
                <div className="live-search">
                    <input
                        id="liveSearch"
                        type="search"
                        placeholder={t("live.toolbar.searchPlaceholder")}
                        aria-label={t("live.toolbar.searchAria")}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23 6.5 6.5 0 1 0-6.5 6.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 20.49 21.49 19 15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                </div>

                <div className="live-cats" role="tablist" aria-label={t("live.toolbar.categoriesAria")}>
                    {cats.map((value) => (
                        <button
                            key={value}
                            className={`cat${cat === value ? " is-active" : ""}`}
                            data-filter={value}
                            role="tab"
                            aria-selected={cat === value}
                            onClick={() => {
                                setCat(value);
                                trackClick("live_filter", { value });
                            }}
                        >
                            {t(`live.cats.${value}`)}
                        </button>
                    ))}
                </div>
            </section>

            <section className="container games">
                <h2 className="section-title">{t("live.sectionTitle")}</h2>

                <div className="live-grid-wrap">
                    <div id="liveGrid" className="live-grid">
                        {filtered.map((g) => (
                            <a
                                key={g.title}
                                className="live-card"
                                href={g.href}
                                data-type={g.type}
                                data-title={g.title}
                                aria-label={g.title}
                                style={{ "--img": `url('${g.imgVar}')` }}
                                data-link-id="live_card"
                                onClick={() => trackClick("live_card", { title: g.title, type: g.type })}
                            >
                                <span className="live-badge">{t(`live.badge.${g.type}`)}</span>
                                <span className="live-title">{g.title}</span>
                            </a>
                        ))}
                    </div>
                </div>

                <p id="liveEmpty" className="live-empty" hidden={filtered.length !== 0}>
                    {t("live.empty")}
                </p>
            </section>
        </>
    );
}
