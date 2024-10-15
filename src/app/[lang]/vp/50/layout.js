import React from 'react';


export const metadata = {
  es:{
    title: "Festa 50 Alessia & Carol!",
    description:''
  },
  en:{
    title: "Festa 50 Alessia & Carol!",
    description:''
  },
  it:{
    title: "Festa 50 Alessia & Carol!",
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

