'use client';
import React, { useEffect, useState } from 'react';
import { Direccion } from '@/components/virtualParty/botones/ir';
import Footer from '@/components/virtualParty/footer';
import Portada from '@/components/virtualParty/portada/portada';
import UploadPhoto from '@/components/virtualParty/UploadPhoto';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaHourglassEnd } from 'react-icons/fa';
import PhotoGallery from '@/components/virtualParty/photoGallery/photoGallery';
import ScrollToTopButton from '@/components/scrollUp';
import { Asistencia } from '@/components/virtualParty/botones/asistencia';
import { datos } from './db ';

export default function Home({ params }) {
  const idioma = params.lang || 'it';
  const nombreDeLaPagina = 'sabrina'; 
  const selectedDatos = datos[idioma];
  const tituloBotonDireccion=(idioma === 'es')
  ? "Ir a la Fiesta"
  :(idioma==='it')?'Andare alla Festa'
  :'Go to the Party';

  const [images, setImages] = useState([]);

  const loadImages = () => {
    fetch(`/api/images?nombreDeLaPagina=${nombreDeLaPagina}`, { cache: 'no-store' })
      .then(response => response.json())
      .then(data => setImages(data))
      .catch(error => console.error('Error al cargar las imágenes:', error));
  };

  useEffect(() => {
    loadImages();
  }, []);

  return (
    <div className='bg-red-200'>
      <div className="min-h-screen max-w-[900px] bg-pink-100 flex flex-col items-center justify-center mx-auto">
        <div className='h-auto w-full'>
          <Portada datos={selectedDatos.portada} fuente={'font-dancing'} />
          <ScrollToTopButton color={'text-white'} bgcolor={'bg-red-500'} bordercolor={'border-grey'} />
        </div>

        <h1 className="font-dancing text-5xl text-black-500 text-center font-bold m-8 xxs:text-3xl">{selectedDatos.evento.titulo}</h1>

        <div className="text-black text-center mb-8">
          <div className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:flex-row md:space-x-4 xxs:space-y-2 xxs:flex-col">
            <FaCalendarAlt className="text-red-500" />
            <p className="text-lg xxs:text-sm">{selectedDatos.evento.diaEvento}</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:flex-row md:space-x-4 xxs:space-y-2 xxs:flex-col">
            <FaClock className="text-red-500" />
            <p className="text-lg xxs:text-sm">{selectedDatos.evento.horaInicio}</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:flex-row md:space-x-4 xxs:space-y-2 xxs:flex-col">
            <FaMapMarkerAlt className="text-red-500" />
            <p className="text-lg xxs:text-sm">{selectedDatos.evento.lugar}</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:flex-row md:space-x-4 xxs:space-y-2 xxs:flex-col">
            <FaHourglassEnd className="text-red-500" />
            <p className="text-lg xxs:text-sm">{selectedDatos.evento.horaFin}</p>
          </div>
        </div>

        <div className="flex justify-center">
          <Direccion title={tituloBotonDireccion} bgcolor={'bg-red-500'} color={'text-white'} />
        </div>

        <div>
          <h1 className="font-dancing text-5xl text-black-500 text-center font-bold m-8 mt-2 xxs:text-3xl">{selectedDatos.traer.titulo}</h1>
          <ul className="flex flex-col m-8 list-disc list-inside custom-list-sabrina5 xxs:text-sm">
            {selectedDatos.traer.lista.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>

        <h1 className="font-dancing text-4xl text-black-500 text-center font-bold m-8 mt-2 xxs:text-2xl">{selectedDatos.recuerdos.titulo}</h1>
        
        <UploadPhoto onUpload={loadImages} idioma={idioma} nombreDeLaPagina={nombreDeLaPagina} bgboton={'bg-red-500'} />

        <h1 className="font-dancing text-4xl text-black-500 text-center font-bold m-8 mt-2 xxs:text-2xl">{selectedDatos.recuerdos.galeria}</h1>
        <PhotoGallery 
          images={images}  
          selectedDatos={selectedDatos} 
          nombreDeLaPagina={nombreDeLaPagina} 
          onImagesChange={loadImages} 
        />

        <div className='w-full mb-12'>
          <Footer />
        </div>

        <div className="w-full z-50">
          <div className="bg-gpt_red fixed bottom-0 border-t-2 border-verde1 rounded-t-lg overflow-hidden w-full max-w-[900px] mx-auto">
            <div className="flex m-2 items-center justify-between text-white">
              <Asistencia titulo={selectedDatos.asistire.titulo} mensaje={selectedDatos.asistire.mensaje} telefono={''} bgcolor={'bg-green-500'} color={'text-white'} asistencia={true} />
              <Asistencia titulo={selectedDatos.no_asistire.titulo} mensaje={selectedDatos.no_asistire.mensaje} telefono={''} bgcolor={'bg-red-500'} color={'text-white'} />
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
