
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
    { code: "ru", name: "Russian", flag: "🇷🇺", initial: "RU" },
    { code: "fil", name: "Filipino", flag: "🇵🇭", initial: "FIL" },
];

export const COUNTRY_TO_LANG = {
    DE: "de", AT: "de", LI: "de", LU: "de",
    ES: "es", AR: "es", BO: "es", CL: "es", CO: "es", CR: "es", CU: "es", DO: "es",
    EC: "es", SV: "es", GQ: "es", GT: "es", HN: "es", MX: "es", NI: "es", PA: "es",
    PY: "es", PE: "es", PR: "es", UY: "es", VE: "es",
    FR: "fr", BE: "fr", CA: "fr", MC: "fr", HT: "fr", MG: "fr",
    IT: "it", SM: "it", VA: "it",
    RO: "ro", MD: "ro",
    KR: "ko", TH: "th",
    CN: "zh", TW: "zh", HK: "zh",
    TR: "tr",
    PT: "pt", BR: "pt",
    RU: "ru",
    PH: "fil",
    CH: "de",
};

export const DEFAULT_LANG_CODE = "en";

export const SUPPORTED_LNGS = Array.from(
    new Set([...LANGUAGES.map(l => l.code), "tl"])
);
