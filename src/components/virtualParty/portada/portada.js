

export default function Portada({datos, fuente}) {
  const h1 = datos.h1;
  const h2 = datos.h2;
  const sub = datos.subtitulo;
  const img = datos.img;
  const emojis1 = datos.emojis1;
  const emojis2 = datos.emojis2;

  return (
    <div className={fuente}>
      <div className='fondo relative' 
style={{ minWidth: '300px', minHeight: '600px', backgroundImage: `url(${img.src})`, backgroundPosition: 'top center', backgroundAttachment: 'fixed', backgroundRepeat: 'no-repeat' }}>
        
        <div className='contenedor-titulo absolute inset-0 bg-gray-700 bg-opacity-50 text-center'>
          <div className='flex flex-col'>
            <div className='m-4 text-4xl'>
              {emojis1}
            </div>
            <div className='titulo justify-center text-white py-12 text-4xl flex flex-col tracking-widest'>
              <h2>{h2}</h2>
            </div>
            <div className='flex justify-center p-4 text-lg text-white'>
              <h2>{sub}</h2>
            </div>
            <div className='flex flex-col justify-center w-9/10 m-auto'></div>
            <div className='titulo  justify-center text-4xl text-white py-2 flex flex-col tracking-widest'>
              <h1>{h1}</h1>
            </div>
            <div className='m-4 text-center text-4xl absolute bottom-0 left-0 right-0'>

              {emojis2}
            </div>
          </div>
        </div>
      </div>
      <div className='seccion h-auto items-center justify-center px-5'></div>
    </div>
  );
}
