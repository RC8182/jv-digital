// src/app/[lang]/dashboard/agente/components/FiscalSummary.js
'use client';

import { useState, useEffect } from 'react';

export default function FiscalSummary() {
  const [trimestre, setTrimestre] = useState('1');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [epigrafe, setEpigrafe] = useState('all');
  const [epigrafes, setEpigrafes] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Carga de epígrafes via API
  useEffect(() => {
    const fetchEpig = async () => {
      try {
        const res = await fetch('/api/users/epigrafes');
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setEpigrafes(data.epigrafes || []);
      } catch (err) {
        console.error('Error al obtener epígrafes:', err);
      }
    };
    fetchEpig();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    setError('');
    setSummary(null);
    try {
      const url = `/api/agente/contabilidad/trimestral?trimestre=${trimestre}&year=${year}&epigrafe=${epigrafe}`;
      const res = await fetch(url);
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

  const formatCurrency = (value) =>
    value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

  return (
    <section className="bg-gray-800 text-white p-4 sm:p-6 rounded w-full mb-6">
      <h2 className="text-2xl font-semibold mb-4">Resumen Fiscal Trimestral</h2>

      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center">
        {/* Selector de trimestre */}
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

        {/* Selector de año */}
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

        {/* Selector de epígrafe */}
        <div>
          <label className="block text-sm">Epígrafe</label>
          <select
            value={epigrafe}
            onChange={(e) => setEpigrafe(e.target.value)}
            className="mt-1 p-2 rounded text-black"
          >
            <option value="all">Todos</option>
            {epigrafes.map((epi) => (
              <option key={epi} value={epi}>
                {epi}
              </option>
            ))}
          </select>
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
          <p>
            Trimestre: {summary.trimestre} / {summary.year}
          </p>
          {summary.epigrafe && (
            <p>
              Epígrafe:{' '}
              {summary.epigrafe === 'all' ? 'Todos' : summary.epigrafe}
            </p>
          )}
          <hr className="border-gray-600 my-2" />

          <p>
            Facturas Emitidas (Total): {summary.totalFacturasEmitidas} (
            {formatCurrency(summary.ingresosTotalFacturas)})
          </p>
          <p>
            Facturas Pagadas: {summary.totalFacturasPagadas} (
            {formatCurrency(summary.ingresosPagadosTotal)})
          </p>
          <p>
            Facturas Pendientes: {summary.totalFacturasPendientes} (
            {formatCurrency(summary.ingresosPendientesTotal)})
          </p>
          <p>Ingresos Base Contable: {formatCurrency(summary.ingresosBase)}</p>
          <p>Ingresos IGIC: {formatCurrency(summary.ingresosIGIC)}</p>
          <p>
            Ingresos IRPF Retenido: {formatCurrency(summary.ingresosIRPF)}
          </p>

          <hr className="border-gray-600 my-2" />
          <p>
            Gastos Registrados (Total): {summary.totalGastosRegistrados}
          </p>
          <p>Gastos Base Contable: {formatCurrency(summary.gastosBase)}</p>
          <p>Gastos Impuesto (IVA/IGIC): {formatCurrency(summary.gastosImpuesto)}</p>

          <hr className="border-gray-600 my-2" />
          <p className="font-bold">
            Modelo 130 (20% IRPF Estimado):{' '}
            {formatCurrency(summary.modelo130)}
          </p>
          <p className="font-bold">
            Modelo 303 (IVA/IGIC): {formatCurrency(summary.modelo303)}
          </p>
        </div>
      )}
    </section>
  );
}
