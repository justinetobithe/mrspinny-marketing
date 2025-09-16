// src/pages/Slots.jsx
import { useEffect, useMemo, useState, useCallback } from "react";

const FAV_KEY = "mrspinny_faves";

const SLOT_DATA = [
    {
        title: "Sweet Bonanza",
        tags: ["popular", "classic"],
        vol: 2,
        img: "/assets/images/games/sweet-bonanza.jpg",
        href: "https://mrspinny.com/games",
        ribbon: "Daily Drops",
        ribbonAlt: false,
    },
    {
        title: "Gates of Olympus",
        tags: ["popular", "megaways"],
        vol: 3,
        img: "/assets/images/games/gates-of-olympus.jpg",
        href: "https://mrspinny.com/games",
    },
    {
        title: "5 Lions Megaways",
        tags: ["megaways", "new"],
        vol: 3,
        img: "/assets/images/games/5-lions-of-megaways.jpg",
        href: "https://mrspinny.com/games",
        ribbon: "Hot",
        ribbonAlt: true,
    },
    {
        title: "Zeus the Thunderer",
        tags: ["jackpot", "popular"],
        vol: 2,
        img: "/assets/images/games/thunder-olympus.jpg",
        href: "https://mrspinny.com/games",
    },
    {
        title: "Big Bass Bonanza",
        tags: ["classic", "popular"],
        vol: 1,
        img: "/assets/images/game5.jpg",
        href: "https://mrspinny.com/games",
    },
    {
        title: "Book of Gold",
        tags: ["classic", "new"],
        vol: 1,
        img: "/assets/images/game6.jpg",
        href: "https://mrspinny.com/games",
    },
];

export default function Slots() {
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("az"); // 'az' | 'za' | 'vol'
    const [filter, setFilter] = useState("all"); // 'all' | 'megaways' | 'classic' | 'jackpot' | 'new' | 'popular' | 'fave'
    const [faves, setFaves] = useState(() => {
        try {
            return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));
        } catch {
            return new Set();
        }
    });

    // persist favorites
    useEffect(() => {
        try {
            localStorage.setItem(FAV_KEY, JSON.stringify([...faves]));
        } catch { }
    }, [faves]);

    const toggleFav = useCallback((title) => {
        setFaves((prev) => {
            const next = new Set(prev);
            if (next.has(title)) next.delete(title);
            else next.add(title);
            return next;
        });
    }, []);

    const filteredSorted = useMemo(() => {
        const q = query.trim().toLowerCase();

        let list = SLOT_DATA.filter((s) => {
            const matchText = !q || s.title.toLowerCase().includes(q);
            const matchCat =
                filter === "all"
                    ? true
                    : filter === "fave"
                        ? faves.has(s.title)
                        : s.tags.includes(filter);
            return matchText && matchCat;
        });

        if (sort === "vol") {
            list = list.slice().sort((a, b) => b.vol - a.vol);
        } else if (sort === "za") {
            list = list.slice().sort((a, b) => b.title.localeCompare(a.title));
        } else {
            list = list.slice().sort((a, b) => a.title.localeCompare(b.title));
        }

        return list;
    }, [query, sort, filter, faves]);

    const onImgError = (e) => {
        const el = e.currentTarget;
        el.alt = el.alt || "Game";
        el.style.background =
            "radial-gradient(ellipse at center,#182743 0%,#0e1730 70%)";
    };

    // keyboard “f” toggles favorite when a card is focused
    const onCardKeyDown = (title) => (e) => {
        if (e.key.toLowerCase() === "f") {
            e.preventDefault();
            toggleFav(title);
        }
    };

    return (
        <>
            {/* HERO */}
            <section
                className="hero"
                style={{ backgroundImage: "url('/assets/images/banner-2.png')" }}
            >
                <div className="hero-blur" aria-hidden="true" />
                <div className="hero-content">
                    <h1>
                        Spin &amp; Win on Top <span>Slot Games</span>
                    </h1>
                    <p>Explore popular titles with bonuses, megaways, and daily drops.</p>
                    <a href="https://mrspinny.com/games" className="btn btn-primary">
                        Play Now
                    </a>
                </div>
            </section>

            {/* TOOLBAR */}
            <section className="container slots-toolbar" aria-label="Slots filters">
                <div className="slots-search">
                    <input
                        id="slotSearch"
                        type="search"
                        placeholder="Search slots…"
                        aria-label="Search slots"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23 6.5 6.5 0 1 0-6.5 6.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 20.49 21.49 19 15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                </div>

                <div className="slots-sort">
                    <label htmlFor="slotSort">Sort</label>
                    <select
                        id="slotSort"
                        aria-label="Sort slots"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                    >
                        <option value="az">A → Z</option>
                        <option value="za">Z → A</option>
                        <option value="vol">Volatility</option>
                    </select>
                </div>

                <div className="slots-pillbar" role="tablist" aria-label="Categories">
                    {[
                        ["all", "All"],
                        ["megaways", "Megaways"],
                        ["classic", "Classic"],
                        ["jackpot", "Jackpots"],
                        ["new", "New"],
                        ["popular", "Popular"],
                        ["fave", "★ Favorites"],
                    ].map(([val, label]) => (
                        <button
                            key={val}
                            className={`pill${filter === val ? " is-active" : ""}`}
                            data-filter={val}
                            role="tab"
                            aria-selected={filter === val}
                            onClick={() => setFilter(val)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </section>

            {/* GRID */}
            <section className="slots container">
                <h2 className="section-title">🎰 Featured Slots</h2>

                <div id="slotsGrid" className="slots-grid">
                    {filteredSorted.map((s) => {
                        const isFav = faves.has(s.title);
                        return (
                            <article
                                key={s.title}
                                className="slot-card"
                                data-title={s.title}
                                data-tags={s.tags.join(" ")}
                                data-vol={s.vol}
                                tabIndex={0}
                                onKeyDown={onCardKeyDown(s.title)}
                            >
                                <button
                                    className={`slot-fav${isFav ? " is-fav" : ""}`}
                                    aria-label={
                                        isFav ? "Remove from favorites" : "Add to favorites"
                                    }
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleFav(s.title);
                                    }}
                                >
                                    ★
                                </button>

                                {s.ribbon && (
                                    <span className={`slot-ribbon${s.ribbonAlt ? " alt" : ""}`}>
                                        {s.ribbon}
                                    </span>
                                )}

                                <a
                                    className="slot-link"
                                    href={s.href}
                                    aria-label={`Play ${s.title}`}
                                >
                                    <figure className="slot-media">
                                        <img
                                            src={s.img}
                                            alt={s.title}
                                            loading="lazy"
                                            onError={onImgError}
                                        />
                                    </figure>

                                    <div className="slot-info">
                                        <h3 className="slot-title">{s.title}</h3>
                                        <div className="slot-meta">
                                            <span className="vol-label">Volatility</span>
                                            <span className="vol-dots" data-lev={s.vol} />
                                        </div>
                                    </div>

                                    <div className="slot-cta">
                                        <span className="btn btn-primary">Play</span>
                                        <span className="btn btn-outline">Demo</span>
                                    </div>
                                </a>
                            </article>
                        );
                    })}
                </div>

                <p
                    id="slotsEmpty"
                    className="live-empty"
                    hidden={filteredSorted.length !== 0}
                >
                    No slots match your filters.
                </p>
            </section>
        </>
    );
}
