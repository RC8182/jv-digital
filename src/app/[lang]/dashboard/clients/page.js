// File: src/app/[lang]/dashboard/clients/page.js
"use client"

import { useState, useEffect } from "react"
import { useSession }          from "next-auth/react"

/* ───────────────────────────── COMPONENT ───────────────────────────── */
export default function ClientsPage({ params }) {
  const { status } = useSession({ required: true })

  /* ───────────── state ───────────── */
  const [clients,   setClients]   = useState([])
  const [epigrafes, setEpigrafes] = useState([])          // códigos IAE del usuario
  const [products,  setProducts]  = useState([])
  const [origProds, setOrigProds] = useState([])

  const [form, setForm] = useState({
    id           : null,
    name         : "",
    address      : "",
    phone        : "",
    email        : "",
    nif          : "",
    city         : "",
    epigrafesIAE : ""      // campo para el epígrafe asignado
  })

  /* ───────────── loaders ───────────── */
  const loadClients = async () => {
    try {
      const r = await fetch("/api/clients")
      if (r.ok) setClients(await r.json())
      else console.error("Error al obtener clientes:", r.statusText)
    } catch (e) {
      console.error("Error al cargar clientes:", e)
    }
  }

  const loadEpigrafes = async () => {
    try {
      const r = await fetch("/api/users/epigrafes")
      if (!r.ok) {
        console.error("Error al obtener epígrafes:", r.statusText)
        return
      }
      const { epigrafes } = await r.json()   // espera un array de strings
      setEpigrafes(epigrafes)
    } catch (e) {
      console.error("Error en loadEpigrafes:", e)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      loadClients()
      loadEpigrafes()
    }
  }, [status])

  /* ───────────── CRUD cliente ───────────── */
  const saveClient = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      alert("El nombre del cliente es obligatorio.")
      return
    }

    const url    = form.id ? `/api/clients/${form.id}` : "/api/clients"
    const method = form.id ? "PUT" : "POST"

    try {
      // 1) Guardar o actualizar cliente (incluye epígrafeIAE)
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      if (!r.ok) {
        const err = await r.json()
        throw new Error(err.error || r.statusText)
      }
      const data     = await r.json()
      const clientId = data.id

      // 2) Sincronizar productos
      const toCreate = products.filter(p => !p.id)
      const toUpdate = products.filter(p => p.id)
      const toDelete = origProds.filter(op => !products.some(p => p.id === op.id))

      // Eliminar productos
      await Promise.all(
        toDelete.map(p =>
          fetch(`/api/products/${p.id}`, { method: "DELETE" })
        )
      )
      // Crear productos nuevos
      await Promise.all(
        toCreate.map(p =>
          fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clientId,
              code : p.code,
              name : p.name,
              price: parseFloat(p.price) || 0
            })
          })
        )
      )
      // Actualizar productos existentes
      await Promise.all(
        toUpdate.map(async (p) => {
          const orig = origProds.find(o => o.id === p.id)
          if (
            !orig ||
            orig.code  !== p.code ||
            orig.name  !== p.name ||
            orig.price !== parseFloat(p.price)
          ) {
            return fetch(`/api/products/${p.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code : p.code,
                name : p.name,
                price: parseFloat(p.price) || 0
              })
            })
          }
        })
      )

      // 3) Reset form y recargar lista de clientes
      setForm({
        id           : null,
        name         : "",
        address      : "",
        phone        : "",
        email        : "",
        nif          : "",
        city         : "",
        epigrafesIAE : ""
      })
      setProducts([])
      setOrigProds([])
      loadClients()
      alert("Cliente y productos guardados correctamente.")
    } catch (err) {
      console.error("Error al guardar cliente o productos:", err)
      alert(`Error al guardar cliente o productos: ${err.message}`)
    }
  }

  const editClient = async (c) => {
    // Cargar datos del cliente en el formulario, incluido epigrafesIAE
    setForm({
      id           : c.id,
      name         : c.name,
      address      : c.address ?? "",
      phone        : c.phone   ?? "",
      email        : c.email   ?? "",
      nif          : c.nif     ?? "",
      city         : c.city    ?? "",
      epigrafesIAE : c.epigrafesIAE ?? ""
    })

    // Cargar productos asociados
    try {
      const r    = await fetch(`/api/clients/${c.id}/products`)
      const list = r.ok ? await r.json() : []
      const prods = list.map(p => ({
        id    : p.id,
        code  : p.code ?? "",
        name  : p.name,
        price : p.price
      }))
      setProducts(prods)
      setOrigProds(prods)
    } catch (e) {
      console.error("Error cargando productos del cliente:", e)
      setProducts([])
      setOrigProds([])
    }
  }

  const deleteClient = async (id) => {
    if (!confirm("¿Eliminar este cliente? Esto borrará sus productos y facturas asociadas.")) return
    try {
      const r = await fetch(`/api/clients/${id}`, { method: "DELETE" })
      if (!r.ok) {
        const err = await r.json()
        throw new Error(err.error || r.statusText)
      }
      loadClients()
    } catch (e) {
      console.error("Error al borrar cliente:", e)
      alert(`Error al borrar cliente: ${e.message}`)
    }
  }

  /* ───────────── productos handlers ───────────── */
  const addProduct    = ()           => setProducts(prev => [...prev, { id: null, code: "", name: "", price: 0 }])
  const removeProduct = (i)          => setProducts(prev => prev.filter((_, idx) => idx !== i))
  const updateProduct = (i, field, value) => {
    setProducts(prev => {
      const copy = [...prev]
      copy[i][field] = field === "price" ? parseFloat(value) || 0 : value
      return copy
    })
  }

  /* ───────────── render ───────────── */
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <p>Cargando clientes…</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-gray-900 text-white rounded-lg shadow-xl">
      <h2 className="text-xl font-bold text-teal-400 mb-4">Gestión de Clientes</h2>

      {/* ─── LISTADO DE CLIENTES ─── */}
      {clients.length > 0 ? (
        <ul className="mb-6 space-y-2">
          {clients.map((c) => (
            <li
              key={c.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-700 py-2"
            >
              <span className="text-gray-300 mb-2 sm:mb-0">
                <span className="font-semibold text-white">{c.name}</span>
                {c.address && ` — ${c.address}`}
                {c.phone   && ` — ${c.phone}`}
                {c.email   && ` — ${c.email}`}
                {c.epigrafesIAE && (
                  <span className="ml-2 text-yellow-300 text-sm">(IAE: {c.epigrafesIAE})</span>
                )}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => editClient(c)}
                  className="text-blue-500 hover:text-blue-400 font-semibold"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteClient(c.id)}
                  className="text-red-500 hover:text-red-400 font-semibold"
                >
                  Borrar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-6 text-gray-400 text-center">No hay clientes para mostrar.</p>
      )}

      {/* ─── FORMULARIO (CREAR / EDITAR) ─── */}
      <form onSubmit={saveClient} className="space-y-4">
        <h3 className="text-xl font-semibold text-teal-400">
          {form.id ? "Editar Cliente" : "Nuevo Cliente"}
        </h3>

        {/* Campos básicos */}
        <input
          placeholder="Nombre"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700 placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
          required
        />
        <input
          placeholder="Dirección"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700 placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
        />
        <input
          placeholder="Teléfono"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700 placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700 placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
        />
        <input
          placeholder="NIF"
          value={form.nif}
          onChange={(e) => setForm({ ...form, nif: e.target.value })}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700 placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
        />
        <input
          placeholder="Ciudad"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700 placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
        />

        {/* Epígrafe IAE */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Epígrafe IAE</label>
          <select
            value={form.epigrafesIAE}
            onChange={(e) => setForm({ ...form, epigrafesIAE: e.target.value })}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">— Sin epígrafe —</option>
            {epigrafes.map((codigo) => (
              <option key={codigo} value={codigo}>{codigo}</option>
            ))}
          </select>
        </div>

        {/* Productos del cliente */}
        <div>
          <h4 className="font-semibold mb-2 text-teal-400">Productos del Cliente</h4>
          {products.map((p, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
              <input
                placeholder="Código"
                value={p.code}
                onChange={(e) => updateProduct(i, "code", e.target.value)}
                className="flex-1 p-1 bg-gray-800 border border-gray-700 placeholder-gray-500"
              />
              <input
                placeholder="Nombre producto"
                value={p.name}
                required
                onChange={(e) => updateProduct(i, "name", e.target.value)}
                className="flex-2 p-1 bg-gray-800 border border-gray-700 placeholder-gray-500"
              />
              <input
                type="number"
                placeholder="Precio"
                value={p.price}
                required
                onChange={(e) => updateProduct(i, "price", e.target.value)}
                className="w-24 p-1 bg-gray-800 border border-gray-700 placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => removeProduct(i)}
                className="text-red-500 hover:text-red-400"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addProduct}
            className="text-blue-500 hover:text-blue-400 font-semibold"
          >
            + Añadir producto
          </button>
        </div>

        {/* Botón guardar/actualizar */}
        <button
          type="submit"
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 font-semibold shadow-md transition-colors"
        >
          {form.id ? "Actualizar Cliente" : "Crear Cliente"}
        </button>
      </form>
    </div>
  )
}
