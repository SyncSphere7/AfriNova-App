'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LanguageCode, DEFAULT_LANGUAGE, isRTL } from './languages';
import { translations, Translations } from './translations';
import { languageDetector, saveLanguagePreference, LanguageDetectionResult } from './detector';

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  isRTL: boolean;
  detectionResult?: LanguageDetectionResult;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [detectionResult, setDetectionResult] = useState<LanguageDetectionResult>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Use intelligent language detector
    languageDetector.detect().then((result) => {
      setLanguageState(result.detected);
      setDetectionResult(result);
      
      // Apply language to document
      document.documentElement.lang = result.detected;
      document.documentElement.dir = isRTL(result.detected) ? 'rtl' : 'ltr';
    });
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    
    // Store preference (highest priority for future visits)
    saveLanguagePreference(lang);
    
    // Apply to document
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr';
    
    // Update detection result
    setDetectionResult({
      detected: lang,
      confidence: 1.0,
      source: 'stored',
    });
  };

  const value: I18nContextType = {
    language,
    setLanguage,
    t: translations[language],
    isRTL: isRTL(language),
    detectionResult,
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
