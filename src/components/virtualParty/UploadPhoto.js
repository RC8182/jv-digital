'use client'
import React, { useState } from 'react';
import { FaCamera, FaThumbsUp, FaTimes } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im'; // Icono de spinner

function UploadPhoto({ onUpload }) {
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
    setIsLoading(true); // Iniciar el spinner
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Archivo subido:', data.url);
        // alert('Foto subida exitosamente');
        setSelectedFile(null);
        setPreviewUrl(null);
        onUpload();  // Refrescar la lista de imágenes
      } else {
        console.error('Error al subir la foto:', response.statusText);
      }
    } catch (error) {
      console.error('Error al subir la foto:', error);
    } finally {
      setIsLoading(false); // Detener el spinner
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
      <label className="bg-green-500 text-white px-4 py-2 rounded cursor-pointer mb-4 flex items-center space-x-2">
        <FaCamera />
        <span>Hacer Foto</span>
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
          <span className="ml-2 text-blue-600">Subiendo...</span>
        </div>
      ) : (
        // selectedFile && (
        //   <div className="flex space-x-2">
        //     <button
        //       onClick={() => handleUpload(selectedFile)}
        //       className="bg-blue-600 text-white px-4 py-2 rounded shadow-md hover:bg-blue-700 flex items-center space-x-2"
        //     >
        //       <FaThumbsUp />
        //       <span>Subir Foto</span>
        //     </button>
        //     <button
        //       onClick={handleCancel}
        //       className="bg-red-600 text-white px-4 py-2 rounded shadow-md hover:bg-red-700 flex items-center space-x-2"
        //     >
        //       <FaTimes />
        //       <span>Cancelar</span>
        //     </button>
        //   </div>
        // )
        <div></div>
      )}
    </div>
  );
}

export default UploadPhoto;
