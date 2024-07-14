'use client';
import React, { useRef } from 'react';

function generateVCard() {
  const vCardData = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:Visconti;Javier;;;",
    "FN:Javier Visconti",
    "ORG:JV-Digital",
    "TITLE:Informática, Programación y Gestión Integral de Redes Sociales",
    "TEL;TYPE=WORK,VOICE:+34 648416513",
    "EMAIL:info.jv.digital@gmail.com",
    "ADR;TYPE=WORK:;;Calle Caracol nº3, Los Abrigos;Tenerife;;38618;España",
    "URL:https://jv-digital.com/",
    "END:VCARD"
  ].join("\n");


  const blob = new Blob([vCardData], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);

  return url;
}

export default function Guardar({title}) {
  const downloadLinkRef = useRef(null);

  const handleDownload = () => {
    const url = generateVCard();
    downloadLinkRef.current.href = url;
    downloadLinkRef.current.download = "Javier_Visconti.vcf";
    downloadLinkRef.current.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <button onClick={handleDownload}>{title}</button>
      <a ref={downloadLinkRef} style={{ display: 'none' }}>Download</a>
    </div>
  );
}
