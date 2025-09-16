import { useEffect, useState } from "react";

const STORAGE_KEY = "mrspinny_entry_decision";

function decide(blockedCountries = []) {
    const url = new URL(window.location.href);
    const params = url.searchParams;

    const view = params.get("view");
    if (view === "landing") return "landing";
    if (view === "site") return "site";
    if (params.has("lp") || params.has("landing")) return "landing";

    const country = window.__GEO__?.country || null;
    if (country && blockedCountries.includes(country)) return "blocked";

    return "site";
}

export default function CloakRoute({
    landing,
    site,
    blocked = null,
    blockedCountries = [],
    showDebug = false,
}) {
    const [choice, setChoice] = useState(null);

    useEffect(() => {
        const cached = sessionStorage.getItem(STORAGE_KEY);
        if (cached) {
            setChoice(cached);
            return;
        }
        const d = decide(blockedCountries);
        sessionStorage.setItem(STORAGE_KEY, d);
        setChoice(d);
    }, [blockedCountries]);

    useEffect(() => {
        const qs = new URLSearchParams(window.location.search);
        if (!(showDebug && qs.get("debugcloak") === "1" && choice)) return;
        const el = document.createElement("div");
        el.style.cssText = [
            "position:fixed", "right:10px", "bottom:10px", "z-index:99999",
            "padding:6px 10px", "border-radius:8px", "font-weight:800",
            `background:${choice === "landing" ? "#fde68a" : choice === "blocked" ? "#fecaca" : "#a7f3d0"}`,
            "color:#0b1424", "box-shadow:0 6px 16px rgba(0,0,0,.25)", "font-size:12px"
        ].join(";");
        el.textContent = `Route: ${choice}`;
        document.body.appendChild(el);
        const t = setTimeout(() => el.remove(), 3000);
        return () => { clearTimeout(t); el.remove(); };
    }, [choice, showDebug]);

    if (!choice) return null;
    if (choice === "landing") return landing;
    if (choice === "blocked" && blocked) return blocked;
    return site;
}
