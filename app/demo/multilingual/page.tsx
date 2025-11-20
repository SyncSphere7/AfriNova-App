'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Code2, Sparkles, Globe, CheckCircle2 } from 'lucide-react';
import { generateWithAgent } from '@/lib/openrouter/client';
import type { AgentType } from '@/lib/openrouter/models';
import { getNativeLanguageName } from '@/lib/openrouter/language-prompts';

/**
 * MultilingualCodeDemo - Showcase multilingual code generation
 * Demonstrates that AfriNova generates code comments in user's language
 */
export default function MultilingualCodeDemo() {
  const { language, t } = useI18n();
  const [prompt, setPrompt] = useState('Create a login form with email and password validation');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    setGeneratedCode('');

    try {
      const result = await generateWithAgent({
        agentType: 'FRONTEND' as AgentType,
        prompt,
        userLanguage: language,
        maxTokens: 2000,
        temperature: 0.7,
      });

      setGeneratedCode(result.content);
    } catch (err: any) {
      setError(err.message || 'Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  const languageName = getNativeLanguageName(language);

  return (
    <div className="container max-w-5xl py-10">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-pixel">
              Multilingual Code Generation
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            AfriNova generates code with comments in <strong>{languageName}</strong>
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Industry First
            </Badge>
            <Badge variant="outline">No Competitor Has This</Badge>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="retro-panel">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Smart Comments
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Code comments generated in your native language while keeping syntax in English
            </CardContent>
          </Card>

          <Card className="retro-panel">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                20 Languages
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              English, French, Swahili, Arabic, Portuguese, Spanish, Chinese, and 13 more
            </CardContent>
          </Card>

          <Card className="retro-panel">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" />
                Production Ready
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Code follows industry standards with proper TypeScript types and error handling
            </CardContent>
          </Card>
        </div>

        {/* Demo Interface */}
        <Card className="retro-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Try It Now
            </CardTitle>
            <CardDescription>
              Current language: <strong>{languageName}</strong> ({language.toUpperCase()})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                What do you want to build?
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your component or feature..."
                className="retro-input min-h-[100px] font-pixel text-sm"
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="retro-button w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating in {languageName}...
                </>
              ) : (
                <>
                  <Code2 className="h-4 w-4 mr-2" />
                  Generate Code in {languageName}
                </>
              )}
            </Button>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive" className="retro-panel">
                <AlertDescription className="font-pixel text-xs">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Generated Code */}
            {generatedCode && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Generated Code (Comments in {languageName})
                  </label>
                  <Badge variant="outline" className="gap-1">
                    <Globe className="h-3 w-3" />
                    {language.toUpperCase()}
                  </Badge>
                </div>
                <pre className="retro-panel p-4 overflow-x-auto bg-muted rounded-lg text-xs font-mono max-h-[500px] overflow-y-auto">
                  <code>{generatedCode}</code>
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="retro-panel">
          <CardHeader>
            <CardTitle className="text-lg">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-pixel text-xs">
                1
              </div>
              <div>
                <strong>Detect Your Language</strong>
                <p className="text-muted-foreground text-xs mt-1">
                  AfriNova automatically detects your language from geolocation or browser settings
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-pixel text-xs">
                2
              </div>
              <div>
                <strong>Inject Language Context</strong>
                <p className="text-muted-foreground text-xs mt-1">
                  AI agents receive instructions to write comments in your native language
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-pixel text-xs">
                3
              </div>
              <div>
                <strong>Generate Multilingual Code</strong>
                <p className="text-muted-foreground text-xs mt-1">
                  Code syntax stays in English, but comments and explanations are in {languageName}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competitive Advantage */}
        <Alert className="retro-panel border-primary">
          <Sparkles className="h-4 w-4" />
          <AlertDescription className="font-pixel text-xs">
            <strong>Industry First!</strong> No competitor (GitHub Copilot, Cursor, v0.dev) offers
            multilingual code generation. AfriNova is the ONLY platform serving 1.4B Africans in
            their native languages. 🌍
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
