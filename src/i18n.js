import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import de from "./components/json/de.json";
import en from "./components/json/en.json";
import es from "./components/json/es.json";
import tl from "./components/json/tl.json";
import fr from "./components/json/fr.json";
import it from "./components/json/it.json";
import ko from "./components/json/ko.json";
import pt from "./components/json/pt.json";
import ro from "./components/json/ro.json";
import ru from "./components/json/ru.json";
import th from "./components/json/th.json";
import tr from "./components/json/tr.json";
import zh from "./components/json/zh.json";

const resources = {
    de: { translation: de },
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    it: { translation: it },
    ko: { translation: ko },
    pt: { translation: pt },
    ro: { translation: ro },
    ru: { translation: ru },
    th: { translation: th },
    tr: { translation: tr },
    zh: { translation: zh },
    tl: { translation: tl },
};

i18n
    .use(initReactI18next)
    .init({
        debug: true,
        resources,
        ns: ["translation"],
        defaultNS: "translation",
        fallbackLng: "en",
        supportedLngs: Object.keys(resources),
        nonExplicitSupportedLngs: true,
        cleanCode: true,
        load: "languageOnly",
        interpolation: { escapeValue: false },
        react: { useSuspense: false },
    });

i18n.on("loaded", (l) => console.log("[i18n] loaded:", l));
i18n.on("failedLoading", (lng, ns, msg) =>
    console.error("[i18n] failedLoading", { lng, ns, msg })
);
i18n.on("missingKey", (lngs, ns, key) =>
    console.warn("[i18n] missingKey", { lngs, ns, key })
);

export default i18n;
