// src/app/[lang]/private/invoices/ExportPdfButton.jsx
"use client"

export default function ExportPdfButton({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-2 rounded text-white ${
        disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700"
      }`}
    >
      Exportar a PDF
    </button>
  )
}
