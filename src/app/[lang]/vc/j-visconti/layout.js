import React from 'react';


export const metadata = {
  es:{
    title:'JV-Digital: Javier Visconti',
    description:'JV-Digital: Tu Presencia OnLine - Experto en Informática y Programación. Innovación y eficiencia en Gestión Integral de Redes Sociales. Soluciones digitales a tu medida.',
    icon: "https://jv-digital.com/icons/home/icon.png",
  },
  en:{
    title:'JV-Digital: Javier Visconti',
    description:'JV-Digital: Your Online Presence - Expert in IT and Programming. Innovation and efficiency in Comprehensive Social Media Management. Tailored digital solutions.',
    icon: "https://jv-digital.com/icons/home/icon.png",
  },
  it:{
    title: 'JV-Digital: Javier Visconti',
    description:'JV-Digital: La Tua Presenza Online - Esperto in Informatica e Programmazione. Innovazione ed efficienza nella Gestione Integrale dei Social Media. Soluzioni digitali su misura.',
    icon: "https://jv-digital.com/icons/home/icon.png",
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
        <link rel="preload" href="https://jv-digital.com/icons/home/icon.png" as="image" type="image/png"/>     
        <link rel="icon" href={icon} type="image/png" />
        <link rel="apple-touch-icon" href={icon} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
