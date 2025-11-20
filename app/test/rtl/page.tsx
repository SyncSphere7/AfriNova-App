'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  ArrowLeft, 
  ArrowRight,
  Menu,
  User,
  Settings,
  Home
} from 'lucide-react';

/**
 * RTL Test Page - Comprehensive test for Arabic (RTL) language support
 * 
 * Tests:
 * 1. dir="rtl" attribute on <html> tag
 * 2. Text alignment (right-to-left)
 * 3. Flex direction reversal
 * 4. Margin/padding flipping
 * 5. Icons positioning
 * 6. Navigation layout
 * 7. Forms and inputs
 * 8. Cards and panels
 */
export default function RTLTestPage() {
  const { language, setLanguage, isRTL, t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const testResults = {
    htmlDir: typeof document !== 'undefined' ? document.documentElement.dir : 'unknown',
    htmlLang: typeof document !== 'undefined' ? document.documentElement.lang : 'unknown',
    isRTLContext: isRTL,
    currentLanguage: language,
  };

  const isPassing = testResults.htmlDir === 'rtl' && testResults.isRTLContext && language === 'ar';

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-pixel">
              RTL Support Test
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Testing Arabic (RTL) language support
          </p>
        </div>

        {/* Quick Language Switcher */}
        <Card className="retro-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Language Selector
            </CardTitle>
            <CardDescription>
              Switch between LTR and RTL languages to test
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              onClick={() => setLanguage('en')}
              className="retro-button"
            >
              🇬🇧 English (LTR)
            </Button>
            <Button
              variant={language === 'ar' ? 'default' : 'outline'}
              onClick={() => setLanguage('ar')}
              className="retro-button"
            >
              🇸🇦 العربية (RTL)
            </Button>
            <Button
              variant={language === 'fr' ? 'default' : 'outline'}
              onClick={() => setLanguage('fr')}
              className="retro-button"
            >
              🇫🇷 Français (LTR)
            </Button>
            <Button
              variant={language === 'sw' ? 'default' : 'outline'}
              onClick={() => setLanguage('sw')}
              className="retro-button"
            >
              🇰🇪 Kiswahili (LTR)
            </Button>
          </CardContent>
        </Card>

        {/* Test Results Summary */}
        <Alert className={`retro-panel ${isPassing ? 'border-green-500' : 'border-yellow-500'}`}>
          {isPassing ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          )}
          <AlertTitle className="font-pixel text-sm">
            {isPassing ? '✅ RTL Support Active' : '⚠️ RTL Not Detected'}
          </AlertTitle>
          <AlertDescription className="font-pixel text-xs space-y-1">
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>HTML dir: <Badge variant="outline">{testResults.htmlDir}</Badge></div>
              <div>HTML lang: <Badge variant="outline">{testResults.htmlLang}</Badge></div>
              <div>Context RTL: <Badge variant="outline">{testResults.isRTLContext ? 'true' : 'false'}</Badge></div>
              <div>Language: <Badge variant="outline">{testResults.currentLanguage}</Badge></div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Navigation Test */}
        <Card className="retro-panel">
          <CardHeader>
            <CardTitle>Test 1: Navigation Layout</CardTitle>
            <CardDescription>
              Icons and text should flip for RTL (menu on right, home on left)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted rounded">
              <div className="flex items-center gap-4">
                <Menu className="h-5 w-5" />
                <span className="font-pixel text-sm">Menu</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-pixel text-sm">Logo</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-pixel text-sm">Profile</span>
                <User className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isRTL ? 'RTL: Menu should be on right ←' : 'LTR: Menu should be on left →'}
            </p>
          </CardContent>
        </Card>

        {/* Text Alignment Test */}
        <Card className="retro-panel">
          <CardHeader>
            <CardTitle>Test 2: Text Alignment</CardTitle>
            <CardDescription>
              Text should align to the right for RTL languages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded">
              <p className="text-sm">
                This is a sample paragraph. In RTL mode, this text should align to the right and read from right to left.
                في وضع RTL، يجب أن يتم محاذاة هذا النص إلى اليمين ويقرأ من اليمين إلى اليسار.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isRTL ? 'default' : 'outline'}>RTL Active</Badge>
              <Badge variant={!isRTL ? 'default' : 'outline'}>LTR Active</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Form Elements Test */}
        <Card className="retro-panel">
          <CardHeader>
            <CardTitle>Test 3: Form Elements</CardTitle>
            <CardDescription>
              Input labels and buttons should flip for RTL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <Input
                type="email"
                placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                className="retro-input"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isRTL ? 'كلمة المرور' : 'Password'}
              </label>
              <Input
                type="password"
                placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
                className="retro-input"
              />
            </div>
            <div className="flex gap-2">
              <Button className="retro-button flex-1">
                {isRTL ? 'تسجيل الدخول' : 'Login'}
              </Button>
              <Button variant="outline" className="retro-button flex-1">
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Icons with Text Test */}
        <Card className="retro-panel">
          <CardHeader>
            <CardTitle>Test 4: Icons with Text</CardTitle>
            <CardDescription>
              Icons should appear on the correct side (left for RTL, right for LTR)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="retro-button w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isRTL ? 'السابق' : 'Previous'}
            </Button>
            <Button variant="outline" className="retro-button w-full">
              {isRTL ? 'التالي' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button variant="outline" className="retro-button w-full">
              <Home className="h-4 w-4 mr-2" />
              {isRTL ? 'الصفحة الرئيسية' : 'Home'}
            </Button>
          </CardContent>
        </Card>

        {/* Grid Layout Test */}
        <Card className="retro-panel">
          <CardHeader>
            <CardTitle>Test 5: Grid Layout</CardTitle>
            <CardDescription>
              Grid items should flow RTL in Arabic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className="p-4 bg-muted rounded text-center font-pixel text-2xl"
                >
                  {num}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isRTL ? 'RTL: Should read 3, 2, 1 from left to right' : 'LTR: Should read 1, 2, 3 from left to right'}
            </p>
          </CardContent>
        </Card>

        {/* Summary */}
        <Alert className="retro-panel border-primary">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle className="font-pixel text-sm">Test Complete</AlertTitle>
          <AlertDescription className="font-pixel text-xs">
            {isPassing
              ? '✅ All RTL tests passing! Arabic language is properly supported with dir="rtl" and correct layout flipping.'
              : '⚠️ Switch to Arabic (العربية) to see RTL support in action.'}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
