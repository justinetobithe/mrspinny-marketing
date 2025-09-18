import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

const FAV_KEY = "mrspinny_faves";

const SLOT_DATA = [
    {
        title: "Sweet Bonanza",
        tags: ["popular", "classic"],
        vol: 2,
        img: "/assets/images/games/sweet-bonanza.jpg",
        href: "https://mrspinny.com/games",
        ribbonKey: "dailyDrops",
        ribbonAlt: false
    },
    {
        title: "Gates of Olympus",
        tags: ["popular", "megaways"],
        vol: 3,
        img: "/assets/images/games/gates-of-olympus.jpg",
        href: "https://mrspinny.com/games"
    },
    {
        title: "5 Lions Megaways",
        tags: ["megaways", "new"],
        vol: 3,
        img: "/assets/images/games/5-lions-of-megaways.jpg",
        href: "https://mrspinny.com/games",
        ribbonKey: "hot",
        ribbonAlt: true
    },
    {
        title: "Zeus the Thunderer",
        tags: ["jackpot", "popular"],
        vol: 2,
        img: "/assets/images/games/thunder-olympus.jpg",
        href: "https://mrspinny.com/games"
    },
    {
        title: "Big Bass Bonanza",
        tags: ["classic", "popular"],
        vol: 1,
        img: "/assets/images/games/big-bass-bonanza.jpg",
        href: "https://mrspinny.com/games"
    },
    {
        title: "Book of Gold",
        tags: ["classic", "new"],
        vol: 1,
        img: "/assets/images/games/book-of-gold.jpg",
        href: "https://mrspinny.com/games"
    }
];

export default function Slots() {
    const { t } = useTranslation();

    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("az");
    const [filter, setFilter] = useState("all");
    const [faves, setFaves] = useState(() => {
        try {
            return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));
        } catch {
            return new Set();
        }
    });

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
        el.alt = el.alt || t("slots.alt.game");
        el.style.background =
            "radial-gradient(ellipse at center,#182743 0%,#0e1730 70%)";
    };

    const onCardKeyDown = (title) => (e) => {
        if (e.key.toLowerCase() === "f") {
            e.preventDefault();
            toggleFav(title);
        }
    };

    const pills = [
        ["all", t("slots.pills.all")],
        ["megaways", t("slots.pills.megaways")],
        ["classic", t("slots.pills.classic")],
        ["jackpot", t("slots.pills.jackpot")],
        ["new", t("slots.pills.new")],
        ["popular", t("slots.pills.popular")],
        ["fave", t("slots.pills.fave")]
    ];

    return (
        <>
            <section
                className="hero"
                style={{ backgroundImage: "url('/assets/images/slots-banner.png')" }}
            >
                <div className="hero-blur" aria-hidden="true" />
                <div className="hero-content">
                    <h1>
                        {t("slots.hero.titleA")} <span>{t("slots.hero.titleB")}</span>
                    </h1>
                    <p>{t("slots.hero.subtitle")}</p>
                    <a href="https://mrspinny.com/games" className="btn btn-primary">
                        {t("header.cta.playNow")}
                    </a>
                </div>
            </section>

            <section
                className="container slots-toolbar"
                aria-label={t("slots.toolbar.ariaLabel")}
            >
                <div className="slots-search">
                    <input
                        id="slotSearch"
                        type="search"
                        placeholder={t("slots.toolbar.searchPlaceholder")}
                        aria-label={t("slots.toolbar.searchAria")}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23 6.5 6.5 0 1 0-6.5 6.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 20.49 21.49 19 15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                </div>

                <div className="slots-sort">
                    <label htmlFor="slotSort">{t("slots.toolbar.sortLabel")}</label>
                    <select
                        id="slotSort"
                        aria-label={t("slots.toolbar.sortAria")}
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                    >
                        <option value="az">{t("slots.toolbar.sortOptions.az")}</option>
                        <option value="za">{t("slots.toolbar.sortOptions.za")}</option>
                        <option value="vol">{t("slots.toolbar.sortOptions.vol")}</option>
                    </select>
                </div>

                <div
                    className="slots-pillbar"
                    role="tablist"
                    aria-label={t("slots.toolbar.categoriesAria")}
                >
                    {pills.map(([val, label]) => (
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

            <section className="slots container">
                <h2 className="section-title">{t("slots.sectionTitle")}</h2>

                <div className="slots-grid-wrap">
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
                                            isFav ? t("slots.aria.removeFav") : t("slots.aria.addFav")
                                        }
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleFav(s.title);
                                        }}
                                        title={t("slots.hints.toggleFav")}
                                    >
                                        ★
                                    </button>

                                    {s.ribbonKey && (
                                        <span
                                            className={`slot-ribbon${s.ribbonAlt ? " alt" : ""}`}
                                        >
                                            {t(`slots.ribbon.${s.ribbonKey}`)}
                                        </span>
                                    )}

                                    <a
                                        className="slot-link"
                                        href={s.href}
                                        aria-label={t("slots.aria.playGame", { title: s.title })}
                                    >
                                        <figure className="slot-media">
                                            <img
                                                src={s.img}
                                                alt={s.title}
                                                loading="lazy"
                                                onError={onImgError}
                                            />
                                            <span className="slot-sheen" aria-hidden="true" />
                                        </figure>

                                        <div className="slot-info">
                                            <h3 className="slot-title">{s.title}</h3>
                                            <div className="slot-meta">
                                                <div className="slot-tags" aria-hidden="true">
                                                    {s.tags.map((tag) => (
                                                        <span key={tag} className="slot-tag">
                                                            {t(`slots.tags.${tag}`)}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="slot-vol">
                                                    <span className="vol-label">
                                                        {t("slots.vol.labelShort")}
                                                    </span>
                                                    <span className="vol-dots" data-lev={s.vol} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="slot-cta rail">
                                            <span className="btn btn-primary">
                                                {t("slots.cta.play")}
                                            </span>
                                            <span className="btn btn-outline">
                                                {t("slots.cta.demo")}
                                            </span>
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
                        {t("slots.empty")}
                    </p>
                </div>
            </section>
        </>
    );
}
