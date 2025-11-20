# RTL (Right-to-Left) Support Documentation

## Overview

AfriNova supports **Arabic (العربية)** and other RTL languages with automatic layout flipping and proper text directionality.

## Features

### ✅ Automatic Direction Detection
- `dir="rtl"` automatically applied when Arabic is selected
- `dir="ltr"` for all other languages
- Applied via `lib/i18n/context.tsx` on language change

### ✅ Layout Flipping
- Margins: `ml-4` becomes `mr-4` in RTL
- Padding: `pl-4` becomes `pr-4` in RTL
- Flex direction: `flex-row` becomes `flex-row-reverse` in RTL
- Text alignment: `text-left` becomes `text-right` in RTL

### ✅ Component Support
- All UI components support RTL
- Buttons with icons flip correctly
- Forms and inputs align properly
- Navigation menus reverse order
- Cards and panels adapt automatically

## Implementation

### 1. HTML Direction Attribute
```tsx
// app/layout.tsx
<html lang={language} dir={isRTL ? 'rtl' : 'ltr'}>
```

### 2. CSS RTL Utilities
```css
/* app/globals.css */
[dir="rtl"] .ml-4 { margin-left: 0; margin-right: 1rem; }
[dir="rtl"] .mr-4 { margin-right: 0; margin-left: 1rem; }
[dir="rtl"] .flex-row { flex-direction: row-reverse; }
[dir="rtl"] .text-left { text-align: right; }
```

### 3. Language Detection
```tsx
// lib/i18n/languages.ts
export const RTL_LANGUAGES = ['ar']; // Arabic

export function isRTL(code: LanguageCode): boolean {
  return RTL_LANGUAGES.includes(code);
}
```

### 4. Context Integration
```tsx
// lib/i18n/context.tsx
useEffect(() => {
  document.documentElement.dir = isRTL(language) ? 'rtl' : 'ltr';
}, [language]);
```

## Testing

### Live Test Page
Visit `/test/rtl` to test RTL support with:
- Quick language switcher (English ↔ Arabic)
- 5 comprehensive tests:
  1. **Navigation Layout** - Menu/logo positioning
  2. **Text Alignment** - Right-to-left text flow
  3. **Form Elements** - Input labels and buttons
  4. **Icons with Text** - Icon positioning
  5. **Grid Layout** - Item flow direction

### Test Results
The test page shows:
- ✅ HTML `dir` attribute value
- ✅ HTML `lang` attribute value
- ✅ Context RTL flag
- ✅ Current language code
- ✅ Pass/fail status

### Manual Testing
1. Visit any page in AfriNova
2. Click language switcher in navbar
3. Select **العربية (Arabic)**
4. Observe:
   - Text aligns to the right
   - Navigation flips (menu on right)
   - Icons move to correct side
   - Forms and inputs adapt
   - All components mirror properly

## Supported RTL Languages

Currently supported:
- 🇸🇦 **Arabic** (ar) - العربية

Easily extensible to:
- 🇮🇱 Hebrew (he) - עברית
- 🇮🇷 Persian (fa) - فارسی
- 🇵🇰 Urdu (ur) - اردو

## Adding New RTL Languages

### Step 1: Update RTL_LANGUAGES array
```typescript
// lib/i18n/languages.ts
export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];
```

### Step 2: Add language metadata
```typescript
export const SUPPORTED_LANGUAGES: Record<LanguageCode, LanguageInfo> = {
  // ... existing languages
  he: {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    flag: '🇮🇱',
    region: 'Middle East',
  },
};
```

### Step 3: Add translations
```typescript
// lib/i18n/translations.ts
export const translations: Record<LanguageCode, Translations> = {
  // ... existing translations
  he: {
    common: {
      appName: 'AfriNova',
      tagline: 'בנה אפליקציות מוכנות לייצור פי 10 מהר יותר',
      // ... rest of translations
    },
  },
};
```

### Step 4: Test
- Visit `/test/rtl`
- Switch to new RTL language
- Verify all 5 tests pass

## Best Practices

### DO ✅
- Use logical properties when possible:
  - `ms-4` (margin-start) instead of `ml-4`
  - `me-4` (margin-end) instead of `mr-4`
  - `ps-4` (padding-start) instead of `pl-4`
  - `pe-4` (padding-end) instead of `pr-4`

- Test with real Arabic content:
  ```tsx
  <p>مرحبا بك في AfriNova</p>
  ```

- Use flexbox with `gap` instead of margins:
  ```tsx
  <div className="flex gap-4">
    <Button>Button 1</Button>
    <Button>Button 2</Button>
  </div>
  ```

### DON'T ❌
- Hardcode direction in components:
  ```tsx
  // ❌ Bad
  <div className="float-left">
  
  // ✅ Good
  <div className="float-start">
  ```

- Use absolute positioning without RTL consideration:
  ```tsx
  // ❌ Bad
  style={{ left: '20px' }}
  
  // ✅ Good
  style={{ insetInlineStart: '20px' }}
  ```

- Forget to test with RTL languages before deployment

## Troubleshooting

### Issue: Direction not changing
**Solution:** Clear localStorage and refresh:
```javascript
localStorage.removeItem('afrinova_language');
location.reload();
```

### Issue: Margins not flipping
**Solution:** Use Tailwind's RTL-aware classes or add custom CSS in `globals.css`:
```css
[dir="rtl"] .your-class { /* RTL-specific styles */ }
```

### Issue: Icons on wrong side
**Solution:** Use conditional classes:
```tsx
<Button>
  <Icon className={isRTL ? 'ml-2' : 'mr-2'} />
  Text
</Button>
```

## Resources

- [MDN: HTML dir attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir)
- [W3C: Structural markup and right-to-left text](https://www.w3.org/International/questions/qa-html-dir)
- [Tailwind CSS: RTL support](https://tailwindcss.com/docs/hover-focus-and-other-states#rtl-support)

## Testing Checklist

Before marking RTL support as complete:

- [ ] Visit `/test/rtl` page
- [ ] Switch to Arabic language
- [ ] Test 1: Navigation layout flips correctly
- [ ] Test 2: Text aligns to the right
- [ ] Test 3: Form elements work properly
- [ ] Test 4: Icons position correctly
- [ ] Test 5: Grid layout flows RTL
- [ ] Test on landing page
- [ ] Test on dashboard
- [ ] Test on pricing page
- [ ] Test on auth pages (login/signup)
- [ ] Test language switcher dropdown
- [ ] Test mobile responsive (hamburger menu)

## Competitive Advantage

**AfriNova is the ONLY AI coding platform with RTL support!**

| Platform | Arabic Support | RTL Layout |
|----------|----------------|------------|
| **AfriNova** | ✅ Full support | ✅ Automatic |
| GitHub Copilot | ❌ English only | ❌ No RTL |
| Cursor | ❌ English only | ❌ No RTL |
| v0.dev | ❌ English only | ❌ No RTL |
| Bolt.new | ❌ English only | ❌ No RTL |
| Replit | ❌ English only | ❌ No RTL |

**Market Impact:**
- 🇸🇦 420 million Arabic speakers worldwide
- 🌍 200+ million in North Africa (Egypt, Algeria, Morocco, Tunisia, Libya, Sudan)
- 🇦🇪 UAE, Saudi Arabia, Qatar - major tech hubs
- 💰 High-value market with strong purchasing power

---

**Built with ❤️ by AfriNova - Serving 1.4B Africans in their native languages** 🌍
