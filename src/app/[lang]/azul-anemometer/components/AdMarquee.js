import React from 'react';
import Image from 'next/image';
import Marquee from "react-fast-marquee";
import logoJv from '../logoAdds/jv-digital-rm-bg.png';
import logoAzul from '../logoAdds/azul-fondo.jpeg';
import logoAyuntamiento from '../logoAdds/ayuntamiento-fondo.jpeg';

const AdMarquee = ({ lang = 'es' }) => {
  const adItems = [
    {
      logo: logoAyuntamiento,
      text: {
        es: 'https://granadilladeabona.org',
        en: 'https://granadilladeabona.org',
      },
      url: 'https://granadilladeabona.org',
    },
    {
      logo: logoJv,
      text: {
        es: 'JV Digital - Informática y Sistemas, programación en general y gestión de redes sociales',
        en: 'JV Digital - IT & Systems, general programming and social media management',
      },
      url: 'https://jv-digital.com',
    },
    {
      logo: logoAzul,
      text: {
        es: 'AzulKiteboarding - 🌊Visita nuestra tienda online de kitesurf y wingfoil. https://www.azulkiteboarding.com     ⭐AzulKiteboarding - Las mejores marcas al mejor precio!⭐',
        en: 'AzulKiteboarding - 🌊Visit our online store for kitesurf and wingfoil. https://www.azulkiteboarding.com     ⭐AzulKiteboarding - The best brands at the best price!⭐',
      },
      url: 'https://www.azulkiteboarding.com',
    },
  ];

  const handleClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-[#1a202c] text-white py-2">
      <Marquee 
        gradient={false} 
        speed={40}
        pauseOnHover={true}
      >
        {adItems.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center mx-12 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleClick(item.url)}
            title={`Haz clic para visitar ${item.url}`}
          >
            {item.logo && (
              <Image
                src={item.logo}
                alt={`Logo de ${item.text[lang]}`}
                height={24}
                className="mr-4"
                style={{ width: 'auto' }}
              />
            )}
            <span className="whitespace-nowrap text-sm">{item.text[lang] || item.text['es']}</span>
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default AdMarquee; 