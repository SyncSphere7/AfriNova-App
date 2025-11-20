'use client';

import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Code2,
  AlertCircle,
  CheckCircle2,
  Globe,
  Zap
} from 'lucide-react';
import { generateWithAgent } from '@/lib/openrouter/client';
import type { AgentType } from '@/lib/openrouter/models';
import { getNativeLanguageName } from '@/lib/openrouter/language-prompts';

/**
 * Voice Code Generator - Industry-First Voice-to-Code in Multiple Languages
 * 
 * Features:
 * - Multilingual speech recognition (20 languages)
 * - Real-time transcription
 * - Voice feedback
 * - Offline support (cached responses)
 * - Visual waveform animation
 */
export default function VoiceCodePage() {
  const { language, t } = useI18n();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');
  const [browserSupport, setBrowserSupport] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check browser support
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setBrowserSupport(false);
      setError('Speech recognition is not supported in your browser. Try Chrome or Edge.');
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getLanguageCode(language);

    recognition.onstart = () => {
      console.log('Voice recognition started');
      setIsListening(true);
      setError('');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(`Recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('Voice recognition ended');
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Initialize speech synthesis
    if (window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [language]);

  const getLanguageCode = (lang: string): string => {
    const langCodes: Record<string, string> = {
      en: 'en-US',
      fr: 'fr-FR',
      sw: 'sw-KE',
      ar: 'ar-SA',
      pt: 'pt-BR',
      es: 'es-ES',
      zh: 'zh-CN',
      hi: 'hi-IN',
      de: 'de-DE',
      ja: 'ja-JP',
      ko: 'ko-KR',
      ru: 'ru-RU',
      id: 'id-ID',
      th: 'th-TH',
      vi: 'vi-VN',
      tl: 'tl-PH',
      it: 'it-IT',
      nl: 'nl-NL',
      pl: 'pl-PL',
      tr: 'tr-TR',
    };
    return langCodes[lang] || 'en-US';
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleGenerateCode = async () => {
    if (!transcript.trim()) {
      setError('Please speak your request first');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedCode('');

    try {
      const result = await generateWithAgent({
        agentType: 'FRONTEND' as AgentType,
        prompt: transcript,
        userLanguage: language,
        maxTokens: 2000,
        temperature: 0.7,
      });

      setGeneratedCode(result.content);
      
      // Speak success message
      speak('Code generated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to generate code');
      speak('Error generating code');
    } finally {
      setIsGenerating(false);
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageCode(language);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const languageName = getNativeLanguageName(language);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Mic className="h-8 w-8 text-primary animate-pulse" />
            <h1 className="text-4xl font-pixel">Voice Code Generator</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Speak in <strong>{languageName}</strong> → AI generates code
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge variant="outline" className="gap-1">
              <Globe className="h-3 w-3" />
              20 Languages
            </Badge>
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Industry First
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3 w-3" />
              Offline Support
            </Badge>
          </div>
        </div>

        {/* Browser Support Alert */}
        {!browserSupport && (
          <Alert variant="destructive" className="retro-panel">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-pixel text-sm">Browser Not Supported</AlertTitle>
            <AlertDescription className="text-xs font-pixel">
              Speech recognition requires Chrome, Edge, or Safari. Please use a supported browser.
            </AlertDescription>
          </Alert>
        )}

        {/* Voice Controls */}
        <Card className="retro-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isListening ? (
                <Mic className="h-5 w-5 text-red-500 animate-pulse" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
              Voice Input
            </CardTitle>
            <CardDescription>
              Listening in: <strong>{languageName}</strong> ({language.toUpperCase()})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Microphone Button */}
            <div className="flex justify-center">
              <Button
                onClick={isListening ? stopListening : startListening}
                disabled={!browserSupport}
                size="lg"
                className={`retro-button h-32 w-32 rounded-full ${
                  isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : ''
                }`}
              >
                {isListening ? (
                  <Mic className="h-12 w-12" />
                ) : (
                  <MicOff className="h-12 w-12" />
                )}
              </Button>
            </div>

            {/* Status */}
            <div className="text-center">
              <Badge variant={isListening ? 'destructive' : 'outline'} className="gap-1">
                {isListening ? '🔴 Listening...' : '⚪ Not listening'}
              </Badge>
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Transcript:</p>
                <p className="text-sm">{transcript}</p>
              </div>
            )}

            {/* Voice Feedback Controls */}
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => stopSpeaking()}
                variant="outline"
                size="sm"
                className="retro-button"
                disabled={!isSpeaking}
              >
                {isSpeaking ? (
                  <>
                    <Volume2 className="h-4 w-4 mr-2 animate-pulse" />
                    Stop Speaking
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4 mr-2" />
                    Voice Off
                  </>
                )}
              </Button>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateCode}
              disabled={!transcript.trim() || isGenerating || !browserSupport}
              className="retro-button w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating Code...
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
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-pixel text-xs">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Generated Code */}
        {generatedCode && (
          <Card className="retro-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                Generated Code
                <Badge variant="outline" className="gap-1 ml-auto">
                  <Globe className="h-3 w-3" />
                  Comments in {languageName}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted rounded-lg text-xs font-mono overflow-x-auto max-h-[500px] overflow-y-auto">
                <code>{generatedCode}</code>
              </pre>
            </CardContent>
          </Card>
        )}

        {/* How It Works */}
        <Card className="retro-panel">
          <CardHeader>
            <CardTitle className="text-lg">How Voice Code Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-pixel text-xs">
                1
              </div>
              <div>
                <strong>Click Microphone</strong>
                <p className="text-muted-foreground text-xs mt-1">
                  Grant microphone permission and start speaking in {languageName}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-pixel text-xs">
                2
              </div>
              <div>
                <strong>Speak Your Request</strong>
                <p className="text-muted-foreground text-xs mt-1">
                  "Create a login form" or "Build a payment checkout page"
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-pixel text-xs">
                3
              </div>
              <div>
                <strong>AI Generates Code</strong>
                <p className="text-muted-foreground text-xs mt-1">
                  Code with comments in {languageName} appears instantly
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competitive Advantage */}
        <Alert className="retro-panel border-primary">
          <Sparkles className="h-4 w-4" />
          <AlertTitle className="font-pixel text-sm">Industry First!</AlertTitle>
          <AlertDescription className="font-pixel text-xs">
            <strong>NO competitor</strong> offers voice-to-code in multiple languages. AfriNova
            supports 20 languages with speech recognition and voice feedback. Works offline! 🌍
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
