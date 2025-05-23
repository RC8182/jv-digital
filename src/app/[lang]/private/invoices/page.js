// src/app/[lang]/private/invoices/page.js
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
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
  const [items, setItems] = useState([])
  const [editingInvoiceId, setEditingInvoiceId] = useState(null)

  // Pedir próximo número global al montar
  useEffect(() => {
    fetch("/api/private/invoices/next-number")
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(({ nextNumber }) =>
        setInvoiceMeta(prev => ({ ...prev, number: nextNumber }))
      )
      .catch(console.error)
  }, [])

  // Cargar lista de clientes
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/private/clients")
        .then(r => r.json())
        .then(setClients)
        .catch(console.error)
    }
  }, [status])

  if (status === "loading") return <p>Cargando...</p>

  // Datos del emisor
  const issuer = {
    name: "Javier Nicolás Visconti",
    address: "C/ Caracol nº 3, 38618 Los Abrigos, Tenerife",
    phone: "+34 648416513",
    email: "info@jv-digital.com",
    nif: "X8465115B"
  }
  const IGIC_RATE = 0.07
  const IRPF_RATE = 0.15

  // Helpers de formulario
  const updateMeta = (field, value) =>
    setInvoiceMeta(prev => ({ ...prev, [field]: value }))

  const addItem = () =>
    setItems(prev => [
      ...prev,
      { code: "", description: "", quantity: 1, unitPrice: 0, discount: 0 }
    ])
  const removeItem = i =>
    setItems(prev => prev.filter((_, idx) => idx !== i))
  const updateItem = (i, field, raw) =>
    setItems(prev => {
      const copy = [...prev]
      if (field === "code") {
        const prod = clientProducts.find(p => p.code === raw)
        if (prod) {
          copy[i].description = prod.name
          copy[i].unitPrice = prod.price
        }
      }
      copy[i][field] = raw
      return copy
    })

  // Cargar facturas de un cliente
  const loadInvoices = id =>
    fetch(`/api/private/clients/${id}/invoices`)
      .then(r => r.json())
      .then(setInvoices)
      .catch(console.error)

  const handleClientChange = async e => {
    const id = Number(e.target.value)
    if (!id) {
      setClient(null)
      setClientProducts([])
      setItems([])
      setInvoices([])
      setEditingInvoiceId(null)
      return
    }
    const sel = clients.find(c => c.id === id)
    setClient(sel)
    try {
      const prods = await fetch(`/api/private/clients/${id}/products`)
        .then(r => r.ok ? r.json() : [])
      setClientProducts(prods)
    } catch {
      setClientProducts([])
    }
    setItems([{ code: "", description: "", quantity: 1, unitPrice: 0, discount: 0 }])
    setEditingInvoiceId(null)
    loadInvoices(id)
  }

  // Editar factura existente
  const editInvoice = async id => {
    const res = await fetch(`/api/private/invoices/${id}`)
    if (!res.ok) return
    const data = await res.json()
    setInvoiceMeta({
      number: data.number,
      date: data.date.slice(0, 10)
    })
    setIncludeIGIC(data.includeIGIC)
    setIncludeIRPF(data.includeIRPF)
    setItems(data.lines.map(line => ({
      code: line.code,
      description: line.description,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      discount: line.discount
    })))
    setEditingInvoiceId(id)
  }

  // Eliminar factura
  const deleteInvoice = async id => {
    if (!confirm("¿Eliminar esta factura?")) return
    const res = await fetch(`/api/private/invoices/${id}`, { method: "DELETE" })
    if (res.ok) loadInvoices(client.id)
  }

  // Cálculos de totales
  const subtotal = items.reduce(
    (sum, it) => sum + it.quantity * it.unitPrice * (1 - it.discount / 100),
    0
  )
  const igic = includeIGIC ? subtotal * IGIC_RATE : 0
  const irpf = includeIRPF ? subtotal * IRPF_RATE : 0
  const total = subtotal + igic - irpf

  // Validación: ¿hay al menos una línea con código+descripción?
  const canSave = items.some(it =>
    it.code.trim() !== "" && it.description.trim() !== ""
  )

  // Guardar o actualizar factura
  const saveInvoice = async () => {
    if (!client || !canSave) return
    const cleanItems = items.map(it => ({
      code: it.code,
      description: it.description,
      quantity: Number(it.quantity) || 0,
      unitPrice: parseFloat(it.unitPrice) || 0,
      discount: parseFloat(it.discount) || 0
    }))
    const payload = {
      clientId: client.id,
      date: invoiceMeta.date,
      includeIGIC,
      includeIRPF,
      items: cleanItems
    }
    const method = editingInvoiceId ? "PUT" : "POST"
    const url = editingInvoiceId
      ? `/api/private/invoices/${editingInvoiceId}`
      : "/api/private/invoices"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      setEditingInvoiceId(null)
      loadInvoices(client.id)
      // limpiar formulario
      setItems([{ code: "", description: "", quantity: 1, unitPrice: 0, discount: 0 }])
      // pedir siguiente número
      fetch("/api/private/invoices/next-number")
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(({ nextNumber }) =>
          setInvoiceMeta(prev => ({ ...prev, number: nextNumber }))
        )
        .catch(console.error)
    }
  }


  return (
    <div className="p-6 max-w-3xl mx-auto">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Generar Factura</h1>
        <button
          onClick={() => signOut({ callbackUrl: `/${lang}` })}
          className="underline text-sm"
        >
          Cerrar sesión
        </button>
      </header>

      {/* Metadatos y cliente */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label>Nº Factura</label>
          <p className="border p-1 w-full bg-gray-100">
            {invoiceMeta.number}
          </p>
        </div>
        <div>
          <label>Fecha</label>
          <input
            type="date"
            value={invoiceMeta.date}
            onChange={e => updateMeta("date", e.target.value)}
            className="border p-1 w-full"
          />
        </div>
        <div>
          <label>Cliente</label>
          <div className="flex items-center gap-2">
            <select
              value={client?.id || ""}
              onChange={handleClientChange}
              className="border p-1 flex-1"
            >
              <option value="">— Selecciona —</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => router.push(`/${lang}/private/clients`)}
              className="bg-blue-500 text-white px-2 rounded"
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
          <div className="flex space-x-4 mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeIGIC}
                onChange={e => setIncludeIGIC(e.target.checked)}
                className="mr-1"
              />
              Incluir IGIC
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeIRPF}
                onChange={e => setIncludeIRPF(e.target.checked)}
                className="mr-1"
              />
              Incluir IRPF
            </label>
          </div>

          {/* Líneas */}
          <table className="w-full mb-4 table-auto border-collapse text-sm">
            <thead>
              <tr>
                {["Código", "Descripción", "Cant.", "Precio", "Dto", "Importe", ""].map(
                  h => (
                    <th key={h} className="border px-1">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td className="border px-1 w-20">
                    <input
                      className="w-full"
                      value={it.code}
                      onChange={e => updateItem(i, "code", e.target.value)}
                    />
                  </td>
                  <td className="border px-1 flex-1">
                    <input
                      className="w-full"
                      value={it.description}
                      onChange={e => updateItem(i, "description", e.target.value)}
                    />
                  </td>
                  <td className="border px-1 w-16">
                    <input
                      type="number"
                      className="w-full"
                      value={it.quantity}
                      min="1"
                      onChange={e => updateItem(i, "quantity", e.target.value)}
                    />
                  </td>
                  <td className="border px-1 w-16">
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*([.,][0-9]+)?"
                      value={it.unitPrice}
                      onChange={e => updateItem(i, "unitPrice", e.target.value)}
                      className="w-full"
                    />
                  </td>
                  <td className="border px-1 w-16">
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*([.,][0-9]+)?"
                      value={it.discount}
                      onChange={e => updateItem(i, "discount", e.target.value)}
                      className="w-full"
                    />
                  </td>
                  <td className="border px-1 text-right w-20">
                    {(it.quantity * it.unitPrice * (1 - it.discount / 100)).toFixed(2)}
                  </td>
                  <td className="border px-1 text-center w-10">
                    <button onClick={() => removeItem(i)}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={addItem}
            className="bg-blue-500 text-white px-3 py-1 rounded mb-6"
          >
            Añadir línea
          </button>

          {/* Totales */}
          <div className="text-right space-y-1 mb-6 text-sm">
            <p>Subtotal: {subtotal.toFixed(2)} €</p>
            {includeIGIC && <p>IGIC (7%): {igic.toFixed(2)} €</p>}
            {includeIRPF && <p>IRPF (15%): -{irpf.toFixed(2)} €</p>}
            <p className="font-semibold">Total: {total.toFixed(2)} €</p>
          </div>

          {/* Guardar / Exportar */}
          {canSave && (
            <div className="flex space-x-2 mb-4">
              <button
                onClick={saveInvoice}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {editingInvoiceId ? "Actualizar Factura" : "Guardar Factura"}
              </button>
              <button
                onClick={() => exportPDF({
                  invoiceMeta,
                  issuer,
                  client,
                  items,
                  includeIGIC,
                  includeIRPF,
                  subtotal,
                  igic,
                  irpf,
                  total
                })}
                className="bg-green-600 text-white px-6 py-2 rounded"
              >
                Exportar a PDF
              </button>
            </div>
          )}

          {/* Listado de facturas */}
          {invoices.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-semibold">Facturas de {client.name}</h2>
              <ul className="list-disc ml-6">
                {invoices.map(inv => (
                  <li key={inv.id} className="flex justify-between items-center">
                    <span>
                      {inv.number} — {new Date(inv.date).toLocaleDateString()} —{" "}
                      {inv.total.toFixed(2)} €
                    </span>
                    <div className="space-x-2">
                      <button
                        onClick={() => editInvoice(inv.id)}
                        className="text-blue-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteInvoice(inv.id)}
                        className="text-red-600"
                      >
                        Borrar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
