// utils/windUtils.js

export function getCardinalDirection(angle, idioma = 'en') {
    angle = (angle + 360) % 360;
    const directions = {
      en: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
      es: ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']
    };
    const index = Math.floor((angle + 22.5) / 45) % 8;
    return directions[idioma][index];
  }
  
  export function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${d}/${m}/${y} ${h}:${min}`;
  }
  
  export function filterAndGroupByDate(data, idioma = 'en', unique = false, days = 1) {
    if (!Array.isArray(data)) return {};
    const today = new Date();
    let filtered;
    if (days === 1) {
      // Solo el día actual
      const todayStr = today.toLocaleDateString('en-CA');
      filtered = data.filter(item => {
        if (!item.timestamp) return false;
        const itemDate = new Date(item.timestamp).toLocaleDateString('en-CA');
        return itemDate === todayStr;
      });
    } else {
      // Últimos N días
      const cutoff = new Date();
      cutoff.setDate(today.getDate() - (days - 1));
      filtered = data.filter(item => {
        if (!item.timestamp) return false;
        const itemDate = new Date(item.timestamp);
        return itemDate >= cutoff && itemDate <= today;
      });
    }
    if (unique) {
      const seenTimestamps = new Set();
      filtered = filtered.filter(item => {
        if (seenTimestamps.has(item.timestamp)) return false;
        seenTimestamps.add(item.timestamp);
        return true;
      });
    }
    // Agrupar por fecha local
    return filtered.reduce((acc, item) => {
      const date = new Date(item.timestamp).toLocaleDateString(idioma === 'es' ? 'es-ES' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {});
  }
  
  export const windTranslations = {
    es: {
      wind: 'Viento',
      gust: 'Racha',
      avg_wind: 'Viento',
      max_gust: 'Racha',
      window: 'Ventana Tiempo',
      avg_speed: 'Vel. Promedio',
      max_speed: 'Vel. Máxima',
      min_speed: 'Vel. Mínima',
      gust_factor: 'Factor Ráfaga',
      std_dev: 'Desv. Estándar',
      samples: 'Muestras',
      non_zero_samples: 'Muestras >0.1kt',
      avg_direction: 'Dir. Promedio',
      loading_stats: 'Cargando estadísticas...',
      no_history: 'No hay datos de historial disponibles.',
      last_update: 'Última actualización:',
      minutes_label: 'Minutos',
      minutes_short: 'min',
      minutes_help: 'Selecciona el period para el cálculo de estadísticas.',
      date_label: 'Fecha',
      start_hour_label: 'Desde',
      end_hour_label: 'Hasta',
      no_data_for_filter: 'No hay datos para el filtro seleccionado.'
    },
    en: {
      wind: 'Wind',
      gust: 'Gust',
      avg_wind: 'Wind',
      max_gust: 'Gust',
      window: 'Time Window',
      avg_speed: 'Avg. Speed',
      max_speed: 'Max. Speed',
      min_speed: 'Min. Speed',
      gust_factor: 'Gust Factor',
      std_dev: 'Standard Dev.',
      samples: 'Samples',
      non_zero_samples: 'Non-zero Samples',
      avg_direction: 'Avg. Direction',
      loading_stats: 'Loading statistics...',
      no_history: 'No history data available.',
      last_update: 'Last update:',
      minutes_label: 'Minutes',
      minutes_short: 'min',
      minutes_help: 'Select the period for statistics calculation.',
      date_label: 'Date',
      start_hour_label: 'From',
      end_hour_label: 'To',
      no_data_for_filter: 'No data for the selected filter.'
    }
  };
  
  // Escala de colores para viento (usada en tacometroF1 y tablas)
  export const windColorStops = [
    { value: 0, color: [198, 226, 255] },
    { value: 6, color: [65, 105, 225] },
    { value: 12, color: [32, 205, 50] },
    { value: 18, color: [255, 215, 0] },
    { value: 24, color: [255, 165, 0] },
    { value: 30, color: [255, 69, 0] },
    { value: 36, color: [255, 0, 0] },
    { value: 42, color: [199, 21, 133] },
    { value: 48, color: [75, 0, 130] },
    { value: 54, color: [46, 8, 84] },
    { value: 60, color: [0, 0, 0] }
  ];
  
  export function generateColorScale(numSteps = 60, colorStops = windColorStops) {
    return Array.from({ length: numSteps + 1 }, (_, i) => {
      const prevStop = colorStops.reduce((prev, curr) => (curr.value <= i ? curr : prev));
      const nextStop = colorStops.find(stop => stop.value >= i) || colorStops[colorStops.length - 1];
      if (prevStop.value === nextStop.value) {
        return {
          value: i,
          color: `rgb(${prevStop.color.join(',')})`
        };
      }
      const ratio = (i - prevStop.value) / (nextStop.value - prevStop.value);
      const color = prevStop.color.map((c, idx) => 
        Math.round(c + ratio * (nextStop.color[idx] - c))
      );
      return {
        value: i,
        color: `rgb(${color.join(',')})`
      };
    });
  }
  
  // --- Funciones de Conversión de Unidades ---

  /**
   * Convierte una velocidad de nudos a la unidad deseada.
   * @param {number} speedInKnots - Velocidad en nudos.
   * @param {string} toUnit - Unidad a la que convertir ('knots', 'beaufort', 'km/h', 'm/s').
   * @returns {number|string} - El valor convertido. Para Beaufort, devuelve un entero.
   */
  export function convertWindSpeed(speedInKnots, toUnit) {
    if (speedInKnots === null || speedInKnots === undefined) return 0;

    switch (toUnit) {
      case 'km/h':
        return speedInKnots * 1.852;
      case 'm/s':
        return speedInKnots * 0.514444;
      case 'beaufort':
        if (speedInKnots < 1) return 0;
        if (speedInKnots <= 3) return 1;
        if (speedInKnots <= 6) return 2;
        if (speedInKnots <= 10) return 3;
        if (speedInKnots <= 16) return 4;
        if (speedInKnots <= 21) return 5;
        if (speedInKnots <= 27) return 6;
        if (speedInKnots <= 33) return 7;
        if (speedInKnots <= 40) return 8;
        if (speedInKnots <= 47) return 9;
        if (speedInKnots <= 55) return 10;
        if (speedInKnots <= 63) return 11;
        return 12;
      case 'knots':
      default:
        return speedInKnots;
    }
  }

  /**
   * Obtiene la etiqueta para una unidad de velocidad.
   * @param {string} unit - La unidad ('knots', 'beaufort', 'km/h', 'm/s').
   * @returns {string} - La etiqueta de la unidad.
   */
  export function getUnitLabel(unit) {
    switch (unit) {
      case 'knots':
        return 'kts';
      case 'beaufort':
        return 'Bft';
      case 'km/h':
        return 'km/h';
      case 'm/s':
        return 'm/s';
      default:
        return '';
    }
  }
  