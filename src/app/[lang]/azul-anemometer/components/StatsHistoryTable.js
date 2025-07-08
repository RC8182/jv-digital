import React from 'react';
import { getCardinalDirection, generateColorScale } from '../utils/windUtils';
import { useUnit } from '../context/unitContext';
import { convertWindSpeed, getUnitLabel } from '../utils/windUtils';

// Generate the color scale once for efficiency
const windColorScale = generateColorScale();

const getWindSpeedColor = (speed) => {
  // Clamp the speed to the bounds of the generated scale
  const speedKt = Math.min(Math.round(speed || 0), windColorScale.length - 1);
  // Return the solid color directly from the scale
  return windColorScale[speedKt].color;
};

const StatsHistoryTable = ({ history, translations, idioma }) => {
  const { unit } = useUnit();
  const unitLabel = getUnitLabel(unit);

  if (!history || history.length === 0) {
    return null;
  }

  const formatTime = (time) => {
    const date = new Date(time);
    if (isNaN(date.getTime())) {
      return '-';
    }
    return date.toLocaleTimeString(idioma === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full mx-auto rounded-lg mt-4">
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        <table className="w-full text-white text-sm">
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr className="bg-blue-600">
              <th className="p-2 text-left font-bold">{translations.time || 'Time'}</th>
              <th className="p-2 text-center font-bold">{translations.wind || 'Viento'}</th>
              <th className="p-2 text-center font-bold">{translations.gusts || 'Rachas'}</th>
              <th className="p-2 text-right font-bold">{translations.direction || 'Dirección'}</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr 
                key={item.id || index} 
                className="border-b border-gray-700"
                style={{ backgroundColor: getWindSpeedColor(item.avg_speed_kt) }}
              >
                <td className="p-0.5">
                  {formatTime(item.timestamp)}
                </td>
                <td className="p-0.5 text-center">{convertWindSpeed(item.avg_speed_kt, unit).toFixed(unit === 'beaufort' ? 0 : 1)} {unitLabel}</td>
                <td className="p-0.5 text-center">{convertWindSpeed(item.gust_speed_kt, unit).toFixed(unit === 'beaufort' ? 0 : 1)} {unitLabel}</td>
                <td className="p-0.5 text-right">
                  {item.avg_dir_deg != null ? `${getCardinalDirection(item.avg_dir_deg, idioma)} (${item.avg_dir_deg.toFixed(0)}º)` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatsHistoryTable; 