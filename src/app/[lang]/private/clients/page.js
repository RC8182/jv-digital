// src/app/[lang]/private/clients/page.js
"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"

export default function ClientsPage({ params }) {
  const { status } = useSession({ required: true })
  const [clients, setClients] = useState([])
  const [form, setForm] = useState({
    id: null,
    name: "",
    address: "",
    phone: "",
    email: "",
    vat: "",
    city: ""
  })
  const [products, setProducts] = useState([
    { id: null, code: "", name: "", price: 0 }
  ])

  // Carga lista de clientes
  const loadClients = async () => {
    try {
      const res = await fetch("/api/private/clients")
      if (!res.ok) throw new Error(res.statusText)
      setClients(await res.json())
    } catch (e) {
      console.error("Error al cargar clientes:", e)
    }
  }

  useEffect(() => {
    if (status === "authenticated") loadClients()
  }, [status])

  // Crear o actualizar cliente + productos
  const saveClient = async e => {
    e.preventDefault()
    const method = form.id ? "PUT" : "POST"
    const url = form.id
      ? `/api/private/clients/${form.id}`
      : "/api/private/clients"

    try {
      // 1) Cliente
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error(res.statusText)
      const clientData = await res.json()

      // 2) Productos
      await Promise.all(
        products.map(prod => {
          // Si ya existía, podrías PUT a productos/:id, pero aquí sólo creamos nuevos
          return fetch("/api/private/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clientId: clientData.id,
              code: prod.code,
              name: prod.name,
              price: prod.price
            })
          })
        })
      )

      // 3) Reset y recarga
      setForm({ id: null, name: "", address: "", phone: "", email: "", vat: "", city: "" })
      setProducts([{ id: null, code: "", name: "", price: 0 }])
      loadClients()
    } catch (e) {
      console.error("Error al guardar cliente o productos:", e)
    }
  }

  // Al pulsar “Editar”
  const editClient = async c => {
    setForm({
      id: c.id,
      name: c.name,
      address: c.address,
      phone: c.phone,
      email: c.email,
      vat: c.vat,
      city: c.city
    })

    try {
      const res = await fetch(`/api/private/clients/${c.id}/products`)
      if (!res.ok) throw new Error(res.statusText)
      const list = await res.json()
      setProducts(
        list.map(p => ({
          id: p.id,
          code: p.code || "",
          name: p.name,
          price: p.price
        }))
      )
    } catch (e) {
      console.error("Error cargando productos del cliente:", e)
      setProducts([{ id: null, code: "", name: "", price: 0 }])
    }
  }

  // Borrar cliente
  const deleteClient = async id => {
    if (!confirm("¿Eliminar este cliente?")) return
    try {
      const res = await fetch(`/api/private/clients/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(res.statusText)
      loadClients()
    } catch (e) {
      console.error("Error al borrar cliente:", e)
    }
  }

  // Handlers de productos
  const addProduct = () =>
    setProducts(prev => [...prev, { id: null, code: "", name: "", price: 0 }])
  const removeProduct = i =>
    setProducts(prev => prev.filter((_, idx) => idx !== i))
  const updateProduct = (i, field, value) => {
    setProducts(prev => {
      const copy = [...prev]
      copy[i][field] = field === "price" ? parseFloat(value) : value
      return copy
    })
  }

  if (status === "loading") return <p>Cargando...</p>

  return (
    <div className="p-6 max-w-lg mx-auto">
      <header className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Clientes</h2>
        <button
          onClick={() => signOut({ callbackUrl: `/${params.lang}` })}
          className="underline text-sm"
        >
          Cerrar sesión
        </button>
      </header>

      {/* Listado */}
      <ul className="mb-6">
        {clients.map(c => (
          <li
            key={c.id}
            className="flex justify-between items-center border-b py-1"
          >
            <span>
              {c.name} — {c.address} — {c.phone} — {c.email}
            </span>
            <div className="space-x-2">
              <button
                onClick={() => editClient(c)}
                className="text-blue-600"
              >
                Editar
              </button>
              <button
                onClick={() => deleteClient(c.id)}
                className="text-red-600"
              >
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Formulario */}
      <form onSubmit={saveClient} className="space-y-4">
        {/* Cliente */}
        <input
          placeholder="Nombre"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
        <input
          placeholder="Dirección"
          value={form.address}
          onChange={e => setForm({ ...form, address: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          placeholder="Teléfono"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          placeholder="VAT"
          value={form.vat}
          onChange={e => setForm({ ...form, vat: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          placeholder="Ciudad"
          value={form.city}
          onChange={e => setForm({ ...form, city: e.target.value })}
          className="w-full border p-2 rounded"
        />

        {/* Productos */}
        <div>
          <h3 className="font-semibold mb-2">Productos</h3>
          {products.map((prod, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                placeholder="Código"
                value={prod.code}
                onChange={e => updateProduct(i, "code", e.target.value)}
                className="border p-1 flex-1"
              />
              <input
                placeholder="Nombre producto"
                value={prod.name}
                onChange={e => updateProduct(i, "name", e.target.value)}
                className="border p-1 flex-2"
                required
              />
              <input
                type="number"
                placeholder="Precio"
                value={prod.price}
                onChange={e => updateProduct(i, "price", e.target.value)}
                className="border p-1 w-24"
                required
              />
              <button
                type="button"
                onClick={() => removeProduct(i)}
                className="text-red-600"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addProduct}
            className="text-blue-600"
          >
            + Añadir producto
          </button>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {form.id ? "Actualizar cliente" : "Crear cliente"}
        </button>
      </form>
    </div>
  )
}
