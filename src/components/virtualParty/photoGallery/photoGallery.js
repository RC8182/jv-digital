'use client';
import React, { useState } from 'react';
import { FaDownload, FaTrashAlt } from 'react-icons/fa';
import FsLightbox from 'fslightbox-react';

export default function PhotoGallery({ images, selectedDatos, onImagesChange, nombreDeLaPagina }) {
  const [lightboxController, setLightboxController] = useState({
    toggler: false,
    slide: 0,
  });

  // Función para eliminar una imagen
  const handleDelete = async (imageName) => {
    const inputKey = prompt(selectedDatos.admin.clavePrompt);
    if (inputKey === '123') {
      try {
        const response = await fetch('/api/delete-image', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: imageName,
            nombreDeLaPagina: nombreDeLaPagina, // Enviar el nombre de la página
          }),
        });

        if (response.ok) {
          alert(selectedDatos.admin.eliminarExito);
          onImagesChange(); // Refrescar imágenes después de eliminar
        } else {
          console.error(selectedDatos.admin.eliminarError, response.statusText);
        }
      } catch (error) {
        console.error(selectedDatos.admin.eliminarError, error);
      }
    } else {
      alert(selectedDatos.admin.claveIncorrecta);
    }
  };

  // Función para abrir la imagen en el lightbox
  const openLightboxOnSlide = (index) => {
    setLightboxController({
      toggler: !lightboxController.toggler,
      slide: index + 1, // FsLightbox empieza en 1
    });
  };

  return (
    <div>
      
      {images.length === 0 ? (
        <p className="text-lg text-gray-500">{selectedDatos.recuerdos.primerFoto}</p>
      ) : (
        <div className="flex flex-wrap gap-4 m-2">
          {images.map((image, index) => (
            <div key={index} className="relative w-40 h-40 overflow-hidden rounded-lg shadow-md">
              <img
                src={`data:image/jpeg;base64,${image.data}`}
                alt={`Uploaded ${image.name}`}
                className="object-cover w-full h-full cursor-pointer"
                onClick={() => openLightboxOnSlide(index)}
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

      <FsLightbox
        toggler={lightboxController.toggler}
        sources={images.map(image => `data:image/jpeg;base64,${image.data}`)}
        slide={lightboxController.slide}
      />
    </div>
  );
}
