// config.js - Configuración centralizada para la aplicación del anemómetro

const config = {
  // API principal para datos históricos y agregados
  API_BASE_URL: 'https://azul-kite.ddns.net/api/anemometro',
  
  // Configuración de polling
  POLLING_INTERVAL: 5000, // 5 segundos
  
  // Configuración de historial
  MAX_HISTORY_ITEMS: 500,
  
  // Configuración de estadísticas
  DEFAULT_STATS_MINUTES: 15,
};

export default config; 