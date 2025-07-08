# Anemómetro Azul - Aplicación de Monitoreo de Viento

## Descripción
Aplicación web para monitorear datos de viento en tiempo real desde el anemómetro ubicado en Azul. La aplicación muestra datos en vivo, históricos y estadísticas del viento.

## Configuración

### Archivo de Configuración (`config.js`)
La aplicación utiliza un archivo de configuración centralizado que permite ajustar fácilmente las URLs y parámetros:

```javascript
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
```

### Arquitectura de Servidores
La aplicación utiliza nginx como proxy inverso que redirige las peticiones al servidor backend:

- **Dominio Principal**: `https://azul-kite.ddns.net`
- **API Backend**: Proxy nginx → `192.168.1.32:3000` (Node.js + SQLite)

### Configuración de Nginx
```nginx
# API del anemómetro
location /api/anemometro/ {
    proxy_pass http://192.168.1.32:3000/api/anemometro/;
}
```

## Funcionalidades

### Modos de Visualización
1. **Live (Vivo)**: Datos actualizados cada 5 segundos mediante polling
2. **Stats (Estadísticas)**: Historial filtrable con datos de 3min, 15min y 1hora

### Componentes Principales
- **F1WindGauge**: Medidores de velocidad y racha
- **LivePanel**: Panel de datos en vivo
- **StatsPanel**: Panel de estadísticas con filtros
- **HistoryAccordion**: Historial organizado por días
- **HistoryTable**: Tabla de datos históricos
- **HistoryFilters**: Filtros para el historial

## Solución de Problemas

### Error de `.toFixed()`
Se han corregido todos los errores relacionados con valores `null` o `undefined` que causaban errores de `.toFixed()`.

### Verificación de Conectividad
Para verificar que todo funciona correctamente:

1. **API Backend**: `https://azul-kite.ddns.net/api/anemometro/raw`
2. **Datos 3min**: `https://azul-kite.ddns.net/api/anemometro/3min`

### Configuración de Red
- Asegúrate de que nginx esté funcionando correctamente
- Verifica que el servidor backend (192.168.1.32:3000) esté accesible
- Comprueba que el certificado SSL esté válido

## Desarrollo

### Estructura de Archivos
```
azul-anemometer/
├── components/
│   ├── anemometer.js          # Componente principal
│   ├── LivePanel.js           # Panel de datos en vivo
│   ├── StatsPanel.js          # Panel de estadísticas
│   ├── tacometroF1.js         # Medidores de viento
│   ├── HistoryAccordion.js    # Historial en acordeón
│   ├── HistoryTable.js        # Tabla de historial
│   └── HistoryFilters.js      # Filtros de historial
├── hooks/
│   └── useWindData.js         # Hook para datos de viento
├── utils/
│   └── windUtils.js           # Utilidades
├── config.js                  # Configuración centralizada
└── README.md                  # Este archivo
```

### Personalización
Para cambiar la configuración, edita el archivo `config.js`:

```javascript
// Cambiar el intervalo de polling
POLLING_INTERVAL: 3000, // 3 segundos

// Cambiar el número máximo de elementos en el historial
MAX_HISTORY_ITEMS: 1000,
```

## Estado de Conexión
La aplicación muestra el estado de actualización:
- 🔄 **Actualizando datos cada 5 segundos**: Polling activo para datos en vivo

## Notas Técnicas
- La aplicación usa HTTPS para todas las comunicaciones
- Nginx maneja la terminación SSL y el proxy al servidor backend
- Los datos se actualizan mediante polling cada 5 segundos en modo "Live"
- Los datos históricos vienen del servidor Node.js con SQLite
- El sistema de agregación funciona cada 3, 15 minutos y 1 hora 