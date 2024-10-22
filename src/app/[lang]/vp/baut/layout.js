import React from 'react';


export const metadata = {
  es:{
    title: "Battessimo Mattia!",
    description:''
  },
  en:{
    title: "Battessimo Mattia!",
    description:''
  },
  it:{
    title: "Battessimo Mattia!",
    description:''
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

