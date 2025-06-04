// src/app/[lang]/dashboard/invoices/SaveInvoiceButton.js
"use client"

export default function SaveInvoiceButton({ onClick, disabled, editing }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded text-white ${
        disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {editing ? "Actualizar Factura" : "Guardar Factura"}
    </button>
  )
}
