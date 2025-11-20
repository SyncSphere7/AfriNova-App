'use client';

import './globals.css';
import { Press_Start_2P } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from '@/components/auth/session-provider';
import { I18nProvider } from '@/lib/i18n/context';

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
  return (
    <html lang="en" suppressHydrationWarning className={pressStart.variable}>
      <head>
        <title>AfriNova - AI-Powered Full-Stack Developer</title>
        <meta name="description" content="Build production-ready apps 10x faster with specialized AI agents" />
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
            </SessionProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
