import React from 'react';

export const metadata = {
  es: {
    title: "Cumple de Fabrizio!",
    description: "Hola Soy Fabrizio y quería invitarte a mi Cumple Playa el 29-08-2024",
    icon: "https://jv-digital.com/icons/vp/fabrizio/icon.png",
  },
  en: {
    title: "Fabrizio's Birthday!",
    description: "Hi, I'm Fabrizio and I wanted to invite you to my Beach Birthday Party on 29-08-2024",
    icon: "https://jv-digital.com/icons/vp/fabrizio/icon.png",
  },
  it: {
    title: "Compleanno di Fabrizio!",
    description: "Ciao, sono Fabrizio e volevo invitarti alla mia Festa di Compleanno in Spiaggia il 29-08-2024",
    icon: "https://jv-digital.com/icons/vp/fabrizio/icon.png",
  }
};

export default function VcLayout({ children, params }) {
  const idioma = metadata[params.lang] ? params.lang : 'en'; // Default to 'en' if lang is not valid
  const { title, description, icon } = metadata[idioma];
  return (
    <html lang={idioma}>
      <head>
        <title>{title}</title>
        <meta name="description" content={description} />
        {/* Etiquetas Open Graph para WhatsApp */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={icon} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={`https://jv-digital.com/${idioma}`} />
        <meta property="og:type" content="website" />
        <link rel="icon" href={icon} type="image/png" />
        <link rel="apple-touch-icon" href={icon} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
