'use client';
import React, { useRef } from 'react';

function generateVCard(vcard) {
  const vCardData = vcard.datos.join("\n");
  const blob = new Blob([vCardData], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);

  return url;
}

export default function Guardar({ title, vcdata }) {
  const downloadLinkRef = useRef(null);

  const handleDownload = () => {
    const url = generateVCard(vcdata);
    downloadLinkRef.current.href = url;
    downloadLinkRef.current.download = vcdata.name;
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
