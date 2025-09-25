import React, { createContext, useState, useContext, useEffect } from "react";
import i18n from "../i18n";
import { LANGUAGES, COUNTRY_TO_LANG, DEFAULT_LANG_CODE, SUPPORTED_LNGS } from "./languages";

const LanguageContext = createContext();

const normalize = (code) => (code ? code.split("-")[0] : DEFAULT_LANG_CODE);
const findLang = (code) =>
    LANGUAGES.find((l) => l.code === code) ||
    LANGUAGES.find((l) => l.code === DEFAULT_LANG_CODE);

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
    const initialCode = normalize(i18n.language || DEFAULT_LANG_CODE);
    const [selectedLanguage, setSelectedLanguage] = useState(findLang(initialCode));
    const [bootstrapped, setBootstrapped] = useState(false);

    useEffect(() => {
        const handleLanguageChanged = (lng) => {
            setSelectedLanguage(findLang(normalize(lng)));
        };
        i18n.on("languageChanged", handleLanguageChanged);
        return () => i18n.off("languageChanged", handleLanguageChanged);
    }, []);

    useEffect(() => {
        (async () => {
            const stored = localStorage.getItem("selectedLanguage");
            if (!stored) localStorage.removeItem("i18nextLng");

            if (stored) {
                const lang = findLang(normalize(stored));
                i18n.changeLanguage(lang.code);
                setSelectedLanguage(lang);
                setBootstrapped(true);
                return;
            }

            const isoCountry = await detectCountry();
            let suggestedCode = isoCountry ? COUNTRY_TO_LANG[isoCountry] : null;

            if (typeof navigator !== "undefined" && navigator.language) {
                const navCode = normalize(navigator.language);
                if (SUPPORTED_LNGS.includes(navCode)) {
                    suggestedCode = suggestedCode || navCode;
                }
            }

            const finalCode = SUPPORTED_LNGS.includes(suggestedCode || "")
                ? suggestedCode
                : DEFAULT_LANG_CODE;

            const lang = findLang(finalCode);
            i18n.changeLanguage(finalCode);
            localStorage.setItem("i18nextLng", finalCode);
            setSelectedLanguage(lang);
            setBootstrapped(true);
        })();
    }, []);

    if (!bootstrapped) return null;

    const setLanguage = (languageOrCode) => {
        const lang =
            typeof languageOrCode === "string" ? findLang(languageOrCode) : languageOrCode;

        if (!lang || lang.code === selectedLanguage.code) return;

        setSelectedLanguage(lang);
        i18n.changeLanguage(lang.code);
        localStorage.setItem("selectedLanguage", lang.code);
        localStorage.setItem("i18nextLng", lang.code);
    };

    return (
        <LanguageContext.Provider
            value={{
                selectedLanguage,
                setLanguage,
                languages: LANGUAGES,
                countryToLang: COUNTRY_TO_LANG,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
