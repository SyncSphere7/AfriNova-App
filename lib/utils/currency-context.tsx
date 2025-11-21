/**
 * Currency Context Provider
 * Manages user's preferred currency with automatic detection
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  type CurrencyCode,
  DEFAULT_CURRENCY,
  detectUserCurrency,
  convertPrice,
  formatPrice,
  CURRENCY_CONFIG,
} from '@/lib/utils/currency';
import { useLanguage } from '@/lib/i18n/context';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  convertPrice: (usdPrice: number) => number;
  formatPrice: (amount: number, showCode?: boolean) => string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detect user's currency on mount
    const detectCurrency = async () => {
      try {
        // Check localStorage first
        const saved = localStorage.getItem('preferred_currency') as CurrencyCode;
        if (saved && CURRENCY_CONFIG[saved]) {
          setCurrencyState(saved);
          setIsLoading(false);
          return;
        }

        // Auto-detect based on location and language
        const detected = await detectUserCurrency(language);
        setCurrencyState(detected);
      } catch (error) {
        console.error('Currency detection failed:', error);
        setCurrencyState(DEFAULT_CURRENCY);
      } finally {
        setIsLoading(false);
      }
    };

    detectCurrency();
  }, [language]);

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferred_currency', newCurrency);
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    convertPrice: (usdPrice: number) => convertPrice(usdPrice, currency),
    formatPrice: (amount: number, showCode = false) => formatPrice(amount, currency, showCode),
    isLoading,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
