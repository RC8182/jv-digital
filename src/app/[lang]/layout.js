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
  weight: ['400', '700'], // Puedes elegir los pesos que necesites
  style: ['normal'], // Agrega el estilo cursivo
  variable: '--dancing-script',
});
export const metadata = {
  es: {
    title:"JV-Digital: Tu Presencia OnLine", 
    description: "JV-Digital: Innovación y eficiencia en Gestión Integral de Redes Sociales. Soluciones digitales a tu medida.",
  },
  en: {
    title: "JV-Digital: Your Online Presence",
    description: "JV-Digital: Innovation and efficiency in Comprehensive Social Media Management. Tailored digital solutions.",
  },
  it: {
    title:"JV-Digital: La Tua Presenza Online",
    description:"JV-Digital: Innovazione ed efficienza nella Gestione Integrale dei Social Media. Soluzioni digitali su misura.",
  }
};


export default function RootLayout({ children, params }) {
  const idioma = params.lang || 'es';
  const { title, description } = metadata[idioma];

  return (
    <html lang={idioma}>
      <head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </head>
      <body className={`${inter.variable} ${roboto_mono.variable} ${dancingScript.variable}`}>
        {/* Inicializa AOS antes de renderizar el contenido */}
        <InitAnimations />
        {children}
      </body>
    </html>
  );
}
