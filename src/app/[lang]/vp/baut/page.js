'use client';

import { Direccion } from '@/components/virtualParty/botones/ir';
import Footer from '@/components/virtualParty/footer';
import UploadPhoto from '@/components/virtualParty/UploadPhoto';
import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaHourglassEnd, FaChurch } from 'react-icons/fa';
import { datos } from './db';
import PhotoGallery from '@/components/virtualParty/photoGallery/photoGallery';
import Portada1 from '@/components/virtualParty/portada/portada1';
import ScrollToTopButton from '@/components/scrollUp';
import { Asistencia } from '@/components/virtualParty/botones/asistencia';

const InfoItem = ({ icon, text }) => (
  <div className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:flex-row md:space-x-4 xxs:space-y-2 xxs:flex-col">
    {icon}
    <p className="text-lg text-blue-500 xxs:text-sm">{text}</p>
  </div>
);

export default function Home({ params }) {
  const idioma = params.lang || 'it';
  const nombreDeLaPagina = 'baut'; 
  const selectedDatos = datos[idioma];
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const tituloBotonDireccion=(idioma === 'es')
  ? "Ir a la Fiesta"
  :(idioma==='it')?'Andare alla Festa'
  :'Go to the Party';

  const tituloBotonDirIglesia=(idioma === 'es')
  ? "Ir a la Iglesia"
  :(idioma==='it')?'Andare alla Chiesa'
  :'Go to the Church';

  const loadImages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/images?nombreDeLaPagina=${nombreDeLaPagina}`, { cache: 'no-store' });
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Error al cargar las imágenes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  return (
    <div className="text-blue-500">
      <ScrollToTopButton color={'text-white'} bgcolor={'bg-blue-500'} bordercolor={'border-[#cb8f22]'} />
      <div className="min-h-screen max-w-[900px] bg-white text-black flex flex-col items-center justify-center mx-auto">
        <div className='h-full w-full'>
          <Portada1 datos={selectedDatos.portada} fuente={'font-dancing'} />
        </div>

        <h1 className="font-dancing text-4xl text-blue-900 text-center font-bold m-8 xxs:text-3xl">{selectedDatos.evento.titulo}</h1>

        <div className="text-blue-500 text-center mb-8">
          <InfoItem icon={<FaCalendarAlt className="text-blue-500" aria-label="Fecha del evento" />} text={selectedDatos.evento.diaEvento} />
          
          <div className="flex flex-col items-center">
            <InfoItem icon={<FaChurch className="text-blue-500" aria-label="Iglesia" />} text={selectedDatos.evento.lugar2} />
            <Direccion
             title={tituloBotonDirIglesia}
             bgcolor={'bg-blue-500'} 
             color={'text-white'} 
             address={'https://maps.google.com/maps?hl=it&gl=it&um=1&ie=UTF-8&fb=1&sa=X&ftid=0x4786758eba22f583:0x51de5f64bebef2be'}/>
            <InfoItem icon={<FaMapMarkerAlt className="text-blue-500" aria-label="Ubicación del evento" />} text={selectedDatos.evento.lugar} />
            <Direccion
              title={tituloBotonDireccion}
              bgcolor={'bg-blue-500'} 
              color={'text-white'} 
              address={'https://www.google.com/maps/dir//L\'idrovolante+Caf%C3%A9,+Piazzale+Lido,+6,+28838+Stresa+VB/@45.7857637,8.281146,10z/data=!4m8!4m7!1m0!1m5!1m1!1s0x4786757fe5b7a821:0xb272bf71116fbd13!2m2!1d8.5245852!2d45.8905435?entry=ttu'}
            />
            <InfoItem icon={<FaClock className="text-blue-500" aria-label="Hora de inicio" />} text={selectedDatos.evento.horaInicio} />
            <InfoItem icon={<FaHourglassEnd className="text-blue-500" aria-label="Hora de finalización" />} text={selectedDatos.evento.horaFin} />
          </div>
        </div>

        <h2 className="font-dancing text-3xl text-blue-900 text-center font-bold m-8 mt-2 xxs:text-2xl">{selectedDatos.recuerdos.tema}</h2>
        <h2 className="font-dancing text-2xl text-blue-900 text-center font-bold m-8 mt-2 xxs:text-xl">{selectedDatos.recuerdos.titulo}</h2>

        <UploadPhoto
          onUpload={loadImages}
          idioma={idioma}
          nombreDeLaPagina={nombreDeLaPagina}
          bgboton={'bg-blue-500'}
        />

        <h2 className="font-dancing text-xl text-blue-900 text-center font-bold m-8 mt-2 xxs:text-lg">{selectedDatos.recuerdos.galeria}</h2>

        {loading ? (
          <p className="text-center text-blue-500">Cargando imágenes...</p>
        ) : (
          <PhotoGallery
            images={images}
            selectedDatos={selectedDatos}
            nombreDeLaPagina={nombreDeLaPagina}
            onImagesChange={loadImages}
          />
        )}

        <div className='w-full mb-12'>
          <Footer />
        </div>

        <div className="w-full z-50">
          <div className="bg-black fixed bottom-0 border-t-2 border-[#cb8f22] rounded-t-lg overflow-hidden w-full max-w-[900px] mx-auto">
            <div className="flex m-0 items-center justify-between text-white">
            <Asistencia titulo={selectedDatos.asistire.titulo} mensaje={selectedDatos.asistire.mensaje} asistencia={true} telefono={''} bgcolor={'bg-blue-500'} color={'text-white'} />
              <Asistencia titulo={selectedDatos.no_asistire.titulo} mensaje={selectedDatos.no_asistire.mensaje} telefono={''} bgcolor={'bg-blue-500'} color={'text-white'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
