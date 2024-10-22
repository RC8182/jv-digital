import React from 'react';
import Link from 'next/link';
import {FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

export const Asistencia = ({ telefono, titulo, mensaje, bgcolor, color, asistencia }) => {
  const url = `https://api.whatsapp.com/send/?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;
  const icono=(asistencia === true)?  <FaThumbsUp /> :  <FaThumbsDown />

  return (
    <button className={`${color} ${bgcolor} text-xs px-4 py-2 rounded flex items-center space-x-2`}>
     {icono}
      <Link
        className="text-white"
        target="_blank"
        rel="noopener noreferrer"
        href={url}
        passHref
      >
        <span>{titulo}</span>
      </Link>
    </button>
  );
};
