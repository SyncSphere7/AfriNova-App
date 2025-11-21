/**
 * Currency Utilities
 * Auto-detect user currency based on location and convert prices
 */

import { type LanguageCode, SUPPORTED_LANGUAGES } from '@/lib/i18n/languages';

// Currency configuration for each region
export const CURRENCY_CONFIG = {
  USD: { symbol: '$', code: 'USD', name: 'US Dollar', rate: 1.0 },
  EUR: { symbol: '€', code: 'EUR', name: 'Euro', rate: 0.92 },
  GBP: { symbol: '£', code: 'GBP', name: 'British Pound', rate: 0.79 },
  KES: { symbol: 'KSh', code: 'KES', name: 'Kenyan Shilling', rate: 129.0 },
  TZS: { symbol: 'TSh', code: 'TZS', name: 'Tanzanian Shilling', rate: 2500.0 },
  UGX: { symbol: 'USh', code: 'UGX', name: 'Ugandan Shilling', rate: 3700.0 },
  RWF: { symbol: 'FRw', code: 'RWF', name: 'Rwandan Franc', rate: 1300.0 },
  ZAR: { symbol: 'R', code: 'ZAR', name: 'South African Rand', rate: 18.5 },
  NGN: { symbol: '₦', code: 'NGN', name: 'Nigerian Naira', rate: 1550.0 },
  EGP: { symbol: 'E£', code: 'EGP', name: 'Egyptian Pound', rate: 49.0 },
  INR: { symbol: '₹', code: 'INR', name: 'Indian Rupee', rate: 83.0 },
  CNY: { symbol: '¥', code: 'CNY', name: 'Chinese Yuan', rate: 7.24 },
  JPY: { symbol: '¥', code: 'JPY', name: 'Japanese Yen', rate: 149.0 },
  BRL: { symbol: 'R$', code: 'BRL', name: 'Brazilian Real', rate: 5.0 },
  AED: { symbol: 'د.إ', code: 'AED', name: 'UAE Dirham', rate: 3.67 },
  SAR: { symbol: 'ر.س', code: 'SAR', name: 'Saudi Riyal', rate: 3.75 },
} as const;

export type CurrencyCode = keyof typeof CURRENCY_CONFIG;

// Default currency is USD (for international pricing)
export const DEFAULT_CURRENCY: CurrencyCode = 'USD';

// Map language/region to preferred currency
export const LANGUAGE_TO_CURRENCY: Partial<Record<LanguageCode, CurrencyCode>> = {
  en: 'USD',
  sw: 'KES', // Swahili → East Africa (Kenya)
  ar: 'AED', // Arabic → UAE/Middle East
  pt: 'BRL', // Portuguese → Brazil
  fr: 'EUR', // French → Euro
  de: 'EUR', // German → Euro
  es: 'USD', // Spanish → USD (Latin America)
  zh: 'CNY', // Chinese → Yuan
  ja: 'JPY', // Japanese → Yen
  hi: 'INR', // Hindi → Indian Rupee
  ko: 'USD', // Korean → USD
  ru: 'EUR', // Russian → Euro
  id: 'USD', // Indonesian → USD
  th: 'USD', // Thai → USD
  vi: 'USD', // Vietnamese → USD
  tl: 'USD', // Filipino → USD
  it: 'EUR', // Italian → Euro
  nl: 'EUR', // Dutch → Euro
  pl: 'EUR', // Polish → Euro
  tr: 'USD', // Turkish → USD
};

// Country code to currency mapping (for geolocation)
export const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  // East Africa (Pesapal primary markets)
  KE: 'KES', // Kenya
  TZ: 'TZS', // Tanzania
  UG: 'UGX', // Uganda
  RW: 'RWF', // Rwanda
  BI: 'USD', // Burundi (use USD)
  
  // Africa
  ZA: 'ZAR', // South Africa
  NG: 'NGN', // Nigeria
  EG: 'EGP', // Egypt
  MA: 'USD', // Morocco
  GH: 'USD', // Ghana
  ET: 'USD', // Ethiopia
  
  // Middle East
  AE: 'AED', // UAE
  SA: 'SAR', // Saudi Arabia
  
  // Europe
  GB: 'GBP', // United Kingdom
  DE: 'EUR', // Germany
  FR: 'EUR', // France
  IT: 'EUR', // Italy
  ES: 'EUR', // Spain
  NL: 'EUR', // Netherlands
  PL: 'EUR', // Poland
  
  // Americas
  US: 'USD', // United States
  CA: 'USD', // Canada
  BR: 'BRL', // Brazil
  MX: 'USD', // Mexico
  AR: 'USD', // Argentina
  
  // Asia
  IN: 'INR', // India
  CN: 'CNY', // China
  JP: 'JPY', // Japan
  SG: 'USD', // Singapore
  HK: 'USD', // Hong Kong
  
  // Default for unlisted countries
  DEFAULT: 'USD',
};

