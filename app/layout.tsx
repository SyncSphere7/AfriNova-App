'use client';

import './globals.css';
import { Press_Start_2P } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from '@/components/auth/session-provider';
import { I18nProvider } from '@/lib/i18n/context';
import { PWAInstallPrompt } from '@/components/shared/pwa-install-prompt';
import { useEffect } from 'react';

const pressStart = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning className={pressStart.variable}>
      <head>
        <title>AfriNova - AI-Powered Full-Stack Developer</title>
        <meta name="description" content="Build production-ready apps 10x faster with specialized AI agents" />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="AfriNova" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AfriNova" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#D4C5A8" />
        
        {/* iOS Splash Screens */}
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="apple-touch-startup-image" href="/icon-512x512.png" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicon */}
        <link rel="icon" href="/icon-192x192.png" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <SessionProvider>
              {children}
              <PWAInstallPrompt />
            </SessionProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
