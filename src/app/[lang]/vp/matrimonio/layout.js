import React from 'react';


export const metadata = {
  es:{
    title: "Matrimonio !",
    description:''
  },
  en:{
    title: "Matrimonio!",
    description:''
  },
  it:{
    title: "Matrimonio!",
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

