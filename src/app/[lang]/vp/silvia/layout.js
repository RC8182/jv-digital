import React from 'react';

export const metadata = {
  es: {
    title: "Cumple de Silvia!",
    description: "Hola Soy Silvia y quería invitarte a mi Cumple",
  },
  en: {
    title: "Silvia's Birthday!",
    description: "Hi, I'm Silvia and I wanted to invite you to my Birthday Party",
  },
  it: {
    title: "Compleanno di Silvia!",
    description: "Ciao, sono Silvia e volevo invitarti alla mia Festa di Compleanno",
  }
};

export default function VcLayout({ children, params }) {
  const idioma= params.lang;
  const { title, description } = metadata[idioma];
  return (
    <html lang={idioma}>
      <head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

