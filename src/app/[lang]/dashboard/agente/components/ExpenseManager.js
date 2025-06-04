// src/app/[lang]/dashboard/agente/components/ExpenseManager.js
'use client';
import { useState, useEffect } from 'react';

export default function ExpenseManager() {
  /* ─────────── estados ─────────── */
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading,    setUploading]    = useState(false);
  const [message,      setMessage]      = useState('');
  const [expenseList,  setExpenseList]  = useState([]);

  // Para la edición inline
  const [editingId,    setEditingId]    = useState(null);
  const [formValues,   setFormValues]   = useState({
    supplier:    '',
    date:        '',
    baseAmount:  '',
    taxAmount:   '',
    totalAmount: '',
  });

  /* ─── cargar lista de gastos ─── */
  const fetchExpenseList = async () => {
    try {
      const res = await fetch('/api/agente/contabilidad/gastos');
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const { expenses } = await res.json();
      setExpenseList(expenses);
    } catch (err) {
      console.error('Error al obtener la lista de gastos:', err);
      setMessage('No se pudo cargar la lista de gastos.');
    }
  };

  useEffect(() => {
    fetchExpenseList();
  }, []);

  /* ─── seleccionar archivo para subir ─── */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file?.type === 'application/pdf') {
      setSelectedFile(file);
      setMessage('');
    } else {
      setMessage('Selecciona un PDF válido.');
    }
  };

  /* ─── subir gasto (POST) ─── */
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/agente/contabilidad/gastos', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? `Status ${res.status}`);
      }
      setMessage('Gasto subido e indexado correctamente.');
      setSelectedFile(null);
      fetchExpenseList();
    } catch (err) {
      console.error('Error al subir gasto:', err);
      setMessage('Error al subir el PDF de gasto.');
    } finally {
      setUploading(false);
    }
  };

  /* ─── eliminar gasto (DELETE) ─── */
  const handleDelete = async (id, docId) => {
    try {
      const res = await fetch(`/api/agente/contabilidad/gastos?id=${id}&docId=${docId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const { message: msg } = await res.json();
      setMessage(msg);
      fetchExpenseList();
    } catch (err) {
      console.error('Error al eliminar gasto:', err);
      setMessage('Error al eliminar el gasto.');
    }
  };

  /* ─── iniciar edición inline ─── */
  const startEditing = (expense) => {
    setEditingId(expense.id);
    setFormValues({
      supplier:    expense.supplier || '',
      date:        expense.date ? expense.date.split('T')[0] : '',
      baseAmount:  expense.baseAmount != null ? expense.baseAmount : '',
      taxAmount:   expense.taxAmount != null ? expense.taxAmount : '',
      totalAmount: expense.totalAmount != null ? expense.totalAmount : '',
    });
    setMessage('');
  };

  /* ─── manejar cambios en los inputs de edición ─── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  /* ─── guardar cambios de edición (PATCH) ─── */
  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        supplier:    formValues.supplier,
        date:        formValues.date || null,
        baseAmount:  formValues.baseAmount === '' ? null : parseFloat(formValues.baseAmount),
        taxAmount:   formValues.taxAmount === '' ? null : parseFloat(formValues.taxAmount),
        totalAmount: formValues.totalAmount === '' ? null : parseFloat(formValues.totalAmount),
      };

      const res = await fetch(`/api/agente/contabilidad/gastos/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error al guardar');
      setMessage('Gasto actualizado correctamente.');
      setEditingId(null);
      fetchExpenseList();
    } catch (err) {
      console.error(err);
      setMessage('No se pudo actualizar el gasto.');
    }
  };

  /* ─── cancelar edición ─── */
  const cancelEdit = () => {
    setEditingId(null);
    setFormValues({
      supplier:    '',
      date:        '',
      baseAmount:  '',
      taxAmount:   '',
      totalAmount: '',
    });
    setMessage('');
  };

  /* ─── render ─── */
  return (
    <section className="bg-gray-800 text-white p-4 sm:p-6 rounded w-full">
      <h2 className="text-2xl font-semibold mb-4">Administrador de Gastos (PDF)</h2>

      {/* ── Formulario de subida ── */}
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
          {uploading ? 'Subiendo…' : 'Subir Gasto'}
        </button>
      </form>

      {message && <p className="mb-3 text-sm sm:text-base">{message}</p>}

      <h3 className="text-xl mb-2">Gastos cargados:</h3>

      {expenseList.length === 0 ? (
        <p className="text-sm">No hay gastos cargados.</p>
      ) : (
        <ul className="space-y-4 w-full">
          {expenseList.map((expense) => {
            const {
              id,
              filename,
              docId,
              createdAt,
              supplier,
              date,
              baseAmount,
              taxAmount,
              totalAmount,
            } = expense;
            const isEditing = editingId === id;

            return (
              <li
                key={id}
                className="bg-gray-700 px-4 py-3 rounded w-full"
              >
                {/* ── Información básica ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="w-full sm:w-auto">
                    <span className="block text-sm sm:text-base font-medium">{filename}</span>
                    <span className="block text-xs sm:text-sm text-gray-300">
                      {new Date(createdAt).toLocaleDateString()}
                    </span>
                    {supplier && (
                      <span className="block text-xs text-gray-400">
                        Proveedor: {supplier}
                      </span>
                    )}
                    {date && (
                      <span className="block text-xs text-gray-400">
                        Fecha: {new Date(date).toLocaleDateString()}
                      </span>
                    )}
                    {totalAmount != null && (
                      <span className="block text-xs text-gray-400">
                        Total:{' '}
                        {totalAmount.toLocaleString('es-ES', {
                          style: 'currency',
                          currency: 'EUR',
                        })}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 sm:mt-0 flex items-center gap-2">
                    {!isEditing && (
                      <button
                        onClick={() => startEditing(expense)}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded font-bold text-sm"
                      >
                        Editar
                      </button>
                    )}
                    {!isEditing && (
                      <button
                        onClick={() => handleDelete(id, docId)}
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded font-bold text-sm"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Formulario de edición inline ── */}
                {isEditing && (
                  <form onSubmit={submitEdit} className="mt-3 space-y-3 bg-gray-600 p-3 rounded">
                    <div>
                      <label className="block text-xs">Proveedor</label>
                      <input
                        name="supplier"
                        value={formValues.supplier}
                        onChange={handleChange}
                        className="w-full p-2 rounded text-black"
                        placeholder="Nombre del proveedor"
                      />
                    </div>
                    <div>
                      <label className="block text-xs">Fecha</label>
                      <input
                        type="date"
                        name="date"
                        value={formValues.date}
                        onChange={handleChange}
                        className="w-full p-2 rounded text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs">Base imponible</label>
                      <input
                        type="number"
                        step="0.01"
                        name="baseAmount"
                        value={formValues.baseAmount}
                        onChange={handleChange}
                        className="w-full p-2 rounded text-black"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs">Impuesto</label>
                      <input
                        type="number"
                        step="0.01"
                        name="taxAmount"
                        value={formValues.taxAmount}
                        onChange={handleChange}
                        className="w-full p-2 rounded text-black"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs">Total</label>
                      <input
                        type="number"
                        step="0.01"
                        name="totalAmount"
                        value={formValues.totalAmount}
                        onChange={handleChange}
                        className="w-full p-2 rounded text-black"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
