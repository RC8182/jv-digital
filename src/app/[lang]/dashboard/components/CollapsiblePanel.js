// src/app/[lang]/agente/components/CollapsiblePanel.js
'use client';

import { useState } from 'react';

export default function CollapsiblePanel({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Encabezado del panel, clicable para expandir/colapsar */}
      <div
        className="flex justify-between items-center p-4 cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-xl font-bold text-white">{title}</h2> {/* Título de la sección */}
        <span className="text-2xl font-bold text-teal-400 select-none">
          {isOpen ? '−' : '+'} {/* Icono de expandir/colapsar */}
        </span>
      </div>

      {/* Contenido del panel, solo visible si está abierto */}
      {isOpen && (
        <div className="p-4 border-t border-gray-700"> {/* Añade un borde superior para separación visual */}
          {children}
        </div>
      )}
    </div>
  );
}