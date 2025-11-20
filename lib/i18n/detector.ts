import { LanguageCode, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './languages';

export interface LanguageDetectionResult {
  detected: LanguageCode;
  confidence: number; // 0-1
  source: 'browser' | 'geolocation' | 'stored' | 'default';
  alternatives?: LanguageCode[];
}

export interface GeolocationLanguageMap {
  [countryCode: string]: LanguageCode[];
}

/**
 * Map of country codes to preferred languages
 * Focused on African countries for AfriNova
 */
export const COUNTRY_LANGUAGE_MAP: GeolocationLanguageMap = {
  // East Africa (Swahili)
  KE: ['sw', 'en'], // Kenya
  TZ: ['sw', 'en'], // Tanzania
  UG: ['sw', 'en'], // Uganda
  RW: ['sw', 'fr', 'en'], // Rwanda
  BI: ['sw', 'fr'], // Burundi
  
  // West Africa (French/English)
  NG: ['en'], // Nigeria
  GH: ['en'], // Ghana
  SN: ['fr'], // Senegal
  CI: ['fr'], // Côte d'Ivoire
  ML: ['fr'], // Mali
  BF: ['fr'], // Burkina Faso
  NE: ['fr'], // Niger
  TG: ['fr'], // Togo
  BJ: ['fr'], // Benin
  GN: ['fr'], // Guinea
  
  // North Africa (Arabic/French)
  EG: ['ar', 'en'], // Egypt
  DZ: ['ar', 'fr'], // Algeria
  MA: ['ar', 'fr'], // Morocco
  TN: ['ar', 'fr'], // Tunisia
  LY: ['ar'], // Libya
  SD: ['ar'], // Sudan
  
  // Southern Africa (English/Portuguese)
  ZA: ['en'], // South Africa
  ZW: ['en'], // Zimbabwe
  ZM: ['en'], // Zambia
  BW: ['en'], // Botswana
  NA: ['en'], // Namibia
  AO: ['pt'], // Angola
  MZ: ['pt'], // Mozambique
  
  // Central Africa (French/Portuguese)
  CD: ['fr'], // DR Congo
  CG: ['fr'], // Republic of Congo
  CM: ['fr', 'en'], // Cameroon
  GA: ['fr'], // Gabon
  CF: ['fr'], // Central African Republic
  TD: ['fr', 'ar'], // Chad
  
  // Global (for testing/defaults)
  US: ['en'],
  GB: ['en'],
  CA: ['en', 'fr'],
  FR: ['fr'],
  BR: ['pt'],
  PT: ['pt'],
  SA: ['ar'],
  AE: ['ar', 'en'],
};

/**
 * LanguageDetector - Intelligently detects user's preferred language
 * 
 * Priority:
 * 1. Stored preference (localStorage or database)
 * 2. Geolocation-based (IP → Country → Language)
 * 3. Browser language settings
 * 4. Default (English)
 */
export class LanguageDetector {
  private storageKey = 'afrinova_language';
  
  /**
   * Detect user's language with multi-source fallback
   */
  async detect(): Promise<LanguageDetectionResult> {
    // 1. Check stored preference (highest priority)
    const stored = this.getStoredLanguage();
    if (stored) {
      return {
        detected: stored,
        confidence: 1.0,
        source: 'stored',
      };
    }
    
    // 2. Try geolocation-based detection
    const geo = await this.detectFromGeolocation();
    if (geo && geo.confidence >= 0.8) {
      return geo;
    }
    
    // 3. Browser language settings
    const browser = this.detectFromBrowser();
    if (browser.confidence >= 0.7) {
      return browser;
    }
    
    // 4. Default fallback
    return {
      detected: DEFAULT_LANGUAGE,
      confidence: 0.5,
      source: 'default',
    };
  }
  
  /**
   * Get stored language preference from localStorage
   */
  private getStoredLanguage(): LanguageCode | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored && this.isValidLanguage(stored)) {
        return stored as LanguageCode;
      }
    } catch (error) {
      console.error('Failed to read stored language:', error);
    }
    
    return null;
  }
  
  /**
   * Store language preference in localStorage
   */
  storeLanguage(code: LanguageCode): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.storageKey, code);
    } catch (error) {
      console.error('Failed to store language:', error);
    }
  }
  
  /**
   * Clear stored language preference
   */
  clearStoredLanguage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear stored language:', error);
    }
  }
  
  /**
   * Detect language from user's geolocation (IP-based)
   */
  private async detectFromGeolocation(): Promise<LanguageDetectionResult | null> {
    try {
      // Try to get country from IP geolocation API
      const response = await fetch('https://ipapi.co/json/', {
        signal: AbortSignal.timeout(3000), // 3 second timeout
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      const countryCode = data.country_code as string;
      
      if (!countryCode) return null;
      
      // Get preferred languages for this country
      const languages = COUNTRY_LANGUAGE_MAP[countryCode];
      
      if (!languages || languages.length === 0) {
        return null;
      }
      
      // Return primary language with high confidence
      return {
        detected: languages[0],
        confidence: 0.9,
        source: 'geolocation',
        alternatives: languages.slice(1),
      };
      
    } catch (error) {
      console.warn('Geolocation detection failed:', error);
      return null;
    }
  }
  
  /**
   * Detect language from browser settings
   */
  private detectFromBrowser(): LanguageDetectionResult {
    if (typeof window === 'undefined') {
      return {
        detected: DEFAULT_LANGUAGE,
        confidence: 0.5,
        source: 'default',
      };
    }
    
    // Get browser language (e.g., "en-US" → "en")
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    
    // Check if it's a supported language
    if (this.isValidLanguage(browserLang)) {
      return {
        detected: browserLang as LanguageCode,
        confidence: 0.8,
        source: 'browser',
      };
    }
    
    // Check navigator.languages array for alternatives
    const alternatives = navigator.languages
      .map(lang => lang.split('-')[0].toLowerCase())
      .filter(lang => this.isValidLanguage(lang))
      .map(lang => lang as LanguageCode);
    
    if (alternatives.length > 0) {
      return {
        detected: alternatives[0],
        confidence: 0.7,
        source: 'browser',
        alternatives: alternatives.slice(1),
      };
    }
    
    // No match found
    return {
      detected: DEFAULT_LANGUAGE,
      confidence: 0.5,
      source: 'default',
    };
  }
  
  /**
   * Validate if a language code is supported
   */
  private isValidLanguage(code: string): boolean {
    return code in SUPPORTED_LANGUAGES;
  }
  
  /**
   * Get language name in user's current language
   */
  getLanguageName(code: LanguageCode, displayInLanguage?: LanguageCode): string {
    const info = SUPPORTED_LANGUAGES[code];
    if (!info) return code;
    
    // If displayInLanguage specified, return translated name (future enhancement)
    // For now, return native name
    return info.nativeName;
  }
  
  /**
   * Get all languages for a specific region
   */
  getLanguagesByRegion(region: string): LanguageCode[] {
    return Object.entries(SUPPORTED_LANGUAGES)
      .filter(([_, info]) => info.region.toLowerCase().includes(region.toLowerCase()))
      .map(([code]) => code as LanguageCode);
  }
  
  /**
   * Get African languages specifically
   */
  getAfricanLanguages(): LanguageCode[] {
    return ['en', 'fr', 'sw', 'ar', 'pt'].filter(
      code => code in SUPPORTED_LANGUAGES
    ) as LanguageCode[];
  }
}

// Singleton instance
export const languageDetector = new LanguageDetector();

/**
 * Convenience function for quick language detection
 */
export async function detectUserLanguage(): Promise<LanguageCode> {
  const result = await languageDetector.detect();
  return result.detected;
}

/**
 * Store user's language preference
 */
export function saveLanguagePreference(code: LanguageCode): void {
  languageDetector.storeLanguage(code);
}

/**
 * Clear user's language preference
 */
export function clearLanguagePreference(): void {
  languageDetector.clearStoredLanguage();
}
