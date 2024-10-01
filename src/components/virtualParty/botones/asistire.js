import React from 'react';
import Link from 'next/link';
import { FaThumbsUp } from 'react-icons/fa';

export const Asistire = ({ telefono }) => {
  const mensajeES = `Hola, me gustaría confirmar mi asistencia a la fiesta. Mi nombre es ....`;
  const url = `https://api.whatsapp.com/send/?phone=${telefono}&text=${encodeURIComponent(mensajeES)}`;

  return (
    <button className="bg-green-500 text-white text-xs p-2 rounded flex items-center space-x-2">
      <FaThumbsUp />
      <Link
        className="text-white"
        target="_blank"
        rel="noopener noreferrer"
        href={url}
        passHref
      >
        <span>Asistiré</span>
      </Link>
    </button>
  );
};
