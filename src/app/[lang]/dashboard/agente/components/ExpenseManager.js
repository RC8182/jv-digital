// src/app/[lang]/dashboard/agente/components/ExpenseManager.jsx
'use client';

import { useState, useEffect } from 'react';

export default function ExpenseManager({ misEpigrafes }) {
  // ─────────── estados ───────────
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [expenseList, setExpenseList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Ahora epigrafeIAE es un array de strings
  const [formValues, setFormValues] = useState({
    supplier:    '',
    date:        '',
    baseAmount:  '',
    taxAmount:   '',
    totalAmount: '',
    epigrafeIAE: [] // arreglo vacío inicialmente
  });

  // ─── cargar lista de gastos ───
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

  // ─── seleccionar archivo para subir ───
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file?.type === 'application/pdf') {
      setSelectedFile(file);
      setMessage('');
    } else {
      setMessage('Selecciona un PDF válido.');
      setSelectedFile(null);
    }
  };

  // ─── subir gasto (POST) ───
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
        const { error, details } = await res.json();
        if (error === 'duplicado') {
          throw new Error('Este PDF ya fue subido anteriormente.');
        } else {
          throw new Error(error ?? `Status ${res.status}: ${details || 'Unknown error'}`);
        }
      }
      setMessage('Gasto subido e indexado correctamente.');
      setSelectedFile(null);
      e.target.reset();
      fetchExpenseList();
    } catch (err) {
      console.error('Error al subir gasto:', err);
      setMessage(`Error al subir el PDF de gasto: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // ─── eliminar gasto (DELETE) ───
  const handleDelete = async (id, docId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este gasto?')) return;
    try {
      const res = await fetch(`/api/agente/contabilidad/gastos?id=${id}&docId=${docId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const { error, details } = await res.json();
        throw new Error(error ?? `Status ${res.status}: ${details || 'Unknown error'}`);
      }
      const { message: msg } = await res.json();
      setMessage(msg);
      fetchExpenseList();
    } catch (err) {
      console.error('Error al eliminar gasto:', err);
      setMessage(`Error al eliminar el gasto: ${err.message}`);
    }
  };

  // ─── iniciar edición inline ───
  const startEditing = (expense) => {
    if (expense.processingStatus !== 'listo') {
      setMessage(`No puedes editar un gasto que está en estado "${expense.processingStatus}".`);
      return;
    }
    setEditingId(expense.id);

    setFormValues({
      supplier:    expense.supplier || '',
      date:        expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
      baseAmount:  expense.baseAmount != null ? expense.baseAmount : '',
      taxAmount:   expense.taxAmount != null ? expense.taxAmount : '',
      totalAmount: expense.totalAmount != null ? expense.totalAmount : '',
      // epigrafeIAE ya viene como arreglo desde la BD
      epigrafeIAE: Array.isArray(expense.epigrafeIAE) ? expense.epigrafeIAE : []
    });
    setMessage('');
  };

  // ─── manejar cambios en inputs de edición ───
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Para el select múltiple, tomamos todas las opciones seleccionadas
    if (name === 'epigrafeIAE') {
      const selectedOptions = Array.from(e.target.selectedOptions).map(o => o.value);
      setFormValues(prev => ({ ...prev, epigrafeIAE: selectedOptions }));
    } else {
      setFormValues(prev => ({ ...prev, [name]: value }));
    }
  };

  // ─── guardar cambios de edición (PATCH) ───
  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        supplier:    formValues.supplier,
        date:        formValues.date || null,
        baseAmount:  formValues.baseAmount === '' ? null : parseFloat(formValues.baseAmount),
        taxAmount:   formValues.taxAmount === '' ? null : parseFloat(formValues.taxAmount),
        totalAmount: formValues.totalAmount === '' ? null : parseFloat(formValues.totalAmount),
        epigrafeIAE: formValues.epigrafeIAE // Ya es un array de códigos
      };

      const res = await fetch(`/api/agente/contabilidad/gastos/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const { error, details } = await res.json();
        throw new Error(error ?? `Status ${res.status}: ${details || 'Unknown error'}`);
      }
      setMessage('Gasto actualizado correctamente.');
      setEditingId(null);
      fetchExpenseList();
    } catch (err) {
      console.error('Error al actualizar gasto:', err);
      setMessage(`No se pudo actualizar el gasto: ${err.message}`);
    }
  };

  // ─── cancelar edición ───
  const cancelEdit = () => {
    setEditingId(null);
    setFormValues({
      supplier:    '',
      date:        '',
      baseAmount:  '',
      taxAmount:   '',
      totalAmount: '',
      epigrafeIAE: []
    });
    setMessage('');
  };

  // ─── render ───
  return (
    <section className="bg-gray-800 text-white p-4 sm:p-6 rounded w-full">
      <h2 className="text-2xl font-semibold mb-4">Administrador de Gastos (PDF)</h2>

      {/* ── Formulario de subida ── */}
      <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-3 mb-4 items-center w-full">
        {/* Botón solo visible en móvil para digitalizar factura (imagen) */}
        <label className="block w-full sm:hidden">
          <button
            type="button"
            className="w-full bg-teal-600 text-white px-4 py-2 rounded mb-2 font-semibold shadow-md hover:bg-teal-700 transition-colors"
            onClick={() => document.getElementById('mobile-capture-input').click()}
          >
            Digitalizar factura (foto)
          </button>
          <input
            id="mobile-capture-input"
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files[0];
              if (file && file.type.startsWith('image/')) {
                setSelectedFile(file);
                setMessage('');
              } else {
                setMessage('Selecciona una imagen válida.');
                setSelectedFile(null);
              }
            }}
          />
        </label>
        {/* Input de PDF (visible siempre) */}
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="w-full sm:w-auto text-sm file:bg-gray-700 file:text-white file:px-3 file:py-1 file:rounded"
        />
        <button
          type="submit"
          disabled={uploading || !selectedFile}
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {uploading ? 'Subiendo...' : 'Subir gasto'}
        </button>
      </form>
      {/* Previsualización de imagen si se selecciona una imagen */}
      {selectedFile && selectedFile.type && selectedFile.type.startsWith('image/') && (
        <div className="mb-4 flex flex-col items-center">
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="Previsualización de la factura"
            className="max-h-48 rounded shadow border mb-2"
          />
          <span className="text-gray-400 text-xs">Previsualización de la imagen seleccionada</span>
        </div>
      )}

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
              filePath,
              createdAt,
              supplier,
              date,
              baseAmount,
              taxAmount,
              totalAmount,
              epigrafeIAE,
              processingStatus,
              processingError
            } = expense;

            const isEditing = editingId === id;

            return (
              <li key={id} className="bg-gray-700 px-4 py-3 rounded w-full">
                {/* ── Información básica ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="w-full sm:w-auto">
                    <span className="block text-sm sm:text-base font-medium">{filename}</span>
                    <span className="block text-xs sm:text-sm text-gray-300">
                      Cargado: {new Date(createdAt).toLocaleDateString()}
                    </span>
                    {supplier && (
                      <span className="block text-xs text-gray-400">
                        Proveedor: {supplier}
                      </span>
                    )}
                    {date && (
                      <span className="block text-xs text-gray-400">
                        Fecha Gasto: {new Date(date).toLocaleDateString()}
                      </span>
                    )}
                    {baseAmount != null && (
                      <span className="block text-xs text-gray-400">
                        Base Imponible: {baseAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </span>
                    )}
                    {taxAmount != null && (
                      <span className="block text-xs text-gray-400">
                        Impuesto: {taxAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </span>
                    )}
                    {totalAmount != null && (
                      <span className="block text-sm text-gray-200 font-semibold">
                        Total: {totalAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </span>
                    )}
                    {/* ── Mostrar epígrafes IAE ── */}
                    {Array.isArray(epigrafeIAE) && epigrafeIAE.length > 0 && (
                      <span className="block text-xs text-gray-300">
                        Epígrafes IAE: {epigrafeIAE.join(', ')}
                      </span>
                    )}
                    {/* ── Estado de procesamiento ── */}
                    <span className="mt-1 block text-xs font-medium">
                      Estado:{' '}
                      {processingStatus === 'pendiente' && <span className="text-yellow-300">Pendiente</span>}
                      {processingStatus === 'en_proceso' && <span className="text-blue-300">En proceso</span>}
                      {processingStatus === 'listo' && <span className="text-green-300">Listo</span>}
                      {processingStatus === 'error' && <span className="text-red-400">Error</span>}
                    </span>
                    {processingStatus === 'error' && processingError && (
                      <p className="mt-1 text-xs text-red-400">{processingError}</p>
                    )}
                  </div>

                  <div className="mt-2 sm:mt-0 flex items-center gap-2">
                    {!isEditing && (
                      <button
                        onClick={() => startEditing(expense)}
                        disabled={processingStatus !== 'listo'}
                        className={`px-3 py-1 rounded font-bold text-sm ${
                          processingStatus === 'listo'
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-600 cursor-not-allowed opacity-50'
                        }`}
                      >
                        Editar
                      </button>
                    )}
                    {!isEditing && filePath && (
                      <a
                        href={filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={filename}
                        className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded font-bold text-sm text-white"
                      >
                        Descargar
                      </a>
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
                    <div>
                      <label className="block text-xs">Epígrafes IAE</label>
                      <select
                        name="epigrafeIAE"
                        multiple
                        value={formValues.epigrafeIAE}
                        onChange={handleChange}
                        className="w-full p-2 rounded text-black"
                        size={Math.min(misEpigrafes.length, 5)}
                      >
                        {misEpigrafes.map((codigo) => (
                          <option key={codigo} value={codigo}>
                            {codigo}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-400 mt-1">
                        (Mantén Ctrl ⌘ en Mac / Ctrl en Windows para seleccionar varios)
                      </p>
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
