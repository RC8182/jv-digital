import React from 'react';


export const metadata = {
  es: {
    title: "Cumple de Fabrizio!",
    description: "Hola Soy Fabrizio y quería invitarte a mi Cumple Playa el 29-08-2024",
  },
  en: {
    title: "Fabrizio's Birthday!",
    description: "Hi, I'm Fabrizio and I wanted to invite you to my Beach Birthday Party on 29-08-2024",
  },
  it: {
    title: "Compleanno di Fabrizio!",
    description: "Ciao, sono Fabrizio e volevo invitarti alla mia Festa di Compleanno in Spiaggia il 29-08-2024",
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



