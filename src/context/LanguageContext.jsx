import React, { createContext, useState, useContext, useEffect } from 'react';
import i18n from '../i18n';

const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', initial: 'EN' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷', initial: 'KO' },
    { code: 'th', name: 'Thai', flag: '🇹🇭', initial: 'TH' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', initial: 'ZH' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷', initial: 'TR' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹', initial: 'PT' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺', initial: 'RU' },
];

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const currentLangCode = i18n.language.split('-')[0];
    const [selectedLanguage, setSelectedLanguage] = useState(() => {
        return (
            languages.find(lang => lang.code === currentLangCode) ||
            languages[0]
        );
    });

    useEffect(() => {
        const handleLanguageChanged = (lng) => {
            const normalizedCode = lng.split('-')[0];
            setSelectedLanguage(languages.find(lang => lang.code === normalizedCode) || languages[0]);
        };
        i18n.on('languageChanged', handleLanguageChanged);
        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, []);

    useEffect(() => {
        if (selectedLanguage.code !== i18n.language.split('-')[0]) {
            i18n.changeLanguage(selectedLanguage.code);
            localStorage.setItem('i18nextLng', selectedLanguage.code);
        }
    }, [selectedLanguage]);

    const setLanguage = (language) => {
        setSelectedLanguage(language);
    };

    const value = {
        selectedLanguage,
        setLanguage,
        languages,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    return useContext(LanguageContext);
};
