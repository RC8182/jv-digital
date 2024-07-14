'use client'
import React from 'react'

export default function Compartir({title}) {

    const handleShare = async () => {
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'JV-Digital',
              text: 'Consulta los servicios de JV-Digital.',
              url: window.location.href
            });
          } catch (error) {
            console.error('Error al compartir:', error);
          }
        } else {
          alert('La funcionalidad de compartir no es compatible con este navegador.');
        }
      };
  return (
    <div>
        <button onClick={handleShare}>{title}</button>
    </div>
  )
}
