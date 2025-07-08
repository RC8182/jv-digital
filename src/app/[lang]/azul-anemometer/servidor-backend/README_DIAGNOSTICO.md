# 🔍 Sistema de Diagnóstico del Anemómetro

Este sistema proporciona herramientas completas para diagnosticar y monitorear el estado del anemómetro.

## 📋 Archivos del Sistema

- `diagnostico.js` - Script de diagnóstico básico
- `monitor.js` - Sistema de monitoreo automático
- `ejecutarDiagnostico.js` - Script de diagnóstico manual
- `start.js` - Script de inicio con diagnóstico automático
- `routes/diagnostico.js` - API REST para diagnóstico
- `components/DiagnosticoPanel.js` - Componente React para la interfaz

## 🚀 Cómo Usar

### 1. Iniciar Servidor con Diagnóstico Automático

```bash
# Iniciar servidor con diagnóstico previo (recomendado)
node start.js

# Iniciar servidor sin diagnóstico previo
node start.js --no-diagnostico

# Solo ejecutar diagnóstico
node start.js --solo-diagnostico
```

### 2. Diagnóstico Manual

```bash
# Diagnóstico completo
node ejecutarDiagnostico.js

# Diagnóstico rápido
node ejecutarDiagnostico.js rapido

# Monitoreo continuo cada 5 minutos
node ejecutarDiagnostico.js monitor

# Monitoreo continuo cada 10 minutos
node ejecutarDiagnostico.js monitor 10
```

### 3. Diagnóstico Básico

```bash
# Solo el script de diagnóstico
node diagnostico.js
```

### 4. Monitoreo Automático

```bash
# Iniciar monitoreo independiente
node monitor.js
```

## 🌐 API REST

### Endpoints Disponibles

- `GET /api/anemometro/diagnostico` - Diagnóstico completo
- `GET /api/anemometro/diagnostico/estado` - Estado rápido

### Ejemplo de Uso

```bash
# Diagnóstico completo
curl http://192.168.1.32:3000/api/anemometro/diagnostico

# Estado rápido
curl http://192.168.1.32:3000/api/anemometro/diagnostico/estado
```

## 📊 Qué Detecta el Sistema

### Problemas Críticos (Alta Severidad)
- **Sin datos de viento**: No se reciben datos desde hace más de 10 minutos
- **Bluetooth desconectado**: Sensor anemómetro no conectado
- **Sin datos disponibles**: Base de datos vacía

### Problemas de Advertencia (Media Severidad)
- **Señal WiFi débil**: RSSI menor a -70dBm
- **Reinicios frecuentes**: Más de 5 reinicios por hora
- **Bluetooth inestable**: Más de 10 fallos por hora

### Problemas Informativos (Baja Severidad)
- **Configuración subóptima**: Parámetros que pueden mejorarse

## 🔧 Configuración

### Parámetros del Monitoreo

```javascript
// En monitor.js
config = {
  intervaloVerificacion: 5 * 60 * 1000, // 5 minutos
  timeoutDatos: 10 * 60 * 1000,         // 10 minutos sin datos
  rssiMinimo: -70,                      // dBm mínimo
  maxReinicios: 5,                      // Máximo reinicios por hora
  archivoLog: "monitor.log"             // Archivo de log
}
```

### Personalizar Configuración

Puedes modificar estos valores en `monitor.js` según tus necesidades:

```javascript
// Ejemplo: Cambiar intervalo a 2 minutos
this.config.intervaloVerificacion = 2 * 60 * 1000;

// Ejemplo: Cambiar timeout de datos a 5 minutos
this.config.timeoutDatos = 5 * 60 * 1000;
```

## 📝 Logs y Archivos

### Archivos de Log
- `monitor.log` - Log de eventos del monitoreo automático
- `anemometro.db` - Base de datos SQLite con datos y logs

### Ubicación de Logs
Los logs se guardan en el directorio del servidor backend:
```
src/app/[lang]/azul-anemometer/servidor-backend/
```

## 🚨 Alertas y Notificaciones

### Alertas Automáticas
El sistema genera alertas automáticamente cuando detecta problemas:

- **CRÍTICO**: Problemas que impiden el funcionamiento
- **ADVERTENCIA**: Problemas que pueden afectar el rendimiento
- **INFORMATIVO**: Sugerencias de mejora

### Mensajes de Alerta
```
🚨 ALERTA: CRÍTICO: No se reciben datos de viento desde 15:30:00
🚨 ALERTA: CRÍTICO: Sensor anemómetro desconectado - Verificar conexión física
🚨 ALERTA: ADVERTENCIA: Señal WiFi débil (-75dBm) - Posible pérdida de conectividad
```

## 🛠️ Solución de Problemas

### Problema: Bluetooth Desconectado
**Síntomas**: `ble_ok: 0` en los logs
**Soluciones**:
1. Verificar que el sensor esté encendido
2. Comprobar distancia entre dispositivos (máximo 10m)
3. Revisar interferencias electromagnéticas
4. Reiniciar el sensor anemómetro

### Problema: Sin Datos de Viento
**Síntomas**: No hay registros en `raw_data` recientes
**Soluciones**:
1. Verificar alimentación del sensor anemómetro
2. Comprobar conexión física del sensor
3. Revisar estado del dispositivo principal
4. Verificar configuración MQTT

### Problema: Señal WiFi Débil
**Síntomas**: `rssi_dBm < -70` en los logs
**Soluciones**:
1. Verificar distancia al router WiFi
2. Revisar obstáculos en la línea de visión
3. Considerar repetidor WiFi
4. Cambiar canal WiFi si hay interferencias

### Problema: Reinicios Frecuentes
**Síntomas**: `reset_count` alto en los logs
**Soluciones**:
1. Verificar estabilidad de alimentación
2. Comprobar temperatura del dispositivo
3. Revisar memoria disponible
4. Verificar firmware actualizado

## 📱 Interfaz Web

### Panel de Diagnóstico
El componente `DiagnosticoPanel.js` proporciona una interfaz visual que muestra:

- Estado general del sistema
- Indicadores de problemas con colores
- Estadísticas en tiempo real
- Recomendaciones automáticas
- Botón de actualización manual

### Integración
Para usar el panel en tu aplicación React:

```javascript
import DiagnosticoPanel from './components/DiagnosticoPanel';

function App() {
  return (
    <div>
      <h1>Anemómetro</h1>
      <DiagnosticoPanel />
    </div>
  );
}
```

## 🔄 Mantenimiento

### Limpieza de Logs
Los logs se acumulan con el tiempo. Puedes limpiarlos manualmente:

```bash
# Limpiar log de monitoreo
> monitor.log

# O programar limpieza automática
# Agregar al crontab para limpiar cada semana
0 0 * * 0 > /path/to/monitor.log
```

### Actualización de Configuración
Para cambiar la configuración sin reiniciar:

1. Modificar los valores en `monitor.js`
2. Reiniciar el servidor: `node start.js`

## 📞 Soporte

Si encuentras problemas con el sistema de diagnóstico:

1. Revisar los logs en `monitor.log`
2. Ejecutar diagnóstico manual: `node ejecutarDiagnostico.js`
3. Verificar la base de datos: `sqlite3 anemometro.db`
4. Comprobar conectividad MQTT y WiFi

---

**Desarrollado para el sistema de anemómetro JV-Digital** 