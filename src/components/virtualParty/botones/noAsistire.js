import React from 'react';
import Link from 'next/link';
import { FaThumbsDown } from 'react-icons/fa';

export const NoAsistire = ({ telefono }) => {
  const mensajeES = `Hola, me gustaría informar que no podré asistir a la fiesta. Mi nombre es ....`;
  const url = `https://api.whatsapp.com/send/?phone=${telefono}&text=${encodeURIComponent(mensajeES)}`;

  return (
    <button className="bg-red-500 text-white text-xs px-4 py-2 rounded flex items-center space-x-2">
      <FaThumbsDown />
      <Link
        className="text-white"
        target="_blank"
        rel="noopener noreferrer"
        href={url}
        passHref
      >
        <span>No Asistiré</span>
      </Link>
    </button>
  );
};
