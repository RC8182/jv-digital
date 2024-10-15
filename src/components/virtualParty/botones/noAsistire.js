import React from 'react';
import Link from 'next/link';
import { FaThumbsDown } from 'react-icons/fa';

export const NoAsistire = ({ telefono,idioma, bgcolor, color }) => {
  const mensajeES = `Hola, me gustaría informar que no podré asistir a la fiesta. Mi nombre es ....`;
  const url = `https://api.whatsapp.com/send/?phone=${telefono}&text=${encodeURIComponent(mensajeES)}`;
  const text = {
    es: 'No Asistiré',
    it: 'Non parteciperò',
    en: 'I will not attend'
};

  return (
    <button className={`${color} ${bgcolor} text-xs px-4 py-2 rounded flex items-center space-x-2`}>
      <FaThumbsDown />
      <Link
        className="text-white"
        target="_blank"
        rel="noopener noreferrer"
        href={url}
        passHref
      >
        <span>{text[idioma]}</span>
      </Link>
    </button>
  );
};
