'use client';
import { useState } from 'react';

export default function FiscalSummary() {
  const [trimestre, setTrimestre] = useState('1');
  const [year, setYear]           = useState(new Date().getFullYear().toString());
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const fetchSummary = async () => {
    setLoading(true);
    setError('');
    setSummary(null);

    try {
      const res = await fetch(`/api/agente/contabilidad/trimestral?trimestre=${trimestre}&year=${year}`);
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || `Status ${res.status}`);
      }
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error('Error al obtener resumen fiscal:', err);
      setError('No se pudo cargar el resumen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gray-800 text-white p-4 sm:p-6 rounded w-full mb-6">
      <h2 className="text-2xl font-semibold mb-4">Resumen Fiscal Trimestral</h2>

      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center">
        <div>
          <label className="block text-sm">Trimestre</label>
          <select
            value={trimestre}
            onChange={(e) => setTrimestre(e.target.value)}
            className="mt-1 p-2 rounded text-black"
          >
            <option value="1">1 (Ene-Mar)</option>
            <option value="2">2 (Abr-Jun)</option>
            <option value="3">3 (Jul-Sep)</option>
            <option value="4">4 (Oct-Dic)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">Año</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="mt-1 p-2 w-24 rounded text-black"
            min="2000"
            max="2100"
          />
        </div>
        <button
          onClick={fetchSummary}
          disabled={loading}
          className="mt-6 sm:mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-bold text-center"
        >
          {loading ? 'Cargando…' : 'Ver Resumen'}
        </button>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {summary && (
        <div className="bg-gray-700 p-4 rounded space-y-2">
          <p>Trimestre: {summary.trimestre} / {summary.year}</p>
          <p>Ingresos Base: {summary.ingresosBase.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
          <p>Ingresos IGIC: {summary.ingresosIGIC.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
          <p>Ingresos IRPF: {summary.ingresosIRPF.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
          <p>Gastos Base: {summary.gastosBase.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
          <p>Gastos Impuesto: {summary.gastosImpuesto.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
          <p className="font-bold">
            Modelo 130 (20%): {summary.modelo130.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="font-bold">
            Modelo 303: {summary.modelo303.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
      )}
    </section>
  );
}
