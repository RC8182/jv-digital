'use client'
import React, { useEffect, useState } from 'react';
import { Asistire } from '@/components/virtualParty/botones/asistire';
import { Direccion } from '@/components/virtualParty/botones/ir';
import { NoAsistire } from '@/components/virtualParty/botones/noAsistire';
import Footer from '@/components/virtualParty/footer';
import Portada from '@/components/virtualParty/portada/portada';
import UploadPhoto from '@/components/virtualParty/UploadPhoto';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaHourglassEnd } from 'react-icons/fa';
import { datos } from './db';
import PhotoGallery from '@/components/virtualParty/photoGallery/photoGallery';
import ScrollToTopButton from '@/components/scrollUp';

export default function Home({ params }) {
  const idioma = params.lang || 'es';
  const nombreDeLaPagina = 'fabrizio'; // Aquí ajusta dinámicamente si es necesario
  const selectedDatos = datos[idioma];

  // Estado para almacenar las imágenes
  const [images, setImages] = useState([]);

  // Función para cargar las imágenes desde el servidor
  const loadImages = () => {
    fetch(`/api/images?nombreDeLaPagina=${nombreDeLaPagina}`, { cache: 'no-store' })
      .then(response => response.json())
      .then(data => setImages(data))
      .catch(error => console.error('Error al cargar las imágenes:', error));
  };

  // Efecto para cargar las imágenes al montar el componente
  useEffect(() => {
    loadImages();
  }, []);

  return (
    <div className='bg-blue-200'>
      <div className="min-h-screen max-w-[900px] bg-gray-100 flex flex-col items-center justify-center mx-auto">
        <div className='h-full w-full'>
          <Portada datos={selectedDatos.portada} fuente={'font-inter'} />
          <ScrollToTopButton color={'text-white'} bgcolor={'bg-blue-500'} bordercolor={'border-metal'}/>
        </div>

        <h1 className="text-4xl text-blue-500 text-center font-bold m-8">{selectedDatos.evento.titulo}</h1>

        <div className="text-black text-center mb-8">
          <div className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:flex-row md:space-x-4">
            <FaCalendarAlt className="text-blue-500" />
            <p className="text-lg">{selectedDatos.evento.diaEvento}</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:flex-row md:space-x-4">
            <FaClock className="text-blue-500" />
            <p className="text-lg">{selectedDatos.evento.horaInicio}</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:flex-row md:space-x-4">
            <FaMapMarkerAlt className="text-blue-500" />
            <p className="text-lg">{selectedDatos.evento.lugar}</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:flex-row md:space-x-4">
            <FaHourglassEnd className="text-blue-500" />
            <p className="text-lg">{selectedDatos.evento.horaFin}</p>
          </div>
        </div>

        <div className="flex justify-center">
          <Direccion idioma={idioma} bgcolor={'bg-blue-500'} color={'text-white'} />
        </div>

        <div className=''>
          <h1 className="text-4xl text-blue-500 text-center font-bold m-8 mt-2">{selectedDatos.traer.titulo}</h1>
          <ul className="flex flex-col m-8 list-disc list-inside custom-list">
            {selectedDatos.traer.lista.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>

        <h1 className="text-4xl text-blue-500 text-center font-bold m-8 mt-2">{selectedDatos.recuerdos.titulo}</h1>
        
        {/* Componente para subir fotos */}
        <UploadPhoto onUpload={loadImages} idioma={idioma} nombreDeLaPagina={nombreDeLaPagina}  bgboton={'bg-blue-500'} />

        {/* Galería de fotos */}
        <h1 className="text-4xl text-blue-500 text-center font-bold m-8 mt-2">{selectedDatos.recuerdos.galeria}</h1>
        <PhotoGallery 
          images={images}  
          selectedDatos={selectedDatos} 
          nombreDeLaPagina={nombreDeLaPagina} // Pasar nombreDeLaPagina
          onImagesChange={loadImages} // Pasar la función de carga de imágenes
        />

        <div className='w-full mb-12'>
          <Footer />
        </div>

        <div className="w-full z-50">
          <div className="bg-gpt_blue fixed bottom-0 border-t-2 border-verde1 rounded-t-lg overflow-hidden w-full max-w-[900px] mx-auto">
            <div className="flex m-2 items-center justify-between text-white">
              <Asistire idioma={idioma} telefono={''} bgcolor={'bg-green-500'} />
              <NoAsistire idioma={idioma} telefono={''} bgcolor={'bg-red-500'} color={'text-white'} />
              <Direccion idioma={idioma} bgcolor={'bg-blue-500'} color={'text-white'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
