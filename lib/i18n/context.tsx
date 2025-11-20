'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LanguageCode, DEFAULT_LANGUAGE, detectBrowserLanguage, isRTL } from './languages';
import { translations, Translations } from './translations';

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') as LanguageCode;
    if (savedLang && translations[savedLang]) {
      setLanguageState(savedLang);
    } else {
      const detected = detectBrowserLanguage();
      setLanguageState(detected);
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = language;
      document.documentElement.dir = isRTL(language) ? 'rtl' : 'ltr';
    }
  }, [language, mounted]);

  const value: I18nContextType = {
    language,
    setLanguage,
    t: translations[language],
    isRTL: isRTL(language),
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
