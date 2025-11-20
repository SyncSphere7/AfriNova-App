export const SUPPORTED_LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', region: 'Global' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', region: 'Latin America, Spain' },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', region: 'China, Taiwan, Singapore' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'India' },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', region: 'Brazil, Portugal, Angola' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', region: 'France, Canada, Africa' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', region: 'Germany, Austria' },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', region: 'Japan' },
  ko: { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', region: 'South Korea' },
  ru: { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', region: 'Russia, Eastern Europe' },
  id: { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', region: 'Indonesia' },
  th: { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', region: 'Thailand' },
  vi: { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', region: 'Vietnam' },
  tl: { code: 'tl', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭', region: 'Philippines' },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', region: 'Italy' },
  nl: { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', region: 'Netherlands, Belgium' },
  pl: { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', region: 'Poland' },
  tr: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', region: 'Turkey' },
  sw: { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', region: 'East Africa' },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', region: 'Middle East, North Africa' },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const RTL_LANGUAGES: LanguageCode[] = ['ar'];

export function isRTL(code: LanguageCode): boolean {
  return RTL_LANGUAGES.includes(code);
}

export function getLanguageInfo(code: LanguageCode) {
  return SUPPORTED_LANGUAGES[code] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
}

export function getAllLanguages() {
  return Object.values(SUPPORTED_LANGUAGES);
}

export function detectBrowserLanguage(): LanguageCode {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  const browserLang = navigator.language.split('-')[0] as LanguageCode;
  return SUPPORTED_LANGUAGES[browserLang] ? browserLang : DEFAULT_LANGUAGE;
}
