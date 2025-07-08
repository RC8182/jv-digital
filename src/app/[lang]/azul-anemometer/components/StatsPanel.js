import React, { useState, useEffect } from 'react';
import StatsHistoryTable from './StatsHistoryTable';
import HistoryFilters from './HistoryFilters';
import { windTranslations } from '../utils/windUtils';

function getTodayDateStr() {
  const today = new Date();
  // Usar UTC para consistencia con el servidor
  const utcYear = today.getUTCFullYear();
  const utcMonth = String(today.getUTCMonth() + 1).padStart(2, '0');
  const utcDay = String(today.getUTCDate()).padStart(2, '0');
  return `${utcYear}-${utcMonth}-${utcDay}`;
}

function getDefaultHours() {
  return { startHour: '00:00', endHour: '23:59' };
}

export default function StatsPanel({ idioma, buttons }) {
  const t = windTranslations[idioma] || windTranslations.en;

  // Opciones para el timeframe
  let timeframeOptions = [
    { value: '3min', label: '3 min' },
    { value: '15min', label: '15 min' },
    { value: '1h', label: '1 hora' }
  ];
  if (buttons && Array.isArray(buttons) && buttons.length > 0) {
    timeframeOptions = buttons.map(opt => {
      if (typeof opt === 'string') return { value: opt, label: opt };
      if (typeof opt === 'object' && opt.value) return { value: opt.value, label: opt.label || opt.value };
      return null;
    }).filter(Boolean);
    if (timeframeOptions.length === 0) {
      timeframeOptions = [
        { value: '3min', label: '3 min' },
        { value: '15min', label: '15 min' },
        { value: '1h', label: '1 hora' }
      ];
    }
  }

  // Estado de los filtros
  const [filters, setFilters] = useState(() => {
    const { startHour, endHour } = getDefaultHours();
    let initialTf = timeframeOptions[0].value;
    return {
      date: getTodayDateStr(),
      startHour,
      endHour,
      timeframe: initialTf,
    };
  });

  // Estado de los datos y carga
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch datos del backend cuando cambian los filtros
  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          date: filters.date,
          startHour: filters.startHour,
          endHour: filters.endHour,
          timeframe: filters.timeframe
        });
        const res = await fetch(`https://azul-kite.ddns.net/api/anemometro/history?${params.toString()}`);
        if (!res.ok) throw new Error('Error al obtener datos');
        const json = await res.json();
        setHistoryData(json.data || []);
      } catch (err) {
        setError(err.message);
        setHistoryData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [filters]);

  // Manejar cambios en los filtros
  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <>
      {/* Título bien visible */}
      <div className="flex flex-col items-center mb-4">
        <h2 className="text-3xl font-extrabold text-green-400 drop-shadow-lg mb-2 text-center">{t.stats_title || 'Historial'}</h2>
      </div>
      {/* Filtros antes del acordeón */}
      <HistoryFilters
        idioma={idioma}
        date={filters.date}
        startHour={filters.startHour}
        endHour={filters.endHour}
        timeframe={filters.timeframe}
        timeframeOptions={timeframeOptions}
        onChange={handleFiltersChange}
      />
      {/* Estado de carga y error */}
      {loading && <div className="text-center text-gray-400 my-4">Cargando datos...</div>}
      {error && <div className="text-center text-red-500 my-4">{error}</div>}
      
      {/* Tabla de historial filtrado */}
      <div className="w-full max-w-4xl mx-auto">
        <StatsHistoryTable
          history={historyData}
          translations={t}
          idioma={idioma}
        />
        {!loading && !error && historyData && historyData.length === 0 && (
          <div className="text-center text-gray-400 mt-4">
            {t.no_data_for_filter || 'No hay datos para el filtro seleccionado.'}<br/>
            <span className="text-xs text-gray-500">Prueba cambiando la fecha o el rango horario.</span>
          </div>
        )}
      </div>
    </>
  );
} 