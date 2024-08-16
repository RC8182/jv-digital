'use client'
import { Direccion } from '@/components/virtualParty/botones/ir';
import Footer from '@/components/virtualParty/footer';
import Portada from '@/components/virtualParty/portada/portada';
import UploadPhoto from '@/components/virtualParty/UploadPhoto';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaHourglassEnd } from 'react-icons/fa';

export default function Home() {
  const [images, setImages] = useState([]);

  const loadImages = () => {
    fetch('/api/images', { cache: "no-store" })  // Deshabilita el caché
      .then(response => response.json())
      .then(data => setImages(data))
      .catch(error => console.error('Error al cargar las imágenes:', error));
  };

  useEffect(() => {
    loadImages();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <Head>
        <title>Fabrizio Cumple Playa</title>
        <meta name="description" content="Soy Fabrizio Visconti y te invito a mi Cumple!" />
      </Head>
      <Portada/>
      <h1 className="text-4xl text-blue-500 text-center font-bold m-8">Te estaremos esperando!</h1>

      <div className="text-black text-center mb-8">
        <div className="flex items-center justify-center space-x-4">
          <FaCalendarAlt className="text-blue-500" />
          <p className="text-lg">Día del Evento: 29 de Agosto, 2024</p>
        </div>
        <div className="flex space-x-4">
          <FaClock className="text-blue-500" />
          <p className="text-lg">Hora de Inicio: 5:00 PM</p>
        </div>
        <div className="flex space-x-4">
          <FaMapMarkerAlt className="text-blue-500" />
          <p className="text-lg">Lugar: Playa La Jaquita</p>
        </div>
        <div className="flex space-x-4">
          <FaHourglassEnd className="text-blue-500" />
          <p className="text-lg">Hora de Finalización: 8:00 PM</p>
        </div>
      </div>
        <div className='flex justify-center'>
          <Direccion/>
        </div>
      <div>
        <h1 className="text-4xl text-blue-500 text-center font-bold m-8 mt-2">No olvides traer:</h1>
        <ul className='flex flex-col m-8 list-disc list-inside custom-list'>
          <li>Bañador, toalla y ropa de recambio</li>
          <li>Protección Solar</li>
          <li>Si deseas puedes traer tus juegos de playa</li>
          <li>Toalla</li>
          <li>Muchas ganas de divertirte!</li>
        </ul>
        
      </div>


      <h1 className="text-4xl text-blue-500 text-center font-bold m-8 mt-2">Comparte tus recuerdos!</h1>
      <UploadPhoto onUpload={loadImages} />
      <h2 className="text-2xl text-blue-500 font-bold mb-4">Galería de Fotos</h2>
      {images.length === 0 ? (
        <p className="text-lg text-gray-500">¡Sé el primero en colgar una foto!</p>
      ) : (
        <div className="flex flex-wrap gap-4 m-2">
          {images.map((image, index) => (
            <div key={index} className="w-40 h-40 overflow-hidden rounded-lg shadow-md">
            <img
              src={`/uploads/${image}?t=${new Date().getTime()}`}
              alt={`Uploaded ${image}`}
              className="object-cover w-full h-full"
            />
            </div>
          ))}
        </div>
      )}
      <Footer/>
    </div>
  );
}
