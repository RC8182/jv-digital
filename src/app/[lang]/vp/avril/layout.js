import React from 'react';

export const metadata = {
  es: {
    title: "Cumple de Avril!",
    description: "Hola Soy Avril y quería invitarte a mi Cumple",
    icon: "https://jv-digital.com/icons/vp/avril/icon.png",
  },
  en: {
    title: "Avril's Birthday!",
    description: "Hi, I'm Avril and I wanted to invite you to my Birthday Party",
    icon: "https://jv-digital.com/icons/vp/avril/icon.png",
  },
  it: {
    title: "Compleanno di Avril!",
    description: "Ciao, sono Avril e volevo invitarti alla mia Festa di Compleanno",
    icon: "https://jv-digital.com/icons/vp/avril/icon.png",
  }
};

export default function VcLayout({ children, params }) {
  // Verificar si el idioma es uno de los permitidos, si no, por defecto usamos "es"
  const idioma = ['es', 'en', 'it'].includes(params.lang) ? params.lang : 'es';
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
        <meta property="og:image:width" content="300" />
        <meta property="og:image:height" content="300" />
        <meta property="og:url" content={`https://jv-digital.com/${idioma}`} />
        <meta property="og:type" content="website" />
        
        {/* Preload y Favicon */}
        <link rel="preload" href={icon} as="image" type="image/png" />
        <link rel="icon" href={icon} type="image/png" />
        <link rel="apple-touch-icon" href={icon} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
