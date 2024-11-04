import React from 'react';
import Image from 'next/image';
import logo from '/public/photos/icons/jv-digital-rm-bg.png'; // Asegúrate de que la ruta al logo sea correcta

export default function Footer() {
  return (
    <div className="bg-gray-800 text-white py-4 flex items-center justify-center w-full mt-4 xxs:py-2">
      <div className="flex items-center space-x-2 xxs:space-x-1">
        <Image src={logo.src} alt="JV-Digital Logo" width={40} height={40} className="xxs:w-8 xxs:h-8" />
        <p className="text-sm xxs:text-xxs">{` © ${new Date().getFullYear()} , JV-Digital. All Rights Reserved.`}</p>
      </div>
    </div>
  );
}
