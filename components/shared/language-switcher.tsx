'use client';

import { useState } from 'react';
import { Languages, Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/lib/i18n/context';
import { SUPPORTED_LANGUAGES, getAllLanguages, type LanguageCode } from '@/lib/i18n/languages';

interface LanguageSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  africanOnly?: boolean;
}

/**
 * LanguageSwitcher - Dropdown for changing language
 * 
 * Features:
 * - Geolocation-aware language detection (IP → Country → Language)
 * - Flag emoji + Native names (Français, Kiswahili, العربية, Português)
 * - Current language highlighted with checkmark
 * - African languages prioritized (en, fr, sw, ar, pt)
 * - Shows detection source (browser/geolocation/stored)
 * - Retro Windows 95 aesthetic
 */
export function LanguageSwitcher({
  variant = 'ghost',
  size = 'sm',
  showLabel = true,
  africanOnly = false,
}: LanguageSwitcherProps = {}) {
  const { language, setLanguage, detectionResult } = useI18n();
  const [open, setOpen] = useState(false);
  
  const languages = getAllLanguages();
  const currentLanguage = languages.find(lang => lang.code === language);

  // African priority languages
  const africanLanguages = ['en', 'fr', 'sw', 'ar', 'pt'];
  const africanLangs = languages.filter(lang => africanLanguages.includes(lang.code));
  const otherLangs = languages.filter(lang => !africanLanguages.includes(lang.code));

  const handleLanguageChange = (code: LanguageCode) => {
    setLanguage(code);
    setOpen(false);
  };

  const displayLanguages = africanOnly ? africanLangs : languages;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className="gap-2 retro-button"
          aria-label="Change language"
        >
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline text-lg">{currentLanguage?.flag}</span>
          {showLabel && (
            <span className="hidden md:inline text-xs font-pixel">
              {currentLanguage?.nativeName}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-72 max-h-[500px] overflow-y-auto border-2 border-foreground shadow-pixel"
        sideOffset={8}
      >
        {/* Header with detection info */}
        <DropdownMenuLabel className="font-pixel text-xs uppercase flex items-center gap-2">
          <Globe className="h-3 w-3" />
          Select Language
        </DropdownMenuLabel>

        {/* Show detection source (if not manually stored) */}
        {detectionResult && detectionResult.source !== 'stored' && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground font-pixel">
            📍 Detected: {detectionResult.source}
            {detectionResult.confidence < 0.8 && ' (low confidence)'}
          </div>
        )}

        <DropdownMenuSeparator className="bg-border h-0.5" />

        {/* African Languages (Priority) */}
        {!africanOnly && africanLangs.length > 0 && (
          <>
            <DropdownMenuLabel className="font-pixel text-xs text-muted-foreground px-2 py-1">
              🌍 African Languages
            </DropdownMenuLabel>
            {africanLangs.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code as LanguageCode)}
                className={`font-pixel cursor-pointer group hover:bg-accent ${
                  language === lang.code ? 'bg-accent text-accent-foreground' : ''
                }`}
              >
                <span className="mr-3 text-xl">{lang.flag}</span>
                <div className="flex-1 flex flex-col">
                  <span className="font-medium">{lang.nativeName}</span>
                  <span className="text-xs text-muted-foreground">
                    {lang.name} • {lang.region}
                  </span>
                </div>
                {language === lang.code && (
                  <Check className="h-4 w-4 text-primary ml-2" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-border h-0.5 my-2" />
          </>
        )}

        {/* African Only Mode */}
        {africanOnly && displayLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code as LanguageCode)}
            className={`font-pixel cursor-pointer group hover:bg-accent ${
              language === lang.code ? 'bg-accent text-accent-foreground' : ''
            }`}
          >
            <span className="mr-3 text-xl">{lang.flag}</span>
            <div className="flex-1 flex flex-col">
              <span className="font-medium">{lang.nativeName}</span>
              <span className="text-xs text-muted-foreground">
                {lang.name} • {lang.region}
              </span>
            </div>
            {language === lang.code && (
              <Check className="h-4 w-4 text-primary ml-2" />
            )}
          </DropdownMenuItem>
        ))}

        {/* Other Languages */}
        {!africanOnly && otherLangs.length > 0 && (
          <>
            <DropdownMenuLabel className="font-pixel text-xs text-muted-foreground px-2 py-1">
              🌐 Other Languages
            </DropdownMenuLabel>
            {otherLangs.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code as LanguageCode)}
                className={`font-pixel cursor-pointer group hover:bg-accent ${
                  language === lang.code ? 'bg-accent text-accent-foreground' : ''
                }`}
              >
                <span className="mr-3 text-xl">{lang.flag}</span>
                <div className="flex-1 flex flex-col">
                  <span className="font-medium">{lang.nativeName}</span>
                  <span className="text-xs text-muted-foreground">{lang.name}</span>
                </div>
                {language === lang.code && (
                  <Check className="h-4 w-4 text-primary ml-2" />
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Compact language switcher (flag only, African languages only)
 */
export function LanguageSwitcherCompact() {
  return (
    <LanguageSwitcher
      variant="ghost"
      size="icon"
      showLabel={false}
      africanOnly={true}
    />
  );
}
