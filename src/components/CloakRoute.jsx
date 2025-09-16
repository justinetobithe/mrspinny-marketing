import { useEffect, useState } from "react";

const STORAGE_KEY = "mrspinny_cloak_decision";
const AD_REFERRERS = [
    /facebook\.com/i,
    /instagram\.com/i,
    /tiktok\.com/i,
    /googleadservices\.com/i,
    /doubleclick\.net/i,
    /adservice\.google/i,
    /snapchat\.com/i,
    /twitter\.com|x\.com/i,
];

function decide() {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const view = params.get("view");
    if (view === "landing") return "landing";
    if (view === "site") return "site";
    if (params.has("lp") || params.has("landing")) return "landing";

    const ref = document.referrer || "";
    if (AD_REFERRERS.some((r) => r.test(ref))) return "landing";

    const country = window.__GEO__?.country || null;
    const blockedCountries = [];
    if (country && blockedCountries.includes(country)) return "blocked";

    return "site";
}

export default function CloakRoute({ landing, site, blocked = null, showDebug = false }) {
    const [choice, setChoice] = useState(null);

    useEffect(() => {
        const cached = sessionStorage.getItem(STORAGE_KEY);
        if (cached) {
            setChoice(cached);
            return;
        }
        const d = decide();
        sessionStorage.setItem(STORAGE_KEY, d);
        setChoice(d);
    }, []);

    if (!choice) return null;

    if (showDebug && new URLSearchParams(window.location.search).get("debugcloak") === "1") {
        const style = {
            position: "fixed", right: 10, bottom: 10, zIndex: 99999,
            padding: "6px 10px", borderRadius: 8, fontWeight: 800,
            background: choice === "landing" ? "#fde68a" : "#a7f3d0", color: "#0b1424",
            boxShadow: "0 6px 16px rgba(0,0,0,.25)", fontSize: 12
        };
        setTimeout(() => {
            const el = document.createElement("div");
            el.style.cssText = Object.entries(style).map(([k, v]) => `${k}:${typeof v === "number" ? v + "px" : v}`).join(";");
            el.textContent = `Cloak: ${choice}`;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 3000);
        }, 0);
    }

    if (choice === "landing") return landing;
    if (choice === "blocked" && blocked) return blocked;
    return site;
}
