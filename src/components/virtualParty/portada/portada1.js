import { useEffect, useState } from 'react';

export default function Portada({ datos }) {
  const img = datos.bg_img;         // Imagen de fondo
  const imgParallax = datos.paralallx_img; // Segunda imagen que se irá revelando
  const [scrollY, setScrollY] = useState(0);

  // Manejar el scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop;
      setScrollY(scrollTop);
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
        className="relative h-screen bg-contain bg-center bg-fixed"
        style={{
          backgroundImage: `url(${img.src})`,  // Imagen de fondo
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',  // Ajuste a la pantalla completa
        }}
      >
        {/* Imagen secundaria que se revelará al hacer scroll */}
        <div className="contenedor-titulo absolute inset-0 bg-gray-100 bg-opacity-10 text-center">
          <div
            className="m-4 text-center absolute bottom-0 left-0 right-0"
            style={{
              height: '100%',
              overflow: 'hidden',  // Limitar la visualización inicial
              transition: 'transform 0.1s ease-out',
            }}
          >
            <img
              src={imgParallax.src}  // Segunda imagen que se va revelando
              alt="Imagen secundaria"
              style={{
                position: 'absolute',
                bottom: `${-scrollY * -1}px`,  // La imagen empieza desde la parte inferior del fondo
                left: '0',
                right: '0',
                margin: '0 auto',
                width: '100%',
                maxWidth: '1000px',  // Limitar el ancho si es necesario
                minWidth: '350px',
                transform: `translateY(${Math.max(0, 300 - scrollY)}px)`,  // Subida progresiva de la imagen
                opacity: scrollY < 250 ? 1 : 0,  // Desaparece después de un punto
                transition: 'opacity 0.5s ease-out',
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
