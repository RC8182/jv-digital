import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Portada({ datos, fuente }) {
  const img = datos.bg_img;         // Imagen de fondo
  const imgParallax = datos.paralallx_img; // Segunda imagen que se irá revelando
  const [scrollY, setScrollY] = useState(0);

  // Manejar el scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={fuente}>
      {/* Contenedor de la imagen de fondo */}
      {/* Contenedor de la imagen de fondo */}
      <div
        className="relative h-screen  bg-contain bg-center bg-fixed"  // Padding adicional
        style={{
          backgroundImage: `url(${img.src})`,  // Imagen de fondo
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
        }}
      >
        {/* Imagen secundaria que se revelará al hacer scroll */}
        <div className="contenedor-titulo absolute inset-0 bg-gray-100 bg-opacity-10 text-center">
          <div
            className="m-4 text-center absolute bottom-0 left-0 right-0"
            style={{
              height: '100%',
              overflow: 'hidden', // Para limitar la visualización inicial
              transition: 'transform 0.1s ease-out',
            }}
          >
          <Image
            src={imgParallax.src}  // Segunda imagen que se va revelando
            alt="Imagen secundaria"
            width={100}
            height={100}
            style={{
              position: 'absolute',
              bottom: `${-scrollY * -1}px`,  // La imagen empieza desde la parte inferior del fondo
              left: '0',
              right: '0',
              margin: '0 auto',
              width: '100%',
              maxWidth: '1000px',  // Limita el ancho si es necesario
              minWidth:'350px',
              transform: `translateY(${Math.max(0, 300 - scrollY)}px)`, // Subida progresiva de la imagen
              opacity: scrollY < 250 ? 1 : 0,  // Desaparece después de un punto
              transition: 'opacity 0.5s ease-out',
            }}
            sizes="(max-width: 800px) 100vw, 800px"  // Ajusta las reglas responsivas si es necesario
          />
          </div>
        </div>
      </div>

      <div className="seccion h-auto items-center justify-center px-5"></div>
    </div>
  );
}
