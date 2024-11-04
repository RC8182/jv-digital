'use client';

import { Direccion } from '@/components/virtualParty/botones/ir';
import Footer from '@/components/virtualParty/footer';
import UploadPhoto from '@/components/virtualParty/UploadPhoto';
import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaHourglassEnd, FaDownload, FaTrashAlt } from 'react-icons/fa';
import { datos } from './db';
import PhotoGallery from '@/components/virtualParty/photoGallery/photoGallery';
import Portada1 from '@/components/virtualParty/portada/portada1';
import ScrollToTopButton from '@/components/scrollUp';

export default function Home({params}) {
  const idioma = params.lang || 'it';
  const nombreDeLaPagina = '50'; // Aquí ajusta dinámicamente si es necesario
  const selectedDatos = datos[idioma];
  const tituloBotonDireccion=(idioma === 'es')
  ? "Ir a la Fiesta"
  :(idioma==='it')?'Andare alla Festa'
  :'Go to the Party';

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
    <div className='bg-black'>
      <ScrollToTopButton color={'text-black'} bgcolor={'bg-[#fef5fa]'} bordercolor={'border-[#cb8f22]'}/>
      <div className="min-h-screen max-w-[900px] bg-[#fef5fa] text-white flex flex-col items-center justify-center mx-auto">
        <div className='h-full w-full'>
          <Portada1 datos={selectedDatos.portada} fuente={'font-dancing'} />
        </div>
        
        <h1 className="font-dancing text-5xl text-[#cb8f22] text-center font-bold m-8 xxs:text-3xl">{selectedDatos.evento.titulo}</h1>
  
        <div className="text-gray-500 text-center mb-8">
          <div className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:flex-row md:space-x-4">
            <FaCalendarAlt className="text-[#cb8f22]" />
            <p className="text-lg xxs:text-sm">{selectedDatos.evento.diaEvento}</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:flex-row md:space-x-4">
            <FaClock className="text-[#cb8f22]" />
            <p className="text-lg xxs:text-sm">{selectedDatos.evento.horaInicio}</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:flex-row md:space-x-4">
            <FaMapMarkerAlt className="text-[#cb8f22]" />
            <p className="text-lg xxs:text-sm">{selectedDatos.evento.lugar}</p>
          </div>
          {/* <div className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:flex-row md:space-x-4">
            <FaHourglassEnd className="text-[#cb8f22]" />
            <p className="text-lg">{selectedDatos.evento.horaFin}</p>
          </div> */}
        </div>
        <div className="">
        <h2 className="font-dancing text-xl text-[#cb8f22] text-center font-bold m-8 mt-2 xxs:text-lg">{selectedDatos.recuerdos.tema}</h2>
        </div>
  
  
        <h2 className="font-dancing text-5xl text-[#cb8f22] text-center font-bold m-8 mt-2 xxs:text-3xl">{selectedDatos.recuerdos.titulo}</h2>
        {/* Componente para subir fotos */}
        <UploadPhoto 
          onUpload={loadImages} 
          idioma={idioma} 
          nombreDeLaPagina={nombreDeLaPagina}
          bgboton={'bg-[#cb8f22]'} />
        
        <h2 className="font-dancing text-5xl text-[#cb8f22] text-center font-bold m-8 mt-2 xxs:text-3xl">{selectedDatos.recuerdos.galeria}</h2>

        {/* Galería de fotos */}
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
        <div className="bg-black fixed bottom-0  border-t-2 border-[#cb8f22] rounded-t-lg overflow-hidden w-full max-w-[900px] mx-auto">
          <div className="flex m-2 items-center justify-between text-white">
            {/* <Asistire idioma={idioma} telefono={''} /> */}
            
            {/* <NoAsistire idioma={idioma} telefono={''} bgcolor={''} color={'text-white'} /> */}
            <Direccion 
              idioma={idioma}
              title={tituloBotonDireccion} 
              bgcolor={''} 
              color={'text-white'}
              address={'https://www.google.es/maps/place/Lido+Beach+Club+Baveno/@45.913307,8.5022583,17z/data=!4m14!1m7!3m6!1s0x4785dfc1d79614cd:0x85599d5b02035eb9!2sLido+Beach+Club+Baveno!8m2!3d45.9133033!4d8.5048332!16s%2Fg%2F1w0j31m2!3m5!1s0x4785dfc1d79614cd:0x85599d5b02035eb9!8m2!3d45.9133033!4d8.5048332!16s%2Fg%2F1w0j31m2?hl=ES&entry=ttu&g_ep=EgoyMDI0MTAwMi4xIKXMDSoASAFQAw%3D%3D'} />
            <UploadPhoto onUpload={loadImages} idioma={idioma} nombreDeLaPagina={nombreDeLaPagina} />
          </div>
        </div>
      </div>

    </div>
    </div>
  );
}
