import React from 'react';
import { AltComponent } from './altComponent/altComponent';

export const Parallax = ({ img, alt, title }) => {
  return (
    <div className='w-full'>
      <div className='seccion h-auto items-center justify-center p-4 text-center text-3xl'>
      </div>
      <div
        className='fondo relative bg-blue-900 bg-fixed bg-center bg-no-repeat'
        style={{ minWidth: '300px', minHeight: '800px', backgroundImage: `url(${img})`, backgroundSize: 'contain' }}
      >
        <AltComponent alt={alt} />
        <div className='contenedor-titulo absolute inset-0 text-center mt-24'>
          <h1 className='text-white text-3xl bg-[#1E3A8A80] w-full p-5'>{title}</h1>
        </div>
      </div>
    </div>
  );
};