/**
 * Convert price from USD to target currency
 */
export function convertPrice(
  usdPrice: number,
  targetCurrency: CurrencyCode = DEFAULT_CURRENCY
): number {
  const rate = CURRENCY_CONFIG[targetCurrency].rate;
  return Math.round(usdPrice * rate);
}

/**
 * Convert price from source currency to USD
 */
export function convertToUSD(
  amount: number,
  sourceCurrency: CurrencyCode
): number {
  const rate = CURRENCY_CONFIG[sourceCurrency].rate;
  return amount / rate;
}

/**
 * Format price with currency symbol
 */
export function formatPrice(
  amount: number,
  currency: CurrencyCode = DEFAULT_CURRENCY,
  showCode = false
): string {
  const config = CURRENCY_CONFIG[currency];
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  if (showCode) {
    return `${config.symbol}${formatted} ${config.code}`;
  }
  
  return `${config.symbol}${formatted}`;
}

/**
 * Detect user's preferred currency based on language
 */
export function getCurrencyFromLanguage(lang: LanguageCode): CurrencyCode {
  return LANGUAGE_TO_CURRENCY[lang] || DEFAULT_CURRENCY;
}

/**
 * Detect user's preferred currency based on country code
 */
export function getCurrencyFromCountry(countryCode: string): CurrencyCode {
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] || COUNTRY_TO_CURRENCY.DEFAULT;
}

/**
 * Get user's preferred currency (tries geolocation, then language, then default)
 */
export async function detectUserCurrency(languageCode?: LanguageCode): Promise<CurrencyCode> {
  // Try to get country from geolocation API if available
  try {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      // In production, you'd use a service like ipapi.co or geoip-db.com
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        const currency = getCurrencyFromCountry(data.country_code);
        if (currency) return currency;
      }
    }
  } catch (error) {
    console.log('Geolocation currency detection failed, using language fallback');
  }

  // Fallback to language-based detection
  if (languageCode) {
    return getCurrencyFromLanguage(languageCode);
  }

  return DEFAULT_CURRENCY;
}

/**
 * Get price tiers for filters (in USD)
 */
export const PRICE_TIERS = [
  { label: 'Any Price', min: undefined, max: undefined },
  { label: 'Free', min: 0, max: 0 },
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $200', min: 100, max: 200 },
  { label: 'Over $200', min: 200, max: undefined },
] as const;

/**
 * Get localized price tiers for display
 */
export function getLocalizedPriceTiers(currency: CurrencyCode) {
  return PRICE_TIERS.map(tier => {
    if (tier.min === undefined && tier.max === undefined) {
      return { ...tier };
    }
    if (tier.min === 0 && tier.max === 0) {
      return { ...tier };
    }
    
    const min = tier.min !== undefined ? convertPrice(tier.min, currency) : undefined;
    const max = tier.max !== undefined ? convertPrice(tier.max, currency) : undefined;
    
    let label = '';
    if (min === undefined && max !== undefined) {
      label = `Under ${formatPrice(max, currency)}`;
    } else if (min !== undefined && max === undefined) {
      label = `Over ${formatPrice(min, currency)}`;
    } else if (min !== undefined && max !== undefined) {
      label = `${formatPrice(min, currency)} - ${formatPrice(max, currency)}`;
    }
    
    return { label, min, max };
  });
}

/**
 * Get all supported currencies
 */
export function getAllCurrencies() {
  return Object.entries(CURRENCY_CONFIG).map(([code, config]) => ({
    code: code as CurrencyCode,
    ...config,
  }));
}
