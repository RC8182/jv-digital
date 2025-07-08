import React from 'react';
import { windTranslations } from '../utils/windUtils';

export default function HistoryFilters({
  idioma = 'es',
  date,
  startHour,
  endHour,
  timeframe,
  timeframeOptions = [
    { value: '3min', label: '3 min' },
    { value: '15min', label: '15 min' },
    { value: '1h', label: '1 hora' }
  ],
  onChange
}) {
  const t = windTranslations[idioma] || windTranslations.es;

  const handleChange = (field, value) => {
    if (onChange) onChange({
      date,
      startHour,
      endHour,
      timeframe,
      [field]: value
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-4 flex flex-row flex-wrap items-center justify-center gap-2 overflow-x-auto">
      <div className="flex items-center space-x-1">
        <label className="text-white text-sm whitespace-nowrap" htmlFor="date-filter">{t.date_label || 'Fecha'}:</label>
        <input
          id="date-filter"
          type="date"
          value={date}
          onChange={e => handleChange('date', e.target.value)}
          className="px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-white"
        />
      </div>
      
      <div className="flex items-center space-x-1">
        <label className="text-white text-sm whitespace-nowrap" htmlFor="start-hour">{t.start_hour_label || 'Hora inicio'}:</label>
        <input
          id="start-hour"
          type="time"
          value={startHour}
          onChange={e => handleChange('startHour', e.target.value)}
          className="px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-white"
        />
      </div>
      
      <div className="flex items-center space-x-1">
        <label className="text-white text-sm whitespace-nowrap" htmlFor="end-hour">{t.end_hour_label || 'Hora fin'}:</label>
        <input
          id="end-hour"
          type="time"
          value={endHour}
          onChange={e => handleChange('endHour', e.target.value)}
          className="px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-white"
        />
      </div>
      
      <div className="flex items-center space-x-1">
        <label className="text-white text-sm whitespace-nowrap" htmlFor="timeframe-select">{t.window || 'Ventana Tiempo'}:</label>
        <select
          id="timeframe-select"
          value={timeframe}
          onChange={e => handleChange('timeframe', e.target.value)}
          className="w-32 px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-white"
        >
          {timeframeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
} 