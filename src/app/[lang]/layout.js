import React from 'react';
import { Inter, Dancing_Script, Roboto_Mono } from 'next/font/google';
import './globals.css';
import InitAnimations from '@/components/InitAnimations';

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

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${roboto_mono.variable} ${dancingScript.variable}`}>
        <InitAnimations />
        {children}
      </body>
    </html>
  );
}
