'use client';
import { Asistencia } from '@/components/virtualParty/botones/asistencia';
import { Direccion } from '@/components/virtualParty/botones/ir';
import Footer from '@/components/virtualParty/footer';
import UploadPhoto from '@/components/virtualParty/UploadPhoto';
import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { datos } from './db';
import PhotoGallery from '@/components/virtualParty/photoGallery/photoGallery';
import Portada1 from '@/components/virtualParty/portada/portada1';
import ScrollToTopButton from '@/components/scrollUp';

export default function Home({ params }) {
  const idioma = params.lang || 'it';
  const nombreDeLaPagina = 'silvia'; // Adjust dynamically if needed
  const selectedDatos = datos[idioma];

  // State for storing images
  const [images, setImages] = useState([]);

  // Function to load images from the server
  const loadImages = () => {
    fetch(`/api/images?nombreDeLaPagina=${nombreDeLaPagina}`, { cache: 'no-store' })
      .then(response => response.json())
      .then(data => setImages(data))
      .catch(error => console.error('Error al cargar las imágenes:', error));
  };

  // Load images when the component mounts
  useEffect(() => {
    loadImages();
  }, []);

  // Define the title for the "Get Directions" button dynamically based on the language
  const tituloBotonDireccion = idioma === 'it' ? 'Come Arrivare' : 'Cómo Llegar'; // Adjust based on the language

  // Address for the Direccion component (updated with actual address)
  const direccionAddress = 'https://www.google.com/maps?q=Green+Village+bar+e+palazzetto,+Via+Molino,+17,+28010+Colazza+NO'; // Actual address

  return (
    <div className='bg-pink'>
    <ScrollToTopButton color={'text-black'} bgcolor={'bg-red-300'} bordercolor={'border-[#cb8f22]'} />
    <div className="min-h-screen max-w-[900px] bg-red-300 text-white flex flex-col items-center justify-center mx-auto">
      <div className='h-full w-full'>
        <Portada1 datos={selectedDatos.portada} fuente={'font-dancing'} />
      </div>
  
      <h1 className="font-dancing text-5xl text-white text-center font-bold m-8">{selectedDatos.evento.titulo}</h1>
  
      <div className="text-gray-500 text-center mb-8">
        <div className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:flex-row md:space-x-4">
          <FaCalendarAlt className="text-white" />
          <p className="text-lg">{selectedDatos.evento.diaEvento}</p>
        </div>
        <div className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:flex-row md:space-x-4">
          <FaClock className="text-white" />
          <p className="text-lg">{selectedDatos.evento.horaInicio}</p>
        </div>
        <div className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:flex-row md:space-x-4">
          <FaMapMarkerAlt className="text-white" />
          <p className="text-lg">{selectedDatos.evento.lugar}</p>
        </div>
  
        {/* Add the "Cómo Llegar" button below the event location */}
        <div className="flex justify-center mt-4">
          <Direccion 
            title={tituloBotonDireccion} // Dynamic title based on language
            bgcolor={'bg-red-900'} 
            color={'text-white'}
            idioma={idioma} 
            address={direccionAddress} 
            className="py-3 px-6 rounded-lg text-center font-bold transition-all duration-300 hover:bg-red-200" // Added hover effect and styling
          />
        </div>
      </div>
  
      <h2 className="font-dancing text-xl text-gray-500 text-center font-bold m-8 mt-2">{selectedDatos.recuerdos.tema}</h2>
  
      <h2 className="font-dancing text-5xl text-white text-center font-bold m-8 mt-2">{selectedDatos.recuerdos.titulo}</h2>
  
      {/* Upload Photo Component */}
       
    <UploadPhoto 
      onUpload={loadImages} 
      idioma={idioma} 
      nombreDeLaPagina={nombreDeLaPagina}
      bgboton={'bg-red-900'}  // Fondo (puedes mantener el color de fondo que desees)
      className="py-3 px-6 rounded-lg text-center font-bold transition-all duration-300 " // Cambiar el color del texto a gris muy claro
/>


  
      <h2 className="font-dancing text-5xl text-white text-center font-bold m-8 mt-2">{selectedDatos.recuerdos.galeria}</h2>
  
      {/* Photo Gallery */}
      <PhotoGallery 
        images={images} 
        selectedDatos={selectedDatos} 
        nombreDeLaPagina={nombreDeLaPagina} 
        onImagesChange={loadImages} 
      />
  
      <div className='w-full mb-12'>
        <Footer />
      </div>
  
      {/* Fixed Bottom Bar for Assistance Buttons */}
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
              telefono={'+393668127817'} 
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