'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, X, Smartphone, Zap, Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * PWA Install Prompt - Encourages users to install AfriNova as PWA
 * 
 * Features:
 * - Auto-detects PWA installability
 * - Shows native install prompt
 * - Dismissible with localStorage persistence
 * - Mobile-optimized
 */
export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      const daysSinceDismissed = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 5 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for app installed event
    const installedHandler = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show native install prompt
    deferredPrompt.prompt();

    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted PWA install');
    } else {
      console.log('User dismissed PWA install');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    setShowPrompt(false);
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="retro-panel max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-pixel flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Install AfriNova
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="retro-button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Install AfriNova as an app for the best experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Benefits */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm">Faster loading with offline support</span>
            </div>
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm">Works like a native mobile app</span>
            </div>
            <div className="flex items-center gap-3">
              <Wifi className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm">Voice-to-code works offline</span>
            </div>
            <div className="flex items-center gap-3">
              <Download className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm">No app store required</span>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3 w-3" />
              Instant Load
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Wifi className="h-3 w-3" />
              Offline Mode
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Smartphone className="h-3 w-3" />
              Full Screen
            </Badge>
          </div>

          {/* Install Button */}
          <Button
            onClick={handleInstall}
            className="retro-button w-full"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Install Now
          </Button>

          {/* Dismiss Button */}
          <Button
            onClick={handleDismiss}
            variant="outline"
            className="retro-button w-full"
          >
            Maybe Later
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            You can always install later from your browser menu
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
