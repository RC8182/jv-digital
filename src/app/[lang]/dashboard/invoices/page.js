// src/app/[lang]/agente/invoices/page.js
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { exportPDF } from "./exportPDF"

export default function InvoicePage({ params }) {
  const router = useRouter()
  const lang = params.lang
  const { status } = useSession({ required: true })

  // --- Estado ---
  const [clients, setClients] = useState([])
  const [client, setClient] = useState(null)
  const [clientProducts, setClientProducts] = useState([])
  const [invoices, setInvoices] = useState([])

  const [invoiceMeta, setInvoiceMeta] = useState({
    number: "",
    date: new Date().toISOString().slice(0, 10)
  })
  const [includeIGIC, setIncludeIGIC] = useState(true)
  const [includeIRPF, setIncludeIRPF] = useState(true)
  // IMPORTANTE: unitPrice y discount se inicializan como STRINGS
  const [items, setItems] = useState([
    { code: "", description: "", quantity: 1, unitPrice: "0", discount: "0" }
  ])
  const [editingInvoiceId, setEditingInvoiceId] = useState(null)

  // Pedir próximo número global al montar
  useEffect(() => {
    fetch("/api/agente/invoices/next-number")
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(({ nextNumber }) =>
        setInvoiceMeta(prev => ({ ...prev, number: nextNumber }))
      )
      .catch(console.error)
  }, [])

  // Cargar lista de clientes
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/clients")
        .then(r => r.json())
        .then(setClients)
        .catch(console.error)
    }
  }, [status])

  // Muestra un indicador de carga mientras se autentica
  if (status === "loading") {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
            <p>Cargando página de facturas...</p>
        </div>
    );
  }

  // Datos del emisor
  const issuer = {
    name: "Javier Nicolás Visconti",
    address: "C/ Caracol nº 3, 38618 Los Abrigos, Tenerife",
    phone: "+34 648416513",
    email: "info@jv-digital.com",
    nif: "X8465115B"
  }
  const IGIC_RATE = 0.07
  const IRPF_RATE = 0.07 // Corregido a 0.15 para consistencia con el backend

  // Helpers de formulario
  const updateMeta = (field, value) =>
    setInvoiceMeta(prev => ({ ...prev, [field]: value }))

  const addItem = () =>
    setItems(prev => [
      ...prev,
      // IMPORTANTE: unitPrice y discount se inicializan como STRINGS
      { code: "", description: "", quantity: 1, unitPrice: "0", discount: "0" }
    ])
  const removeItem = i =>
    setItems(prev => prev.filter((_, idx) => idx !== i))

  // Función updateItem corregida para mantener STRINGS en el estado para unitPrice y discount
  const updateItem = (i, field, rawValue) => {
    setItems(prev => {
      const copy = [...prev];
      
      if (field === "code") {
        const prod = clientProducts.find(p => p.code === rawValue);
        if (prod) {
          copy[i].description = prod.name;
          // Al asignar desde productos, convertir a string para el estado del input
          copy[i].unitPrice = String(prod.price); 
        }
      }
      
      // Para 'quantity', asegúrate de que sea un número (puede ser 0)
      if (field === 'quantity') {
          copy[i][field] = Number(rawValue) || 0;
      } 
      // Para 'unitPrice' y 'discount', guarda el valor RAW (STRING) del input
      else if (field === 'unitPrice' || field === 'discount') {
          copy[i][field] = rawValue; // Guarda el string tal cual para permitir la coma
      } 
      // Para otros campos (code, description), guarda el string tal cual
      else {
          copy[i][field] = rawValue;
      }
      return copy;
    });
  };

  // Helper para convertir string con coma/punto a float para cálculos
  const parseNumericValue = (value) => {
    return parseFloat(String(value).replace(',', '.')) || 0;
  };

  // Cargar facturas de un cliente
  const loadInvoices = id =>
    fetch(`/api/clients/${id}/invoices`)
      .then(r => r.json())
      .then(setInvoices)
      .catch(console.error)

  const handleClientChange = async e => {
    const id = Number(e.target.value)
    if (!id) {
      setClient(null)
      setClientProducts([])
      setItems([{ code: "", description: "", quantity: 1, unitPrice: "0", discount: "0" }]) // Reset items
      setInvoices([])
      setEditingInvoiceId(null)
      return
    }
    const sel = clients.find(c => c.id === id)
    setClient(sel)
    try {
      const prods = await fetch(`/api/clients/${id}/products`)
        .then(r => r.ok ? r.json() : [])
      setClientProducts(prods)
    } catch {
      setClientProducts([])
    }
    setItems([{ code: "", description: "", quantity: 1, unitPrice: "0", discount: "0" }]) // Reset items
    setEditingInvoiceId(null)
    loadInvoices(id)
  }

  // Editar factura existente
  const editInvoice = async id => {
    const res = await fetch(`/api/agente/invoices/${id}`)
    if (!res.ok) {
      console.error("Error al cargar factura para edición:", await res.text());
      return;
    }
    const data = await res.json()
    setInvoiceMeta({
      number: data.number,
      date: data.date.slice(0, 10)
    })
    setIncludeIGIC(data.includeIGIC)
    setIncludeIRPF(data.includeIRPF)
    // IMPORTANTE: Al cargar, convierte los números de la API a STRINGS para el estado
    setItems(data.lines.map(line => ({
      code: line.code,
      description: line.description,
      quantity: line.quantity,
      unitPrice: String(line.unitPrice), // Convertir a string
      discount: String(line.discount) // Convertir a string
    })))
    setEditingInvoiceId(id)
  }

  // Eliminar factura
  const deleteInvoice = async id => {
    if (!confirm("¿Eliminar esta factura?")) return
    const res = await fetch(`/api/agente/invoices/${id}`, { method: "DELETE" })
    if (res.ok) {
      if (client) loadInvoices(client.id); // Recargar si hay cliente seleccionado
    } else {
      console.error("Error al eliminar factura:", await res.text());
      alert("Error al eliminar factura.");
    }
  }

  // Cálculos de totales (AHORA USANDO parseNumericValue)
  const subtotal = items.reduce(
    (sum, it) => sum + 
      parseNumericValue(it.quantity) * 
      parseNumericValue(it.unitPrice) * 
      (1 - parseNumericValue(it.discount) / 100),
    0
  )
  const igic = includeIGIC ? subtotal * IGIC_RATE : 0
  const irpf = includeIRPF ? subtotal * IRPF_RATE : 0
  const total = subtotal + igic - irpf

  // Validación: ¿hay al menos una línea con código+descripción?
  const canSave = items.some(it =>
    it.code.trim() !== "" && 
    it.description.trim() !== "" && 
    parseNumericValue(it.quantity) > 0 && 
    parseNumericValue(it.unitPrice) >= 0
  )

  // Guardar o actualizar factura
  const saveInvoice = async () => {
    if (!client || !canSave) {
      alert("Por favor, selecciona un cliente y añade al menos una línea de producto válida.");
      return;
    }
    // IMPORTANTE: Al enviar a la API, convertir STRINGS a números (usando parseNumericValue)
    const cleanItems = items.map(it => ({
      code: it.code,
      description: it.description,
      quantity: Number(it.quantity) || 0, // Quantity sigue siendo número directo
      unitPrice: parseNumericValue(it.unitPrice), // Convertir a número
      discount: parseNumericValue(it.discount) // Convertir a número
    }));

    // Filtrar líneas vacías o inválidas para evitar problemas en la API
    const validItems = cleanItems.filter(it => 
      it.code.trim() !== "" && it.description.trim() !== "" && it.quantity > 0 && it.unitPrice >= 0
    );
    if (validItems.length === 0) {
      alert("Añade al menos una línea de producto válida (código, descripción, cantidad > 0, precio >= 0).");
      return;
    }

    const payload = {
      clientId: client.id,
      date: invoiceMeta.date,
      includeIGIC,
      includeIRPF,
      items: validItems
    }
    const method = editingInvoiceId ? "PUT" : "POST"
    const url = editingInvoiceId
      ? `/api/dashboar/agente/invoices/${editingInvoiceId}`
      : "/api/agente/invoices"
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        console.error("Error al guardar/actualizar factura:", await res.text());
        throw new Error("Error al guardar/actualizar factura.");
      }
      setEditingInvoiceId(null)
      loadInvoices(client.id)
      // limpiar formulario y pedir siguiente número
      setItems([{ code: "", description: "", quantity: 1, unitPrice: "0", discount: "0" }]); // Reset a STRINGS
      fetch("/api/agente/invoices/next-number")
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(({ nextNumber }) =>
          setInvoiceMeta(prev => ({ ...prev, number: nextNumber }))
        )
        .catch(console.error)
    } catch (e) {
      alert(`Error al guardar/actualizar factura: ${e.message}`);
    }
  }


  return (
    <div className="p-6 max-w-3xl mx-auto bg-gray-900 text-white rounded-lg shadow-xl">
      {/* El título "Gestión de Facturas" ahora se muestra en el layout.js */}
      <h2 className="text-xl font-bold text-teal-400 mb-4">Generar Factura</h2> {/* Título local específico */}

      {/* Metadatos y cliente */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Nº Factura</label>
          <p className="p-2 w-full bg-gray-800 border border-gray-700 rounded-md text-gray-300">
            {invoiceMeta.number}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Fecha</label>
          <input
            type="date"
            value={invoiceMeta.date}
            onChange={e => updateMeta("date", e.target.value)}
            className="p-2 w-full bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Cliente</label>
          <div className="flex items-center gap-2">
            <select
              value={client?.id || ""}
              onChange={handleClientChange}
              className="p-2 flex-1 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">— Selecciona —</option>
              {clients.map(c => (
                <option key={c.id} value={c.id} className="bg-gray-800 text-white">
                  {c.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => router.push(`/${lang}/clients`)}
              className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md font-semibold text-sm shadow-md transition-colors"
              title="Añadir Cliente"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {client && (
        <>
          {/* Impuestos */}
          <div className="flex flex-wrap gap-4 mb-6 text-gray-300">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeIGIC}
                onChange={e => setIncludeIGIC(e.target.checked)}
                className="form-checkbox h-4 w-4 text-teal-600 bg-gray-700 border-gray-600 rounded focus:ring-teal-500"
              />
              <span>Incluir IGIC ({ (IGIC_RATE * 100).toFixed(0) }%)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeIRPF}
                onChange={e => setIncludeIRPF(e.target.checked)}
                className="form-checkbox h-4 w-4 text-teal-600 bg-gray-700 border-gray-600 rounded focus:ring-teal-500"
              />
              <span>Incluir IRPF ({ (IRPF_RATE * 100).toFixed(0) }%)</span>
            </label>
          </div>

          {/* Líneas */}
          <table className="w-full mb-6 table-auto border-collapse text-sm text-gray-300">
            <thead>
              <tr className="bg-gray-700 text-white">
                {["Código", "Descripción", "Cant.", "Precio", "Dto", "Importe", ""].map(
                  h => (
                    <th key={h} className="border border-gray-600 px-2 py-2 text-left">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className="bg-gray-800 hover:bg-gray-700 transition-colors">
                  <td className="border border-gray-700 px-2 py-1 w-24">
                    <input
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
                      value={it.code}
                      onChange={e => updateItem(i, "code", e.target.value)}
                    />
                  </td>
                  <td className="border border-gray-700 px-2 py-1 flex-1">
                    <input
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
                      value={it.description}
                      onChange={e => updateItem(i, "description", e.target.value)}
                    />
                  </td>
                  <td className="border border-gray-700 px-2 py-1 w-16">
                    <input
                      type="number" // Mantener type="number" para cantidad
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
                      value={it.quantity}
                      min="0"
                      onChange={e => updateItem(i, "quantity", e.target.value)}
                    />
                  </td>
                  <td className="border border-gray-700 px-2 py-1 w-20">
                    <input
                      type="text" // <-- IMPORTANTE: Ahora type="text"
                      inputMode="decimal"
                      pattern="[0-9]*([.,][0-9]+)?"
                      // El value ahora es un STRING
                      value={it.unitPrice} 
                      onChange={e => updateItem(i, "unitPrice", e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </td>
                  <td className="border border-gray-700 px-2 py-1 w-16">
                    <input
                      type="text" // <-- IMPORTANTE: Ahora type="text"
                      inputMode="decimal"
                      pattern="[0-9]*([.,][0-9]+)?"
                      // El value ahora es un STRING
                      value={it.discount} 
                      onChange={e => updateItem(i, "discount", e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </td>
                  <td className="border border-gray-700 px-2 py-1 text-right w-24 bg-gray-700 font-semibold text-white">
                    {/* Cálculos con parseNumericValue */}
                    {(parseNumericValue(it.quantity) * parseNumericValue(it.unitPrice) * (1 - parseNumericValue(it.discount) / 100)).toFixed(2)}
                  </td>
                  <td className="border border-gray-700 px-2 py-1 text-center w-10 bg-gray-700">
                    <button 
                      onClick={() => removeItem(i)}
                      className="text-red-500 hover:text-red-400 font-bold text-lg"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={addItem}
            className="bg-blue-600 text-white px-4 py-2 rounded-md mb-6 hover:bg-blue-700 font-semibold shadow-md transition-colors"
          >
            Añadir línea
          </button>

          {/* Totales */}
          <div className="text-right space-y-1 mb-6 text-sm text-gray-300">
            <p>Subtotal: <span className="font-semibold text-white">{subtotal.toFixed(2)} €</span></p>
            {includeIGIC && <p>IGIC ({ (IGIC_RATE * 100).toFixed(0) }%): <span className="font-semibold text-white">{igic.toFixed(2)} €</span></p>}
            {includeIRPF && <p>IRPF ({ (IRPF_RATE * 100).toFixed(0) }%): <span className="font-semibold text-white">-{irpf.toFixed(2)} €</span></p>}
            <p className="font-bold text-lg text-teal-400">Total: {total.toFixed(2)} €</p>
          </div>

          {/* Guardar / Exportar */}
          {canSave && (
            <div className="flex flex-wrap gap-4 justify-center sm:justify-start mb-4">
              <button
                onClick={saveInvoice}
                className="bg-teal-600 text-white px-6 py-3 rounded-md hover:bg-teal-700 font-semibold shadow-md transition-colors flex-1 sm:flex-none"
              >
                {editingInvoiceId ? "Actualizar Factura" : "Guardar Factura"}
              </button>
              <button
                onClick={() => exportPDF({
                  invoiceMeta,
                  issuer,
                  client,
                  items: items.map(it => ({ // IMPORTANTE: Convertir a números para el PDF
                    ...it,
                    quantity: parseNumericValue(it.quantity),
                    unitPrice: parseNumericValue(it.unitPrice),
                    discount: parseNumericValue(it.discount)
                  })),
                  includeIGIC,
                  includeIRPF,
                  subtotal,
                  igic,
                  irpf,
                  total
                })}
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 font-semibold shadow-md transition-colors flex-1 sm:flex-none"
              >
                Exportar a PDF
              </button>
            </div>
          )}

          {/* Listado de facturas */}
          {invoices.length > 0 ? (
            <section className="mb-6 border-t border-gray-700 pt-6">
              <h2 className="text-lg font-semibold text-teal-400 mb-3">Facturas de {client.name}</h2>
              <ul className="list-none space-y-2">
                {invoices.map(inv => (
                  <li key={inv.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-800 rounded-md p-3 shadow-sm border border-gray-700">
                    <span className="text-gray-300 mb-2 sm:mb-0">
                      <span className="font-semibold text-white mr-2">#{inv.number}</span>
                      {new Date(inv.date).toLocaleDateString('es-ES')} —{" "}
                      <span className="font-bold text-teal-400">{inv.total.toFixed(2)} €</span>
                    </span>
                    <div className="flex space-x-3 text-sm">
                      <button
                        onClick={() => editInvoice(inv.id)}
                        className="text-blue-500 hover:text-blue-400 font-semibold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteInvoice(inv.id)}
                        className="text-red-500 hover:text-red-400 font-semibold"
                      >
                        Borrar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            client && <p className="mb-6 text-gray-400 text-center border-t border-gray-700 pt-6">No hay facturas para este cliente.</p>
          )}
        </>
      )}
    </div>
  )
}