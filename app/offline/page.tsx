'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, RefreshCw, Home, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Offline Page - Shown when user is offline and page not in cache
 */
export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Auto-retry when back online
      setTimeout(() => {
        router.refresh();
      }, 500);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="container max-w-md">
        <Card className="retro-panel text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <WifiOff className="h-20 w-20 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-pixel">
              {isOnline ? 'Page Not Cached' : 'You\'re Offline'}
            </CardTitle>
            <CardDescription>
              {isOnline
                ? 'This page is not available offline yet'
                : 'Check your internet connection and try again'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isOnline && (
              <Alert className="retro-panel border-yellow-500">
                <Zap className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-xs font-pixel">
                  Your device is not connected to the internet. Some features may be limited.
                </AlertDescription>
              </Alert>
            )}

            {isOnline && (
              <Alert className="retro-panel border-green-500">
                <Zap className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-xs font-pixel">
                  ✅ You're back online! Click retry to load the page.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button
                onClick={handleRetry}
                className="retro-button w-full"
                size="lg"
                disabled={!isOnline}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {isOnline ? 'Retry' : 'Waiting for Connection...'}
              </Button>
              
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="retro-button w-full"
                size="lg"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-pixel">💡 PWA Features:</p>
              <ul className="text-left list-disc list-inside space-y-1">
                <li>Offline access to cached pages</li>
                <li>Install as mobile app</li>
                <li>Voice-to-code works offline</li>
                <li>Auto-sync when online</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
