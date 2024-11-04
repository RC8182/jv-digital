'use client';

import { Direccion } from '@/components/virtualParty/botones/ir';
import Footer from '@/components/virtualParty/footer';
import UploadPhoto from '@/components/virtualParty/UploadPhoto';
import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaChurch } from 'react-icons/fa';
import { datos } from './db';
import PhotoGallery from '@/components/virtualParty/photoGallery/photoGallery';
import ScrollToTopButton from '@/components/scrollUp';
import { Asistencia } from '@/components/virtualParty/botones/asistencia';
import Portada1 from '@/components/virtualParty/portada/portada1';

const InfoItem = ({ icon, text }) => (
  <div className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:flex-row md:space-x-4">
    {icon}
    <p className="text-lg text-[#D2B48C]">{text}</p>
  </div>
);

const DirectionButton = ({ title, address }) => (
  <div className="flex justify-center mb-4">
    <Direccion
      title={title}
      bgcolor={'bg-[#D9785B]'} 
      color={'text-white'} 
      address={address}
    />
  </div>
);

export default function Home({ params }) {
  const idioma = params.lang || 'it';
  const nombreDeLaPagina = 'matrimonio';
  const selectedDatos = datos[idioma];
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadImages = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(`/api/images?nombreDeLaPagina=${nombreDeLaPagina}`, { cache: 'no-store' });
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Error al cargar las imágenes:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  return (
    <div className='bg-[#FFFFF0]'>
      <ScrollToTopButton color={'text-[#cb8f22]'} bgcolor={'bg-[#D2B48C]'} bordercolor={'border-[#cb8f22]'} />
      <div className="min-h-screen max-w-[900px] bg-[#FFFFF0] text-black flex flex-col items-center justify-center mx-auto">
        <div className='h-full w-full'>
          <Portada1 datos={selectedDatos.portada} fuente={'font-dancing'} />
        </div>
        <h1 className="font-dancing text-4xl text-[#D2B48C] text-center font-bold m-8 xxs:text-3xl">{selectedDatos.evento.titulo}</h1>
  
        <div className="text-[#D2B48C] text-center mb-8">
          <InfoItem 
            icon={<FaCalendarAlt className="text-[#D2B48C]" aria-label="Fecha del evento" />} 
            text={selectedDatos.evento.diaEvento} 
          />
          <InfoItem 
            icon={<FaChurch className="text-[#D2B48C]" aria-label="Iglesia" />} 
            text={selectedDatos.evento.lugar2} 
          />
          
          <DirectionButton
            title={idioma === 'es' ? "Ir a la Iglesia" : idioma === 'en' ? "Go to Church" : "Andare alla Chiesa"}
            address={'https://maps.google.com/maps?hl=it&gl=it&um=1&ie=UTF-8&fb=1&sa=X'}
          />
  
          <InfoItem icon={<FaMapMarkerAlt className="text-[#D2B48C]" aria-label="Ubicación del evento" />} text={selectedDatos.evento.lugar} />
          <InfoItem icon={<FaClock className="text-[#D2B48C]" aria-label="Hora de inicio" />} text={selectedDatos.evento.horaInicio} />
          
          <DirectionButton
            title={idioma === 'es' ? "Ir a la Fiesta" : idioma === 'en' ? "Go to the Party" : "Andare alla Festa"}
            address={'https://www.google.com/maps/dir//Corso+Umberto+I,+29,+28838+Stresa+VB'}
          />
        </div>
  
        <h2 className="font-dancing text-3xl text-[#D2B48C] text-center font-bold m-8 mt-2 xxs:text-lg">{selectedDatos.recuerdos.tema}</h2>
        <h2 className="font-dancing text-2xl text-[#D2B48C] text-center font-bold m-8 mt-2 xxs:text-xl">{selectedDatos.recuerdos.titulo}</h2>
  
        <UploadPhoto
          onUpload={loadImages}
          idioma={idioma}
          nombreDeLaPagina={nombreDeLaPagina}
          bgboton={'bg-[#D9785B]'} 
        />
  
        <h2 className="font-dancing text-xl text-[#D2B48C] text-center font-bold m-8 mt-2 xxs:text-lg">{selectedDatos.recuerdos.galeria}</h2>
  
        {loading ? (
          <p className="text-center text-black">Cargando imágenes...</p>
        ) : error ? (
          <p className="text-center text-red-500">Error al cargar imágenes. Por favor, inténtelo de nuevo.</p>
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
          <div className="bg-[#D9785B] fixed bottom-0 border-t-2 border-[#cb8f22] rounded-t-lg overflow-hidden w-full max-w-[900px] mx-auto">
            <div className="flex m-0 items-center justify-between text-white">
              <Asistencia titulo={selectedDatos.asistire.titulo} mensaje={selectedDatos.asistire.mensaje} asistencia={true} telefono={''} bgcolor={'#D9785B'} color={'text-white'} />
              <Asistencia titulo={selectedDatos.no_asistire.titulo} mensaje={selectedDatos.no_asistire.mensaje} telefono={''} bgcolor={'#D9785B'} color={'text-white'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
}
