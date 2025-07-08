// src/app/[lang]/agente/invoices/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { exportPDF } from "./exportPDF";

export default function InvoicePage({ params }) {
  const router = useRouter();
  const lang = params.lang;
  const { status: authStatus } = useSession({ required: true });

  // --- Estado ---
  const [clients, setClients] = useState([]);
  const [client, setClient] = useState(null);
  const [clientProducts, setClientProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Estado para la información de la factura
  const [invoiceMeta, setInvoiceMeta] = useState({
    number: "",
    date: new Date().toISOString().slice(0, 10), // Fecha de emisión
    dueDate: "", // Fecha de vencimiento
    status: "PENDING", // Estado de la factura
    paidDate: "", // Fecha de pago (null si no pagada)
  });
  // Estado para las líneas de la factura
  const [items, setItems] = useState([
    { code: "", description: "", quantity: 1, unitPrice: "0", discount: "0" },
  ]);

  const [includeIGIC, setIncludeIGIC] = useState(true);
  const [includeIRPF, setIncludeIRPF] = useState(true);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);

  // Pedir próximo número global al montar y limpiar al salir de modo edición
  useEffect(() => {
    fetch("/api/agente/invoices/next-number")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(({ nextNumber }) =>
        setInvoiceMeta((prev) => ({ ...prev, number: nextNumber }))
      )
      .catch(console.error);
  }, [editingInvoiceId]); // Depende de editingInvoiceId para resetear el número al salir de edición

  // Cargar lista de clientes
  useEffect(() => {
    if (authStatus === "authenticated") {
      fetch("/api/clients")
        .then((r) => r.json())
        .then(setClients)
        .catch(console.error);
    }
  }, [authStatus]);

  // Muestra un indicador de carga mientras se autentica
  if (authStatus === "loading") {
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
    nif: "X8465115B",
  };
  const IGIC_RATE = 0.07;
  const IRPF_RATE = 0.07; // Tasa IRPF del 7% - ajusta si es 0.15 en tu backend

  // Helper para actualizar metadatos de la factura
  const updateMeta = (field, value) => {
    setInvoiceMeta((prev) => {
      const newState = { ...prev, [field]: value };

      // Lógica para manejar cambios de estado de la factura
      if (field === "status") {
        if (value === "PAID" && !newState.paidDate) {
          newState.paidDate = new Date().toISOString().slice(0, 10); // Auto-rellenar con fecha actual si pasa a PAID
        }
        if (prev.status === "PAID" && value !== "PAID") {
          newState.paidDate = ""; // Borrar fecha de pago si deja de ser PAID
        }
      }
      return newState;
    });
  };

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { code: "", description: "", quantity: 1, unitPrice: "0", discount: "0" },
    ]);
  const removeItem = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  // Función updateItem para actualizar líneas de la factura
  const updateItem = (i, field, rawValue) => {
    setItems((prev) => {
      const copy = [...prev];

      if (field === "code") {
        const prod = clientProducts.find((p) => p.code === rawValue);
        if (prod) {
          copy[i].description = prod.name;
          copy[i].unitPrice = String(prod.price);
        }
      }

      // Para 'quantity', asegúrate de que sea un número
      if (field === "quantity") {
        copy[i][field] = Number(rawValue) || 0;
      }
      // Para 'unitPrice' y 'discount', guarda el valor RAW (STRING) del input
      else if (field === "unitPrice" || field === "discount") {
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
    return parseFloat(String(value).replace(",", ".")) || 0;
  };

  // Cargar facturas de un cliente
  const loadInvoices = (id) =>
    fetch(`/api/clients/${id}/invoices`)
      .then((r) => r.json())
      .then(setInvoices)
      .catch(console.error);

  const handleClientChange = async (e) => {
    const id = Number(e.target.value);
    // Reiniciar todo si no se selecciona ningún cliente
    if (!id) {
      setClient(null);
      setClientProducts([]);
      setItems([
        { code: "", description: "", quantity: 1, unitPrice: "0", discount: "0" },
      ]);
      setInvoices([]);
      setEditingInvoiceId(null);
      // Resetear también los metadatos de la factura a un estado inicial limpio
      setInvoiceMeta({
        number: "",
        date: new Date().toISOString().slice(0, 10),
        dueDate: "",
        status: "PENDING",
        paidDate: "",
      });
      return; // Salir después de resetear
    }

    const sel = clients.find((c) => c.id === id);
    setClient(sel);
    try {
      const prods = await fetch(`/api/clients/${id}/products`).then((r) =>
        r.ok ? r.json() : []
      );
      setClientProducts(prods);
    } catch {
      setClientProducts([]);
    }
    setItems([
      { code: "", description: "", quantity: 1, unitPrice: "0", discount: "0" },
    ]); // Reset items
    setEditingInvoiceId(null);
    setInvoiceMeta((prev) => ({
      // Resetear fechas y estado al cambiar de cliente
      ...prev,
      date: new Date().toISOString().slice(0, 10),
      dueDate: "",
      status: "PENDING",
      paidDate: "",
    }));
    loadInvoices(id);
  };

  // Editar factura existente
  const editInvoice = async (id) => {
    const res = await fetch(`/api/agente/invoices/${id}`);
    if (!res.ok) {
      console.error("Error al cargar factura para edición:", await res.text());
      return;
    }
    const data = await res.json();
    setInvoiceMeta({
      number: data.number,
      date: data.date.slice(0, 10),
      dueDate: data.dueDate ? data.dueDate.slice(0, 10) : "",
      status: data.status,
      paidDate: data.paidDate ? data.paidDate.slice(0, 10) : "",
    });
    setIncludeIGIC(data.includeIGIC);
    setIncludeIRPF(data.includeIRPF);
    setItems(
      data.lines.map((line) => ({
        code: line.code,
        description: line.description,
        quantity: line.quantity,
        unitPrice: String(line.unitPrice),
        discount: String(line.discount),
      }))
    );
    setEditingInvoiceId(id);
  };

  // Eliminar factura
  const deleteInvoice = async (id) => {
    if (!confirm("¿Eliminar esta factura?")) return;
    const res = await fetch(`/api/agente/invoices/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (client) loadInvoices(client.id); // Recargar si hay cliente seleccionado
    } else {
      console.error("Error al eliminar factura:", await res.text());
      alert("Error al eliminar factura.");
    }
  };

  // Cálculos de totales
  const subtotal = items.reduce(
    (sum, it) =>
      sum +
      parseNumericValue(it.quantity) *
        parseNumericValue(it.unitPrice) *
        (1 - parseNumericValue(it.discount) / 100),
    0
  );
  const igic = includeIGIC ? subtotal * IGIC_RATE : 0;
  const irpf = includeIRPF ? subtotal * IRPF_RATE : 0;
  const total = subtotal + igic - irpf;

  // Validación para guardar
  const canSave = items.some(
    (it) =>
      it.code.trim() !== "" &&
      it.description.trim() !== "" &&
      parseNumericValue(it.quantity) > 0 &&
      parseNumericValue(it.unitPrice) >= 0
  );

  // Guardar o actualizar factura
  const saveInvoice = async () => {
    if (!client || !canSave) {
      alert(
        "Por favor, selecciona un cliente y añade al menos una línea de producto válida."
      );
      return;
    }

    // Validación adicional para paidDate si el estado es PAID
    if (invoiceMeta.status === "PAID" && !invoiceMeta.paidDate) {
      alert("Por favor, introduce la fecha de pago cuando el estado es 'Pagada'.");
      return;
    }
    if (invoiceMeta.status !== "PAID" && invoiceMeta.paidDate) {
      alert(
        "La fecha de pago solo es relevante cuando el estado es 'Pagada'. Por favor, borra la fecha de pago o cambia el estado."
      );
      return;
    }

    const cleanItems = items.map((it) => ({
      code: it.code,
      description: it.description,
      quantity: Number(it.quantity) || 0,
      unitPrice: parseNumericValue(it.unitPrice),
      discount: parseNumericValue(it.discount),
    }));

    const validItems = cleanItems.filter(
      (it) =>
        it.code.trim() !== "" &&
        it.description.trim() !== "" &&
        it.quantity > 0 &&
        it.unitPrice >= 0
    );
    if (validItems.length === 0) {
      alert(
        "Añade al menos una línea de producto válida (código, descripción, cantidad > 0, precio >= 0)."
      );
      return;
    }

    const payload = {
      clientId: client.id,
      date: invoiceMeta.date,
      dueDate: invoiceMeta.dueDate || null,
      includeIGIC,
      includeIRPF,
      items: validItems,
    };

    // Solo incluimos status y paidDate en el payload para operaciones de ACTUALIZACIÓN (PUT)
    // Cuando es una creación (POST), Prisma se encarga de poner el estado por defecto 'PENDING'
    if (editingInvoiceId) {
      payload.status = invoiceMeta.status;
      payload.paidDate = invoiceMeta.paidDate || null;
    }

    const method = editingInvoiceId ? "PUT" : "POST";
    const url = editingInvoiceId
      ? `/api/agente/invoices/${editingInvoiceId}`
      : "/api/agente/invoices";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.error("Error al guardar/actualizar factura:", await res.text());
        throw new Error("Error al guardar/actualizar factura.");
      }
      setEditingInvoiceId(null);
      loadInvoices(client.id);
      setItems([
        { code: "", description: "", quantity: 1, unitPrice: "0", discount: "0" },
      ]);
      setInvoiceMeta((prev) => ({
        ...prev,
        date: new Date().toISOString().slice(0, 10),
        dueDate: "",
        status: "PENDING", // Reset a PENDING al guardar una factura nueva o existente
        paidDate: "",
      }));
      // Recargar el próximo número de factura después de guardar/actualizar
      fetch("/api/agente/invoices/next-number")
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then(({ nextNumber }) =>
          setInvoiceMeta((prev) => ({ ...prev, number: nextNumber }))
        )
        .catch(console.error);
    } catch (e) {
      alert(`Error al guardar/actualizar factura: ${e.message}`);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-gray-900 text-white rounded-lg shadow-xl">
      <h2 className="text-xl font-bold text-teal-400 mb-4">Generar Factura</h2>

      {/* Metadatos y cliente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Nº Factura
          </label>
          <p className="p-2 w-full bg-gray-800 border border-gray-700 rounded-md text-gray-300">
            {invoiceMeta.number}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Fecha Emisión
          </label>
          <input
            type="date"
            value={invoiceMeta.date}
            onChange={(e) => updateMeta("date", e.target.value)}
            className="p-2 w-full bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Fecha Vencimiento
          </label>
          <input
            type="date"
            value={invoiceMeta.dueDate}
            onChange={(e) => updateMeta("dueDate", e.target.value)}
            className="p-2 w-full bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* NUEVOS CAMPOS: Estado y Fecha de Pago (solo visibles en modo edición) */}
        {editingInvoiceId && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Estado
              </label>
              <select
                value={invoiceMeta.status}
                onChange={(e) => updateMeta("status", e.target.value)}
                className="p-2 w-full bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="OVERDUE">OVERDUE</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            {invoiceMeta.status === "PAID" && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Fecha de Pago
                </label>
                <input
                  type="date"
                  value={invoiceMeta.paidDate}
                  onChange={(e) => updateMeta("paidDate", e.target.value)}
                  className="p-2 w-full bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            )}
          </>
        )}
        {/* Campo de Cliente - se ajusta si aparecen los campos de estado */}
        <div
          className={`col-span-full ${
            editingInvoiceId && invoiceMeta.status === "PAID"
              ? "sm:col-span-1"
              : "sm:col-span-2" // Ajusta el colspan si no hay paidDate o no es modo edicion
          } ${editingInvoiceId && invoiceMeta.status !== "PAID" ? 'sm:col-span-1' : ''}`} // Si no es paid, ocupara 1 de 2 en sm. Si no es edicion, ocupara 2 de 2 en sm
        >
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Cliente
          </label>
          <div className="flex items-center gap-2">
            <select
              value={client?.id || ""}
              onChange={handleClientChange}
              className="p-2 flex-1 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">— Selecciona —</option>
              {clients.map((c) => (
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
                onChange={(e) => setIncludeIGIC(e.target.checked)}
                className="form-checkbox h-4 w-4 text-teal-600 bg-gray-700 border-gray-600 rounded focus:ring-teal-500"
              />
              <span>Incluir IGIC ({ (IGIC_RATE * 100).toFixed(0) }%)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeIRPF}
                onChange={(e) => setIncludeIRPF(e.target.checked)}
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
                  (h) => (
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
                      onChange={(e) => updateItem(i, "code", e.target.value)}
                    />
                  </td>
                  <td className="border border-gray-700 px-2 py-1 flex-1">
                    <input
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
                      value={it.description}
                      onChange={(e) => updateItem(i, "description", e.target.value)}
                    />
                  </td>
                  <td className="border border-gray-700 px-2 py-1 w-16">
                    <input
                      type="number"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
                      value={it.quantity}
                      min="0"
                      onChange={(e) => updateItem(i, "quantity", e.target.value)}
                    />
                  </td>
                  <td className="border border-gray-700 px-2 py-1 w-20">
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*([.,][0-9]+)?"
                      value={it.unitPrice}
                      onChange={(e) => updateItem(i, "unitPrice", e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </td>
                  <td className="border border-gray-700 px-2 py-1 w-16">
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*([.,][0-9]+)?"
                      value={it.discount}
                      onChange={(e) => updateItem(i, "discount", e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </td>
                  <td className="border border-gray-700 px-2 py-1 text-right w-24 bg-gray-700 font-semibold text-white">
                    {(
                      parseNumericValue(it.quantity) *
                      parseNumericValue(it.unitPrice) *
                      (1 - parseNumericValue(it.discount) / 100)
                    ).toFixed(2)}
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
            <p>
              Subtotal:{" "}
              <span className="font-semibold text-white">
                {subtotal.toFixed(2)} €
              </span>
            </p>
            {includeIGIC && (
              <p>
                IGIC ({ (IGIC_RATE * 100).toFixed(0) }%):{" "}
                <span className="font-semibold text-white">
                  {igic.toFixed(2)} €
                </span>
              </p>
            )}
            {includeIRPF && (
              <p>
                IRPF ({ (IRPF_RATE * 100).toFixed(0) }%):{" "}
                <span className="font-semibold text-white">
                  -{irpf.toFixed(2)} €
                </span>
              </p>
            )}
            <p className="font-bold text-lg text-teal-400">
              Total: {total.toFixed(2)} €
            </p>
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
                onClick={() =>
                  exportPDF({
                    invoiceMeta: {
                      ...invoiceMeta,
                      dueDate: invoiceMeta.dueDate,
                      status: invoiceMeta.status,
                      paidDate: invoiceMeta.paidDate,
                    },
                    issuer,
                    client,
                    items: items.map((it) => ({
                      ...it,
                      quantity: parseNumericValue(it.quantity),
                      unitPrice: parseNumericValue(it.unitPrice),
                      discount: parseNumericValue(it.discount),
                    })),
                    includeIGIC,
                    includeIRPF,
                    subtotal,
                    igic,
                    irpf,
                    total,
                  })
                }
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 font-semibold shadow-md transition-colors flex-1 sm:flex-none"
              >
                Exportar a PDF
              </button>
              {editingInvoiceId && (
                <button
                  onClick={() => {
                    // Resetea el formulario y sale del modo edición
                    setEditingInvoiceId(null);
                    setInvoiceMeta({
                      number: invoiceMeta.number, // Keep current number
                      date: new Date().toISOString().slice(0, 10),
                      dueDate: '',
                      status: 'PENDING',
                      paidDate: '',
                    });
                    setItems([]);
                  }}
                  className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 font-semibold shadow-md transition-colors flex-1 sm:flex-none"
                >
                  Cancelar
                </button>
              )}
            </div>
          )}

          {/* Listado de facturas */}
          {invoices.length > 0 ? (
            <section className="mb-6 border-t border-gray-700 pt-6">
              <h2 className="text-lg font-semibold text-teal-400 mb-3">
                Facturas de {client.name}
              </h2>
              <ul className="list-none space-y-2">
                {invoices.map((inv) => (
                  <li
                    key={inv.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-800 rounded-md p-3 shadow-sm border border-gray-700"
                  >
                    <span className="text-gray-300 mb-2 sm:mb-0">
                      <span className="font-semibold text-white mr-2">
                        #{inv.number}
                      </span>
                      {new Date(inv.date).toLocaleDateString("es-ES")} —{" "}
                      <span className="font-bold text-teal-400">
                        {inv.total.toFixed(2)} €
                      </span>
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                          inv.status === "PAID"
                            ? "bg-green-600 text-white"
                            : inv.status === "PENDING"
                            ? "bg-yellow-600 text-white"
                            : inv.status === "OVERDUE"
                            ? "bg-red-600 text-white"
                            : "bg-gray-500 text-white"
                        }`}
                      >
                        {inv.status}
                      </span>
                      {inv.dueDate && (
                        <span className="ml-2 text-gray-400">
                          Vencimiento:{" "}
                          {new Date(inv.dueDate).toLocaleDateString("es-ES")}
                        </span>
                      )}
                      {inv.paidDate && (
                        <span className="ml-2 text-gray-400">
                          Pagada:{" "}
                          {new Date(inv.paidDate).toLocaleDateString("es-ES")}
                        </span>
                      )}
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
                      <button
                        onClick={async () => {
                          // Obtener datos completos de la factura
                          const res = await fetch(`/api/agente/invoices/${inv.id}`);
                          if (!res.ok) {
                            alert("No se pudo descargar la factura");
                            return;
                          }
                          const data = await res.json();
                          // Obtener datos del cliente (ya está en 'client')
                          // Si el cliente actual no corresponde, buscarlo en la lista
                          let facturaCliente = client;
                          if (!facturaCliente || facturaCliente.id !== data.clientId) {
                            facturaCliente = clients.find(c => c.id === data.clientId) || {};
                          }
                          // Datos del emisor (igual que en la cabecera)
                          const issuer = {
                            name: "Javier Nicolás Visconti",
                            address: "C/ Caracol nº 3, 38618 Los Abrigos, Tenerife",
                            phone: "+34 648416513",
                            email: "info@jv-digital.com",
                            nif: "X8465115B",
                          };
                          // Calcular totales
                          const IGIC_RATE = 0.07;
                          const IRPF_RATE = 0.07;
                          const items = data.lines.map(line => ({
                            ...line,
                            quantity: Number(line.quantity),
                            unitPrice: Number(line.unitPrice),
                            discount: Number(line.discount),
                          }));
                          const subtotal = items.reduce(
                            (sum, it) =>
                              sum +
                              it.quantity * it.unitPrice * (1 - it.discount / 100),
                            0
                          );
                          const igic = data.includeIGIC ? subtotal * IGIC_RATE : 0;
                          const irpf = data.includeIRPF ? subtotal * IRPF_RATE : 0;
                          const total = subtotal + igic - irpf;
                          // Exportar PDF
                          exportPDF({
                            invoiceMeta: {
                              number: data.number,
                              date: data.date.slice(0, 10),
                              dueDate: data.dueDate ? data.dueDate.slice(0, 10) : "",
                              status: data.status,
                              paidDate: data.paidDate ? data.paidDate.slice(0, 10) : "",
                            },
                            issuer,
                            client: facturaCliente,
                            items,
                            includeIGIC: data.includeIGIC,
                            includeIRPF: data.includeIRPF,
                            subtotal,
                            igic,
                            irpf,
                            total,
                          });
                        }}
                        className="text-green-500 hover:text-green-400 font-semibold"
                      >
                        Descargar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            client && (
              <p className="mb-6 text-gray-400 text-center border-t border-gray-700 pt-6">
                No hay facturas para este cliente.
              </p>
            )
          )}
        </>
      )}
    </div>
  );
}