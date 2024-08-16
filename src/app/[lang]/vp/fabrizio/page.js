'use client';
import { Direccion } from '@/components/virtualParty/botones/ir';
import Footer from '@/components/virtualParty/footer';
import Portada from '@/components/virtualParty/portada/portada';
import UploadPhoto from '@/components/virtualParty/UploadPhoto';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaHourglassEnd, FaDownload, FaTrashAlt } from 'react-icons/fa';

export default function Home() {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const loadImages = () => {
    fetch('/api/images', { cache: 'no-store' })
      .then(response => response.json())
      .then(data => setImages(data))
      .catch(error => console.error('Error al cargar las imágenes:', error));
  };

  const handleDelete = async (imageName) => {
    const inputKey = prompt('Por favor ingresa la clave de administrador:');
    if (inputKey === '123') {
      try {
        const response = await fetch('/api/delete-image', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: imageName }),
        });

        if (response.ok) {
          alert('Imagen eliminada exitosamente');
          setImages(images.filter(image => image.name !== imageName));
        } else {
          console.error('Error al eliminar la imagen:', response.statusText);
        }
      } catch (error) {
        console.error('Error al eliminar la imagen:', error);
      }
    } else {
      alert('Clave de administrador incorrecta.');
    }
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
      <Portada />
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

      <div className="flex justify-center">
        <Direccion />
      </div>

      <div>
        <h1 className="text-4xl text-blue-500 text-center font-bold m-8 mt-2">No olvides traer:</h1>
        <ul className="flex flex-col m-8 list-disc list-inside custom-list">
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
            <div key={index} className="relative w-40 h-40 overflow-hidden rounded-lg shadow-md">
              <img
                src={`data:image/jpeg;base64,${image.data}`}
                alt={`Uploaded ${image.name}`}
                className="object-cover w-full h-full cursor-pointer"
                onClick={() => setSelectedImage(`data:image/jpeg;base64,${image.data}`)}
              />
              <div className="absolute bottom-0 left-0 flex p-1">
                <a
                  href={`/uploads/${image.name}`}
                  download={image.name}
                  className="text-white hover:text-gray-300"
                >
                  <FaDownload />
                </a>
              </div>
              <div className="absolute bottom-0 right-0 flex p-1">
                <button
                  onClick={() => handleDelete(image.name)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative">
            <img src={selectedImage} alt="Selected" className="max-w-full max-h-full" />
            <button
              className="absolute top-0 right-0 m-4 text-white text-2xl"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
