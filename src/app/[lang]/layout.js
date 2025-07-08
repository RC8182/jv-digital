import React from 'react';
import { Inter, Roboto_Mono, Dancing_Script } from 'next/font/google';
import './globals.css';
import SessionProviderWrapper from '@/components/SessionProviderWrapper';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal'],
  variable: '--dancing-script',
});

export default function RootLayout({ children, params }) {
  return (
    <html lang={params.lang}>
      <body suppressHydrationWarning={true}>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
        
      </body>
    </html>
  );
}
