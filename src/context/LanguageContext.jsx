import React, { createContext, useState, useContext, useEffect } from "react";
import i18n from "../i18n";

export const LANGUAGES = [
    { code: "en", name: "English", flag: "🇬🇧", initial: "EN" },
    { code: "de", name: "German", flag: "🇩🇪", initial: "DE" },
    { code: "es", name: "Spanish", flag: "🇪🇸", initial: "ES" },
    { code: "fr", name: "French", flag: "🇫🇷", initial: "FR" },
    { code: "it", name: "Italian", flag: "🇮🇹", initial: "IT" },
    { code: "ro", name: "Romanian", flag: "🇷🇴", initial: "RO" },
    { code: "ko", name: "Korean", flag: "🇰🇷", initial: "KO" },
    { code: "th", name: "Thai", flag: "🇹🇭", initial: "TH" },
    { code: "zh", name: "Chinese", flag: "🇨🇳", initial: "ZH" },
    { code: "tr", name: "Turkish", flag: "🇹🇷", initial: "TR" },
    { code: "pt", name: "Portuguese", flag: "🇵🇹", initial: "PT" },
    { code: "ru", name: "Russian", flag: "🇷🇺", initial: "RU" }
];

const COUNTRY_TO_LANG = {
    DE: "de", AT: "de", CH: "de", LI: "de", LU: "de",
    ES: "es", AR: "es", BO: "es", CL: "es", CO: "es", CR: "es", CU: "es", DO: "es",
    EC: "es", SV: "es", GQ: "es", GT: "es", HN: "es", MX: "es", NI: "es", PA: "es",
    PY: "es", PE: "es", PR: "es", UY: "es", VE: "es",
    FR: "fr", BE: "fr", CH: "fr", CA: "fr", LU: "fr", MC: "fr", HT: "fr", MG: "fr",
    IT: "it", CH: "it", SM: "it", VA: "it",
    RO: "ro", MD: "ro",
    KR: "ko", TH: "th", CN: "zh", TW: "zh", HK: "zh", TR: "tr", PT: "pt", BR: "pt", RU: "ru",
};

const DEFAULT_LANG_CODE = "en";
const LanguageContext = createContext();

async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 2500, ...rest } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, { ...rest, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (e) {
        clearTimeout(id);
        throw e;
    }
}

async function detectCountry() {
    try {
        const res = await fetchWithTimeout("/cdn-cgi/trace", { timeout: 1200 });
        if (res.ok) {
            const txt = await res.text();
            const m = txt.match(/loc=([A-Z]{2})/);
            if (m) return m[1];
        }
    } catch { }

    try {
        const res = await fetchWithTimeout("https://ipapi.co/json/", { timeout: 2000 });
        if (res.ok) {
            const json = await res.json();
            if (json && json.country) return String(json.country).toUpperCase();
        }
    } catch { }

    if (typeof navigator !== "undefined" && navigator.language) {
        const parts = navigator.language.split("-");
        if (parts[1]) return parts[1].toUpperCase();
    }

    return null;
}

export const LanguageProvider = ({ children }) => {
    const initialCode = (i18n.language || DEFAULT_LANG_CODE).split("-")[0];
    const initialLanguage =
        LANGUAGES.find(l => l.code === initialCode) || LANGUAGES.find(l => l.code === DEFAULT_LANG_CODE);

    const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
    const [bootstrapped, setBootstrapped] = useState(false);

    useEffect(() => {
        const handleLanguageChanged = (lng) => {
            const normalized = lng.split("-")[0];
            const found = LANGUAGES.find(l => l.code === normalized) || LANGUAGES.find(l => l.code === DEFAULT_LANG_CODE);
            setSelectedLanguage(found);
        };
        i18n.on("languageChanged", handleLanguageChanged);
        return () => i18n.off("languageChanged", handleLanguageChanged);
    }, []);

    useEffect(() => {
        (async () => {
            const stored =
                localStorage.getItem("selectedLanguage") ||
                localStorage.getItem("i18nextLng");

            if (stored) {
                const code = stored.split("-")[0];
                const lang = LANGUAGES.find(l => l.code === code) || LANGUAGES.find(l => l.code === DEFAULT_LANG_CODE);
                i18n.changeLanguage(lang.code);
                setSelectedLanguage(lang);
                setBootstrapped(true);
                return;
            }

            const isoCountry = await detectCountry();
            const suggestedCode = isoCountry ? COUNTRY_TO_LANG[isoCountry] : null;
            const finalCode = LANGUAGES.some(l => l.code === suggestedCode) ? suggestedCode : DEFAULT_LANG_CODE;
            const lang = LANGUAGES.find(l => l.code === finalCode) || LANGUAGES.find(l => l.code === DEFAULT_LANG_CODE);

            i18n.changeLanguage(lang.code);
            localStorage.setItem("i18nextLng", lang.code);
            setSelectedLanguage(lang);
            setBootstrapped(true);
        })();
    }, []);

    if (!bootstrapped) return null;

    const setLanguage = (languageOrCode) => {
        const lang =
            typeof languageOrCode === "string"
                ? LANGUAGES.find(l => l.code === languageOrCode) || LANGUAGES.find(l => l.code === DEFAULT_LANG_CODE)
                : languageOrCode;

        setSelectedLanguage(lang);
        i18n.changeLanguage(lang.code);
        localStorage.setItem("i18nextLng", lang.code);
        localStorage.setItem("selectedLanguage", lang.code);
    };

    return (
        <LanguageContext.Provider
            value={{
                selectedLanguage,
                setLanguage,
                languages: LANGUAGES,
                countryToLang: COUNTRY_TO_LANG
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
13