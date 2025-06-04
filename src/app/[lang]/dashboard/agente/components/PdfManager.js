// app/[lang]/agente/components/PdfManager.js
'use client';
import { useState, useEffect } from 'react';

export default function PdfManager() {
  /* ─────────── estado ─────────── */
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading,    setUploading]    = useState(false);
  const [message,      setMessage]      = useState('');
  const [pdfList,      setPdfList]      = useState([]);

  /* ─── cargar lista ─── */
  const fetchPDFList = async () => {
    try {
      const res = await fetch('/api/dashboard/agente/pdf');
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const { pdfs } = await res.json();
      setPdfList(pdfs);
    } catch (err) {
      console.error('Error al obtener la lista:', err);
      setMessage('No se pudo cargar la lista de PDFs.');
    }
  };

  useEffect(() => { fetchPDFList(); }, []);

  /* ─── seleccionar archivo ─── */
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file?.type === 'application/pdf') {
      setSelectedFile(file);
      setMessage('');
    } else {
      setMessage('Selecciona un archivo PDF válido.');
    }
  };

  /* ─── subir PDF ─── */
  const handleUpload = async e => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/dashboard/agente/pdf', { method: 'POST', body: formData });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setMessage('PDF subido y procesado correctamente.');
      setSelectedFile(null);
      fetchPDFList();
    } catch (err) {
      console.error('Error al subir:', err);
      setMessage('Error al subir el PDF.');
    } finally {
      setUploading(false);
    }
  };

  /* ─── eliminar PDF ─── */
  const handleDelete = async docId => {
    try {
      const res = await fetch(`/api/dashboard/agente/pdf?doc_id=${docId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const { message: msg } = await res.json();
      setMessage(msg);
      fetchPDFList();
    } catch (err) {
      console.error('Error al eliminar:', err);
      setMessage('Error al eliminar el PDF.');
    }
  };

  /* ─── render ─── */
return (
  <section className="bg-gray-800 text-white p-4 sm:p-6 rounded w-full">
    <h2 className="text-2xl font-semibold mb-4">Administrador de PDFs</h2>

    {/* Formulario: en móvil flex-col, en pantallas ≥ sm flex-row */}
    <form
      onSubmit={handleUpload}
      className="flex flex-col sm:flex-row gap-3 mb-4 items-center w-full"
    >
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="w-full sm:w-auto text-sm file:bg-gray-700 file:text-white file:px-3 file:py-1 file:rounded"
      />
      <button
        type="submit"
        disabled={uploading}
        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold text-center"
      >
        {uploading ? 'Subiendo…' : 'Subir PDF'}
      </button>
    </form>

    {message && <p className="mb-3 text-sm sm:text-base">{message}</p>}

    <h3 className="text-xl mb-2">PDFs disponibles:</h3>
    {pdfList.length === 0 ? (
      <p className="text-sm">No hay PDFs cargados.</p>
    ) : (
      <ul className="space-y-2 w-full">
        {pdfList.map(({ id, filename }) => (
          <li
            key={id}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-700 px-3 py-2 rounded w-full"
          >
            {/* El nombre del archivo ocupa todo el ancho en columna y wrap en caso de ser muy largo */}
            <span className="break-words text-sm sm:text-base w-full sm:w-auto">
              {filename}
            </span>
            <button
              onClick={() => handleDelete(id)}
              className="mt-2 sm:mt-0 bg-red-600 hover:bg-red-700 px-3 py-1 rounded font-bold text-center w-full sm:w-auto"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    )}
  </section>
);

}