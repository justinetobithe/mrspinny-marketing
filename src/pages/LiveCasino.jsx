// src/pages/LiveCasino.jsx
import { useMemo, useState } from "react";

const LIVE_GAMES = [
    {
        title: "Live Blackjack A",
        type: "blackjack",
        imgVar: "/assets/images/gal-2.jpg",
        href: "#",
    },
    {
        title: "Lightning Roulette",
        type: "roulette",
        imgVar: "/assets/images/gal-1.jpg",
        href: "#",
    },
    {
        title: "Live Baccarat",
        type: "baccarat",
        imgVar: "/assets/images/banner-live.png",
        href: "#",
    },
    {
        title: "Crazy Time",
        type: "game-show",
        imgVar: "/assets/images/banner-live.png",
        href: "#",
    },
    {
        title: "Casino Hold’em",
        type: "poker",
        imgVar: "/assets/images/gal-4.jpg",
        href: "#",
    },
    {
        title: "Auto Roulette",
        type: "roulette",
        imgVar: "/assets/images/gal-1.jpg",
        href: "#",
    },
];

const CATS = [
    ["all", "All"],
    ["blackjack", "Blackjack"],
    ["roulette", "Roulette"],
    ["baccarat", "Baccarat"],
    ["poker", "Poker"],
    ["game-show", "Game Shows"],
];

export default function LiveCasino() {
    const [query, setQuery] = useState("");
    const [cat, setCat] = useState("all");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return LIVE_GAMES.filter((g) => {
            const matchCat = cat === "all" || g.type === cat;
            const matchText = !q || g.title.toLowerCase().includes(q);
            return matchCat && matchText;
        });
    }, [query, cat]);

    return (
        <>
            {/* HERO */}
            <section
                className="hero"
                style={{
                    backgroundImage: "url('/assets/images/banner-3.png')",
                    backgroundPosition: "top",
                }}
            >
                <div className="hero-blur" aria-hidden="true" />
                <div className="hero-content">
                    <h1>
                        Premium <span>Live Casino</span> Tables
                    </h1>
                    <p>Blackjack, Roulette, Baccarat, Poker, and Game Shows in HD.</p>
                    <a href="#" className="btn btn-primary">
                        Enter Live Casino
                    </a>
                </div>
            </section>

            {/* FILTERS */}
            <section className="container live-toolbar">
                <div className="live-search">
                    <input
                        id="liveSearch"
                        type="search"
                        placeholder="Search live tables…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23 6.5 6.5 0 1 0-6.5 6.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 20.49 21.49 19 15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                </div>

                <div className="live-cats">
                    {CATS.map(([value, label]) => (
                        <button
                            key={value}
                            className={`cat${cat === value ? " is-active" : ""}`}
                            data-filter={value}
                            onClick={() => setCat(value)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </section>

            {/* GRID */}
            <section className="container games">
                <h2 className="section-title">🎥 Popular Live Tables</h2>

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
                        >
                            <span className="live-badge">
                                {g.type === "game-show"
                                    ? "Game Show"
                                    : g.type.charAt(0).toUpperCase() + g.type.slice(1)}
                            </span>
                            <span className="live-title">{g.title}</span>
                        </a>
                    ))}
                </div>

                <p id="liveEmpty" className="live-empty" hidden={filtered.length !== 0}>
                    No tables found. Try a different search.
                </p>
            </section>
        </>
    );
}
