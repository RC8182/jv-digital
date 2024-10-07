import React, { useState } from 'react';
import { FaCamera, FaThumbsUp, FaTimes } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im'; // Icono de spinner

const translations = {
  es: {
    takePhoto: 'Hacer Foto',
    uploading: 'Subiendo...',
    uploadPhoto: 'Subir Foto',
    cancel: 'Cancelar',
    uploadError: 'Error al subir la foto:',
  },
  en: {
    takePhoto: 'Take Photo',
    uploading: 'Uploading...',
    uploadPhoto: 'Upload Photo',
    cancel: 'Cancel',
    uploadError: 'Error uploading photo:',
  },
  it: {
    takePhoto: 'Scatta Foto',
    uploading: 'Caricamento...',
    uploadPhoto: 'Carica Foto',
    cancel: 'Annulla',
    uploadError: 'Errore durante il caricamento della foto:',
  },
};
function UploadPhoto({ onUpload, idioma, nombreDeLaPagina, bgboton }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Estado para el spinner

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    handleUpload(file);  // Subir automáticamente después de tomar la foto
  };

  const handleUpload = async (file) => {
    setIsLoading(true); // Mostrar spinner mientras sube
    const formData = new FormData();
    formData.append('file', file);
    formData.append('nombreDeLaPagina', nombreDeLaPagina); // Agregar nombreDeLaPagina

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Archivo subido:', data.url);
        setSelectedFile(null); // Limpiar archivo seleccionado
        setPreviewUrl(null); // Limpiar previsualización
        onUpload(); // Actualiza la lista de imágenes en el componente padre
      } else {
        console.error(`${translations[idioma].uploadError} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`${translations[idioma].uploadError} ${error}`);
    } finally {
      setIsLoading(false); // Ocultar spinner
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="flex flex-col items-center">
      {previewUrl && (
        <div className="mb-4">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-40 h-40 object-cover rounded-lg shadow-md"
          />
        </div>
      )}
      <label className={`${bgboton} text-white px-4 py-2 rounded cursor-pointer flex items-center space-x-2`}>
        <FaCamera />
        <span>{translations[idioma].takePhoto}</span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      {isLoading ? (
        <div className="flex items-center justify-center">
          <ImSpinner2 className="animate-spin text-blue-600 text-3xl" />
          <span className="ml-2 text-blue-600">{translations[idioma].uploading}</span>
        </div>
      ) : (
        selectedFile && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleUpload(selectedFile)}
              className="bg-blue-600 text-white px-4 py-2 rounded shadow-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <FaThumbsUp />
              <span>{translations[idioma].uploadPhoto}</span>
            </button>
            <button
              onClick={handleCancel}
              className="bg-red-600 text-white px-4 py-2 rounded shadow-md hover:bg-red-700 flex items-center space-x-2"
            >
              <FaTimes />
              <span>{translations[idioma].cancel}</span>
            </button>
          </div>
        )
      )}
    </div>
  );
}

export default UploadPhoto;
