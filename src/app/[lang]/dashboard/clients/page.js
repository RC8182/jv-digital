// src/app/[lang]/dashboard/clients/page.js
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function ClientsPage({ params }) {
  const { status } = useSession({ required: true })
  const router = useRouter()
  const lang = params.lang

  const [clients, setClients] = useState([])
  const [form, setForm] = useState({
    id: null,
    name: "",
    address: "",
    phone: "",
    email: "",
    nif: "",
    city: ""
  })
  const [products, setProducts] = useState([]) // Productos en el formulario (pueden ser nuevos o existentes)
  const [originalProducts, setOriginalProducts] = useState([]) // Productos que cargamos de la DB al editar

  // Carga lista de clientes
  const loadClients = async () => {
    try {
      const res = await fetch("/api/clients")
      if (!res.ok) {
        console.error("Error en la respuesta de la API de clientes:", res.status, res.statusText);
        throw new Error(res.statusText);
      }
      const data = await res.json();
      console.log("Clientes cargados:", data);
      setClients(data);
    } catch (e) {
      console.error("Error al cargar clientes:", e);
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      loadClients();
    }
  }, [status]);

  // Crear o actualizar cliente y Sincronizar Productos
  const saveClient = async e => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("El nombre del cliente es obligatorio.");
      return;
    }

    const method = form.id ? "PUT" : "POST";
    const url = form.id
      ? `/api/clients/${form.id}`
      : "/api/clients";

    try {
      // 1) Guardar/Actualizar Cliente
      const clientRes = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!clientRes.ok) {
        const errorData = await clientRes.json();
        throw new Error(errorData.error || clientRes.statusText);
      }
      const clientData = await clientRes.json();
      const clientId = clientData.id; // El ID del cliente (nuevo o existente)

      // 2) Sincronizar Productos
      const productsToCreate = products.filter(p => !p.id); // Productos sin ID son nuevos
      const productsToUpdate = products.filter(p => p.id); // Productos con ID son existentes
      
      // Productos que estaban originalmente pero ya no están en la lista actual -> A ELIMINAR
      const productsToDelete = originalProducts.filter(originalProd => 
        !products.some(currentProd => currentProd.id === originalProd.id)
      );

      // Eliminar productos
      await Promise.all(productsToDelete.map(prod => 
        fetch(`/api/products/${prod.id}`, { method: "DELETE" })
      ));

      // Crear nuevos productos
      await Promise.all(productsToCreate.map(prod =>
        fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: clientId,
            code: prod.code,
            name: prod.name,
            price: parseFloat(prod.price) || 0
          })
        })
      ));

      // Actualizar productos existentes (solo si hay cambios, aunque la API puede manejar la idempotencia)
      await Promise.all(productsToUpdate.map(async prod => {
        const original = originalProducts.find(op => op.id === prod.id);
        // Compara para ver si ha habido cambios antes de enviar la petición PUT
        if (!original || 
            original.code !== prod.code || 
            original.name !== prod.name || 
            original.price !== parseFloat(prod.price)) { // Compara precios como números
          return fetch(`/api/products/${prod.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: prod.code,
              name: prod.name,
              price: parseFloat(prod.price) || 0
            })
          });
        }
        return Promise.resolve(); // No hay cambios, no hagas PUT
      }));

      // 3) Reset y recarga
      setForm({ id: null, name: "", address: "", phone: "", email: "", nif: "", city: "" });
      setProducts([]); // Limpia la lista de productos del formulario
      setOriginalProducts([]); // Limpia también los productos originales
      loadClients(); // Recargar la lista de clientes
      alert("Cliente y productos guardados correctamente.");
    } catch (e) {
      console.error("Error al guardar cliente o productos:", e);
      alert(`Error al guardar cliente o productos: ${e.message}`);
    }
  };

  // Al pulsar “Editar”
  const editClient = async c => {
    setForm({
      id: c.id,
      name: c.name,
      address: c.address,
      phone: c.phone,
      email: c.email,
      nif: c.nif,
      city: c.city
    });

    try {
      const res = await fetch(`/api/clients/${c.id}/products`);
      if (!res.ok) throw new Error(res.statusText);
      const list = await res.json();
      const formattedProducts = list.map(p => ({
        id: p.id,
        code: p.code || "",
        name: p.name,
        price: p.price
      }));
      setProducts(formattedProducts); // Carga productos en el formulario
      setOriginalProducts(formattedProducts); // Guarda una copia de los productos originales
    } catch (e) {
      console.error("Error cargando productos del cliente:", e);
      setProducts([]); // Asegurar que haya al menos un producto vacío si no se cargan
      setOriginalProducts([]);
    }
  };

  // Borrar cliente
  const deleteClient = async id => {
    if (!confirm("¿Eliminar este cliente? Esta acción también eliminará todos sus productos y facturas asociadas.")) return;
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || res.statusText);
      }
      loadClients();
      alert("Cliente y datos asociados eliminados correctamente.");
    } catch (e) {
      console.error("Error al borrar cliente:", e);
      alert(`Error al borrar cliente: ${e.message}. Asegúrate de que no tenga relaciones activas que impidan la eliminación en cascada.`);
    }
  };

  // Handlers de productos
  const addProduct = () =>
    setProducts(prev => [...prev, { id: null, code: "", name: "", price: 0 }]);
  const removeProduct = i =>
    setProducts(prev => prev.filter((_, idx) => idx !== i));
  const updateProduct = (i, field, value) => {
    setProducts(prev => {
      const copy = [...prev];
      // Asegurarse de que el precio sea un número flotante
      copy[i][field] = field === "price" ? parseFloat(value) || 0 : value;
      return copy;
    });
  };

  // Muestra un indicador de carga mientras se autentica
  if (status === "loading") {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
            <p>Cargando clientes...</p>
        </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-gray-900 text-white rounded-lg shadow-xl">
      <h2 className="text-xl font-bold text-teal-400 mb-4">Gestión de Clientes</h2> 

      {/* Listado de Clientes */}
      {clients.length > 0 ? (
        <ul className="mb-6 space-y-2">
          {clients.map(c => (
            <li
              key={c.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-700 py-2"
            >
              <span className="text-gray-300 mb-2 sm:mb-0">
                <span className="font-semibold text-white">{c.name}</span> — {c.address} — {c.phone} — {c.email}
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
        <p className="mb-6 text-gray-400 text-center">No hay clientes para mostrar. Crea uno usando el formulario de abajo.</p>
      )}

      {/* Formulario de Cliente */}
      <form onSubmit={saveClient} className="space-y-4 text-white">
        <h3 className="text-xl font-semibold text-teal-400 mb-2">{form.id ? "Editar Cliente" : "Nuevo Cliente"}</h3>
        
        {/* Campos del Cliente */}
        <input
          placeholder="Nombre"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full border p-2 rounded bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
          required
        />
        <input
          placeholder="Dirección"
          value={form.address}
          onChange={e => setForm({ ...form, address: e.target.value })}
          className="w-full border p-2 rounded bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
        />
        <input
          placeholder="Teléfono"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          className="w-full border p-2 rounded bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full border p-2 rounded bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
        />
        <input
          placeholder="NIF"
          value={form.nif}
          onChange={e => setForm({ ...form, nif: e.target.value })}
          className="w-full border p-2 rounded bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
        />
        <input
          placeholder="Ciudad"
          value={form.city}
          onChange={e => setForm({ ...form, city: e.target.value })}
          className="w-full border p-2 rounded bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
        />

        {/* Sección de Productos */}
        <div>
          <h3 className="font-semibold mb-2 text-teal-400">Productos del Cliente</h3>
          {products.map((prod, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
              <input
                placeholder="Código"
                value={prod.code}
                onChange={e => updateProduct(i, "code", e.target.value)}
                className="border p-1 flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
              <input
                placeholder="Nombre producto"
                value={prod.name}
                onChange={e => updateProduct(i, "name", e.target.value)}
                className="border p-1 flex-2 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                required
              />
              <input
                type="number"
                placeholder="Precio"
                value={prod.price}
                onChange={e => updateProduct(i, "price", e.target.value)}
                className="border p-1 w-24 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                required
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
            className="text-blue-500 hover:text-blue-400 font-semibold mt-2"
          >
            + Añadir producto
          </button>
        </div>

        {/* Botón de Guardar/Actualizar */}
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