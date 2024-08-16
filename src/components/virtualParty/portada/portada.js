import { Asistire } from '../botones/asistire';
import { Direccion } from '../botones/ir';
import { NoAsistire } from '../botones/noAsistire';
import { datos } from './db';

export default function Portada () {

    const h1 = datos.portada.h1;
    const h2 = datos.portada.h2;
    const sub = datos.portada.subtitulo;
    const img = datos.portada.img;
    const emojis1 = datos.portada.emojis1;
    const emojis2 = datos.portada.emojis2;

  return (
    <div className='w-full'>
        <div 
        className='fondo relative bg-black bg-fixed bg-center bg-no-repeat bg-cover' 
        style={{minWidth: '300px', minHeight: '600px', backgroundImage: `url(${img.src})`}}>

            <div 
                className='contenedor-titulo absolute inset-0 bg-gray-700 bg-opacity-50 text-center'>
                <div className='flex flex-col'>
                    <div className='m-4 text-4xl'>
                        {emojis1}
                    </div>
                    <div 
                    className='titulo justify-center text-white py-12 text-4xl flex flex-col tracking-widest'
                    >
                    <h2>{h2}</h2>
                    </div>
                    <div className='flex justify-center p-4 text-lg text-white'>
                        <h2>{sub}</h2>
                    </div>

                    <div className='flex flex-col justify-center w-9/10 m-auto'>
                        <Direccion/>
                    </div>
                    <div 
                        className='titulo  h-32 justify-center text-4xl text-white py-2 flex flex-col tracking-widest'>
                        <h1>{h1}</h1>
                    </div>
                    <div className="flex justify-between m-8">
                        <Asistire telefono={'34690984440'} />
                        <NoAsistire telefono={'34690984440'}/>
                    </div>
                    <div className='m-4 text-4xl'>
                        {emojis2}
                    </div>
                </div>

            </div>
        </div>

        <div className='seccion h-auto items-center justify-center px-5'></div>
    </div>
  );
}
