import React from 'react';

export const metadata = {
  es: {
    title: "Cumple de Silvia!",
    description: "Hola Soy Silvia y quería invitarte a mi Cumple",
    icon: "https://jv-digital.com/icons/vp/silvia/icon.png",
  },
  en: {
    title: "Silvia's Birthday!",
    description: "Hi, I'm Silvia and I wanted to invite you to my Birthday Party",
    icon: "https://jv-digital.com/icons/vp/silvia/icon.png",
  },
  it: {
    title: "Compleanno di Silvia!",
    description: "Ciao, sono Silvia e volevo invitarti alla mia Festa di Compleanno",
    icon: "https://jv-digital.com/icons/vp/silvia/icon.png",
  }
};

export default function VcLayout({ children, params }) {
  const idioma= params.lang;
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
        <link rel="preload" href="https://jv-digital.com/icons/vp/silvia/icon.png" as="image" type="image/png"/>     
        <link rel="icon" href={icon} type="image/png" />
        <link rel="apple-touch-icon" href={icon} /> 
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

