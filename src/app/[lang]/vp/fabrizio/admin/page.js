'use client'
import React, { useEffect, useState } from 'react';

export default function Admin() {
  const [images, setImages] = useState([]);

  const loadImages = () => {
    fetch('/api/images', { cache: "no-store" }) 
      .then(response => response.json())
      .then(data => setImages(data))
      .catch(error => console.error('Error al cargar las imágenes:', error));
  };

  const deleteImage = async (imageName) => {
    try {
      const response = await fetch(`/api/delete-image`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: imageName }),
      });
  
      if (response.ok) {
        alert('Imagen eliminada exitosamente');
        setImages(images.filter(image => image !== imageName)); // Actualiza el estado inmediatamente
      } else {
        console.error('Error al eliminar la imagen:', response.statusText);
      }
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Administrar Fotos</h1>
      <div className="grid grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="w-40 h-40 overflow-hidden rounded-lg shadow-md mb-2">
            <img
              src={`/uploads/${image}`}
              alt={`Uploaded ${image}`}
              className="object-cover w-full h-full"
            />
            </div>
            <button
              onClick={() => deleteImage(image)}
              className="bg-red-600 text-white px-4 py-2 rounded shadow-md hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
