import { useEffect, useState } from 'react';

export default function Portada({ datos }) {
  const img = datos.bg_img;         // Imagen de fondo
  const imgParallax = datos.paralallx_img; // Segunda imagen que se irá revelando
  const [scrollY, setScrollY] = useState(0);

  // Manejar el scroll
  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        const scrollTop = document.documentElement.scrollTop;
        setScrollY(scrollTop);
      });
    };
   
    window.addEventListener('scroll', handleScroll);
   
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return (
    <div>
      {/* Contenedor con fondo parallax */}
      <div
        className="relative h-screen bg-contain bg-center bg-fixed parallax-container"
        style={{
          backgroundImage: `url(${img.src})`,
        }}
      >
        {/* Imagen secundaria que se revelará al hacer scroll */}
        <div className="contenedor-titulo absolute inset-0 bg-gray-100 bg-opacity-10 text-center">
          <div
            className="m-4 text-center absolute bottom-0 left-0 right-0"
            style={{
              height: '100%',
              overflow: 'hidden',
              transition: 'transform 0.1s ease-out',
            }}
          >
            <img
              src={imgParallax.src}
              alt="Imagen secundaria"
              className="parallax-img"
              style={{
                bottom: `${-scrollY * -1}px`,
                transform: `translateY(${Math.max(0, 300 - scrollY)}px)`,
                opacity: scrollY < 250 ? 1 : 0,
              }}
            />
          </div>
        </div>
      </div>

      {/* Sección de contenido adicional */}
      <div className="seccion h-auto items-center justify-center px-5"></div>
    </div>
  );
}
