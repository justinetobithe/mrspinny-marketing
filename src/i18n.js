
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './components/json/en.json';
import fr from './components/json/fr.json';
import es from './components/json/es.json';
import it from './components/json/it.json';
import de from './components/json/de.json';
import ro from './components/json/ro.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            fr: { translation: fr },
            es: { translation: es },
            it: { translation: it },
            de: { translation: de },
            ro: { translation: ro },
        },
        fallbackLng: 'en',
        supportedLngs: ['en', 'fr', 'es', 'it', 'de', 'ro'],
        load: 'languageOnly',
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
        interpolation: { escapeValue: false },
        react: { useSuspense: false },
    });

export default i18n;
