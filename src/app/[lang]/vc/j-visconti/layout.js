import React from 'react';


export const metadata = {
  es:{
    title:'JV-Digital: Javier Visconti',
    description:'JV-Digital: Tu Presencia OnLine - Experto en Informática y Programación. Innovación y eficiencia en Gestión Integral de Redes Sociales. Soluciones digitales a tu medida.'
  },
  en:{
    title:'JV-Digital: Javier Visconti',
    description:'JV-Digital: Your Online Presence - Expert in IT and Programming. Innovation and efficiency in Comprehensive Social Media Management. Tailored digital solutions.'
  },
  it:{
    title: 'JV-Digital: Javier Visconti',
    description:'JV-Digital: La Tua Presenza Online - Esperto in Informatica e Programmazione. Innovazione ed efficienza nella Gestione Integrale dei Social Media. Soluzioni digitali su misura.'
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
