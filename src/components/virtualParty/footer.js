import React from 'react';
import Image from 'next/image';
import logo from '/public/photos/icons/jv-digital-rm-bg.png'; // Asegúrate de que la ruta al logo sea correcta

export default function Footer() {
  return (
    <div className="bg-gray-800 text-white py-4 flex items-center justify-center w-full mt-4">
      <div className="flex items-center space-x-2">
        <Image src={logo.src} alt="JV-Digital Logo" width={50} height={50} />
        <p className="text-sm">{` © ${new Date().getFullYear()} , JV-Digital. All Rights Reserved.`}</p>
      </div>
    </div>
  );
}
