// pages/pdf_manager.js
"use client";
import { useState, useEffect } from "react";

export default function PDFManager() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [pdfList, setPdfList] = useState([]);

  const fetchPDFList = async () => {
    try {
      const res = await fetch("http://localhost:8000/list_pdfs");
      const data = await res.json();
      setPdfList(data.pdfs);
    } catch (error) {
      console.error("Error al obtener la lista de PDFs:", error);
    }
  };

  useEffect(() => {
    fetchPDFList();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      setMessage("Por favor, selecciona un archivo PDF.");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const res = await fetch("http://localhost:8000/upload_pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setMessage("PDF subido y procesado correctamente.");
      setSelectedFile(null);
      fetchPDFList();
    } catch (error) {
      console.error("Error al subir el PDF:", error);
      setMessage("Error al subir el PDF.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (pdf_id) => {
    try {
      const res = await fetch(`http://localhost:8000/delete_pdf?pdf_id=${pdf_id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      setMessage(data.message);
      fetchPDFList();
    } catch (error) {
      console.error("Error al eliminar el PDF:", error);
      setMessage("Error al eliminar el PDF.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6">Administrador de PDFs</h1>
      
      <form onSubmit={handleUpload} className="mb-4">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="mb-2"
        />
        <button
          type="submit"
          disabled={uploading}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          {uploading ? "Subiendo..." : "Subir PDF"}
        </button>
      </form>
      
      {message && <p className="mb-4">{message}</p>}
      
      <h2 className="text-2xl mb-4">PDFs Disponibles:</h2>
      {pdfList.length === 0 ? (
        <p>No hay PDFs disponibles.</p>
      ) : (
        <ul>
          {pdfList.map((pdf) => (
            <li key={pdf.id} className="mb-2 flex justify-between items-center">
              <span>{pdf.filename}</span>
              <button
                onClick={() => handleDelete(pdf.id)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
