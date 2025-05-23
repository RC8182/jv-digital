'use client';
import { Asistencia } from '@/components/virtualParty/botones/asistencia';
import { Direccion } from '@/components/virtualParty/botones/ir';
import Footer from '@/components/virtualParty/footer';
import UploadPhoto from '@/components/virtualParty/UploadPhoto';
import React, { useEffect, useState, useRef } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaPause, FaPlay } from 'react-icons/fa';
import { datos } from './db';
import PhotoGallery from '@/components/virtualParty/photoGallery/photoGallery';
import Portada1 from '@/components/virtualParty/portada/portada';
import ScrollToTopButton from '@/components/scrollUp';

export default function Home({ params }) {
  const idioma = params.lang || 'it';
  const nombreDeLaPagina = 'avril';
  const selectedDatos = datos[idioma];

  const [images, setImages] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const loadImages = () => {
    fetch(`/api/images?nombreDeLaPagina=${nombreDeLaPagina}`, { cache: 'no-store' })
      .then(response => response.json())
      .then(data => setImages(data))
      .catch(error => console.error('Error al cargar las imágenes:', error));
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    loadImages();
  }, []);

  const tituloBotonDireccion = idioma === 'it' ? 'Come Arrivare' : 'Cómo Llegar';
  const direccionAddress = 'https://www.google.com/maps/dir/...';

  return (
    <div className='bg-[#CFF5D0]'>
      {/* Botón de música */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={toggleMusic}
          className="bg-[#FBE382] text-[#4E342E] p-3 rounded-full hover:bg-[#F9D44B] transition"
          title={isPlaying ? 'Detener música' : 'Reproducir música'}
        >
          {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
        </button>
      </div>

      {/* Audio */}
      <audio ref={audioRef} loop>
        <source src="/icons/vp/avril/capybara-it.mp3" type="audio/mpeg" />
        Tu navegador no soporta el audio.
      </audio>

      <ScrollToTopButton color={'text-[#4E342E]'} bgcolor={'bg-[#FBE382]'} bordercolor={'border-[#82B47E]'} />

      <div className="min-h-screen max-w-[900px] bg-[#E5FFF2] text-[#4E342E] flex flex-col items-center justify-center mx-auto">
        <div className='h-full w-full'>
          <Portada1 datos={selectedDatos.portada} fuente={'font-dancing'} />
        </div>

        <h1 className="font-dancing text-5xl text-center font-bold m-8">{selectedDatos.evento.titulo}</h1>

        <div className="text-[#4E342E] text-center mb-8">
          <div className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:flex-row md:space-x-4">
            <FaCalendarAlt />
            <p className="text-lg">{selectedDatos.evento.diaEvento}</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:flex-row md:space-x-4">
            <FaClock />
            <p className="text-lg">{selectedDatos.evento.horaInicio}</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-4 md:space-y-0 md:flex-row md:space-x-4">
            <FaMapMarkerAlt />
            <p className="text-lg">{selectedDatos.evento.lugar}</p>
          </div>

          <div className="flex justify-center mt-4">
            <Direccion 
              title={tituloBotonDireccion}
              bgcolor={'bg-[#FBE382]'}
              color={'text-[#4E342E]'}
              idioma={idioma} 
              address={direccionAddress} 
              className="py-3 px-6 rounded-lg text-center font-bold transition-all duration-300 hover:bg-[#F9D44B]"
            />
          </div>
        </div>

        <h2 className="font-dancing text-xl text-[#82B47E] text-center font-bold m-8 mt-2">{selectedDatos.recuerdos.tema}</h2>
        <h2 className="font-dancing text-5xl text-center font-bold m-8 mt-2">{selectedDatos.recuerdos.titulo}</h2>

        <UploadPhoto
          onUpload={loadImages}
          idioma={idioma}
          nombreDeLaPagina={nombreDeLaPagina}
          bgboton={'bg-[#FBE382]'}
          color={'text-[#4E342E]'}
          className="py-3 px-6 rounded-lg text-center font-bold transition-all duration-300 hover:bg-[#F9D44B]"
        />

        <h2 className="font-dancing text-5xl text-center font-bold m-8 mt-2">{selectedDatos.recuerdos.galeria}</h2>

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
          <div className="bg-[#E5FFF2] fixed bottom-0 border-t-2 border-[#82B47E] rounded-t-lg overflow-hidden w-full max-w-[900px] mx-auto">
            <div className="flex m-2 items-center justify-between text-[#4E342E]">
              <Asistencia 
                titulo={selectedDatos.asistire.titulo} 
                mensaje={selectedDatos.asistire.mensaje} 
                telefono={'+393914625937'} 
                bgcolor={'bg-[#FBE382]'}  
                color={'text-[#4E342E]'} 
                asistencia={true} 
              />
              <Asistencia 
                titulo={selectedDatos.no_asistire.titulo} 
                mensaje={selectedDatos.no_asistire.mensaje} 
                telefono={'+393914625937'} 
                bgcolor={'bg-[#FBE382]'}  
                color={'text-[#4B3621]'} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
