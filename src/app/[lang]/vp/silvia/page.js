'use client';
import React, { useEffect, useState } from 'react';
import { Direccion } from '@/components/virtualParty/botones/ir';
import Portada from '@/components/virtualParty/portada/portada';
import UploadPhoto from '@/components/virtualParty/UploadPhoto';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaHourglassEnd } from 'react-icons/fa';
import PhotoGallery from '@/components/virtualParty/photoGallery/photoGallery';
import ScrollToTopButton from '@/components/scrollUp';
import { Asistencia } from '@/components/virtualParty/botones/asistencia';
import { datos } from './db';
import Footer from '@/components/virtualParty/footer'; // Asegúrate de importar el Footer si no lo has hecho

export default function Home({ params }) {
  const idioma = params.lang || 'it';
  const nombreDeLaPagina = 'silvia'; 
  const selectedDatos = datos[idioma];
  
  const tituloBotonDireccion = (idioma === 'es')
    ? "Ir a la Fiesta"
    : (idioma === 'it') ? 'Andare alla Festa'
    : 'Go to the Party';

  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);

  const loadImages = () => {
    fetch(`/api/images?nombreDeLaPagina=${nombreDeLaPagina}`, { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        setImages(data);
        setError(null);
      })
      .catch(err => {
        console.error('Error al cargar las imágenes:', err);
        setError('Failed to load images.');
      });
  };

  useEffect(() => {
    loadImages();
  }, []);

  return (
    <div className='bg-red-200'>
      <div className="min-h-screen max-w-[900px] bg-red-100 flex flex-col items-center justify-center mx-auto">
        <div className='h-auto w-full'>
          <Portada datos={selectedDatos.portada} fuente={'font-dancing'} />
          <ScrollToTopButton color={'text-white'} bgcolor={'bg-red-500'} bordercolor={'border-grey'} />
        </div>

        <h1 className="font-dancing text-5xl text-black-500 text-center font-bold m-8">{selectedDatos.evento.titulo}</h1>

        <div className="text-black text-center mb-8">
          {[
            { icon: FaCalendarAlt, text: selectedDatos.evento.diaEvento },
            { icon: FaClock, text: selectedDatos.evento.horaInicio },
            { icon: FaMapMarkerAlt, text: selectedDatos.evento.lugar },
            { icon: FaHourglassEnd, text: selectedDatos.evento.horaFin },
          ].map(({ icon: Icon, text }, index) => (
            <div key={index} className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:flex-row md:space-x-4">
              <Icon className="text-red-500" />
              <p className="text-lg">{text}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Direccion title={tituloBotonDireccion} bgcolor={'bg-red-500'} color={'text-white'} idioma={idioma} address={'https://www.google.com/maps/...'} />
        </div>

        <div>
          <h1 className="font-dancing text-5xl text-black-500 text-center font-bold m-8 mt-2">{selectedDatos.traer.titulo}</h1>
          <ul className="flex flex-col m-8 list-disc list-inside custom-list-sabrina5">
            {selectedDatos.traer.lista.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>

        <h1 className="font-dancing text-4xl text-black-500 text-center font-bold m-8 mt-2">{selectedDatos.recuerdos.titulo}</h1>

        <UploadPhoto onUpload={loadImages} idioma={idioma} nombreDeLaPagina={nombreDeLaPagina} bgboton={'bg-red-500'} />

        {error && <p className="text-red-500">{`Error: ${error}. Por favor, intenta nuevamente más tarde.`}</p>}

        <h1 className="font-dancing text-4xl text-black-500 text-center font-bold m-8 mt-2">{selectedDatos.recuerdos.galeria}</h1>
        <PhotoGallery images={images} selectedDatos={selectedDatos} nombreDeLaPagina={nombreDeLaPagina} onImagesChange={loadImages} />

        {/* Footer */}
        <div className="w-full mb-12">
          <Footer />
        </div>

        <div className="w-full z-50">
          <div className="bg-gpt_blue fixed bottom-0 border-t-2 border-verde1 rounded-t-lg overflow-hidden w-full max-w-[900px] mx-auto">
            <div className="flex m-2 items-center justify-between text-white">
              <Asistencia 
                titulo={selectedDatos.asistire.titulo} 
                mensaje={selectedDatos.asistire.mensaje} 
                telefono={'+393668127817'} 
                bgcolor={'bg-green-500'} 
                color={'text-white'} 
                asistencia={true} 
              />
              <Asistencia 
                titulo={selectedDatos.no_asistire.titulo} 
                mensaje={selectedDatos.no_asistire.mensaje} 
                telefono={'3668127817'} 
                bgcolor={'bg-red-500'} 
                color={'text-white'} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
