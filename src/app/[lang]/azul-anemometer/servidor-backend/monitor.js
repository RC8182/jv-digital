// monitor.js
/**********************************************************************************
 * monitor.js – Monitoreo automático del anemómetro
 * Detecta problemas y puede enviar alertas
 **********************************************************************************/

const db = require("./db"); // Correcto, importa el objeto { db, getHistory }
const fs = require("fs");   // ¡CORREGIDO! Carga el módulo 'fs'
const path = require("path"); // ¡CORREGIDO! Carga el módulo 'path'
const { broadcast } = require('./server');

class AnemometroMonitor {
  constructor() {
    this.alertas = [];
    this.ultimaVerificacion = null;
    this.config = {
      intervaloVerificacion: 5 * 60 * 1000, // 5 minutos
      timeoutDatos: 10 * 60 * 1000, // 10 minutos sin datos
      rssiMinimo: -70, // dBm mínimo
      maxReinicios: 5, // Máximo número de reinicios por hora
      archivoLog: path.join(__dirname, "monitor.log") // Ahora funcionará
    };
    this.timer = null;
  }

  async verificarEstado() {
    const timestamp = new Date().toISOString();
    this.ultimaVerificacion = timestamp;
    
    try {
      console.log(`🔍 [${timestamp}] Iniciando verificación del anemómetro...`);
      
      const [ultimoDato, ultimoLog, statsUltimaHora] = await Promise.all([
        this.obtenerUltimoDato(),
        this.obtenerUltimoLog(),
        this.obtenerStatsUltimaHora()
      ]);
      
      const problemas = this.analizarProblemas(ultimoDato, ultimoLog, statsUltimaHora);
      
      if (problemas.length > 0) {
        this.generarAlertas(problemas);
      }
      
      this.registrarEstado(timestamp, problemas);
      
      console.log(`✅ [${timestamp}] Verificación completada. Problemas detectados: ${problemas.length}`);

      broadcast({ 
        type: 'monitor_status', 
        payload: {
            timestamp,
            problemas,
            estado: problemas.length === 0 ? 'operativo' : 'problemas'
        }
      });
      
    } catch (error) {
      console.error(`❌ [${timestamp}] Error en la verificación:`, error.message);
      this.registrarError(timestamp, error);
    }
  }

  obtenerUltimoDato() {
    return new Promise((resolve, reject) => {
      // CORREGIDO: Usamos db.db porque db.js exporta un objeto
      db.db.get("SELECT * FROM raw_data ORDER BY timestamp DESC LIMIT 1", (err, row) => {
        err ? reject(err) : resolve(row);
      });
    });
  }

  obtenerUltimoLog() {
    return new Promise((resolve, reject) => {
      db.db.get("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 1", (err, row) => {
        err ? reject(err) : resolve(row);
      });
    });
  }

  obtenerStatsUltimaHora() {
    return new Promise((resolve, reject) => {
      db.db.get(`
        SELECT 
          COUNT(*) as total_datos,
          COUNT(CASE WHEN ble_ok = 0 THEN 1 END) as ble_fails,
          AVG(rssi_dBm) as avg_rssi,
          MAX(reset_count) as max_reset_count
        FROM logs 
        WHERE timestamp >= datetime('now', '-1 hour')
      `, (err, row) => {
        err ? reject(err) : resolve(row);
      });
    });
  }

  analizarProblemas(ultimoDato, ultimoLog, statsUltimaHora) {
    const problemas = [];
    const ahora = Date.now();

    if (!ultimoDato) {
      problemas.push({ tipo: 'datos', severidad: 'alta', descripcion: 'No hay datos de viento disponibles' });
    } else {
      const tiempoDesdeUltimoDato = ahora - new Date(ultimoDato.timestamp).getTime();
      if (tiempoDesdeUltimoDato > this.config.timeoutDatos) {
        problemas.push({ tipo: 'datos', severidad: 'alta', descripcion: `Sin datos de viento desde hace ${Math.floor(tiempoDesdeUltimoDato / 60000)} min` });
      }
    }

    if (ultimoLog) {
      if (ultimoLog.ble_ok === 0) {
        problemas.push({ tipo: 'bluetooth', severidad: 'alta', descripcion: 'Bluetooth desconectado' });
      }
      if (ultimoLog.rssi_dBm && ultimoLog.rssi_dBm < this.config.rssiMinimo) {
        problemas.push({ tipo: 'wifi', severidad: 'media', descripcion: `Señal WiFi débil (${ultimoLog.rssi_dBm}dBm)` });
      }
    }
    
    if (statsUltimaHora) {
        if (statsUltimaHora.max_reset_count > this.config.maxReinicios) {
          problemas.push({ tipo: 'reinicio', severidad: 'media', descripcion: `Demasiados reinicios (${statsUltimaHora.max_reset_count}/hr)` });
        }
        if (statsUltimaHora.ble_fails > 10) {
          problemas.push({ tipo: 'bluetooth_inestable', severidad: 'media', descripcion: `Bluetooth inestable (${statsUltimaHora.ble_fails} fallos/hr)` });
        }
    }

    return problemas;
  }

  generarAlertas(problemas) {
    const timestamp = new Date().toISOString();
    for (const problema of problemas) {
      const mensaje = `ALERTA [${problema.severidad.toUpperCase()}]: ${problema.descripcion}`;
      this.alertas.push({ timestamp, problema, mensaje });
      console.log(`🚨 ${mensaje}`);
      broadcast({ type: 'alert', level: problema.severidad, message: problema.descripcion });
    }
  }

  registrarEstado(timestamp, problemas) {
    const logLine = `[${timestamp}] ${(problemas.length === 0 ? 'OPERATIVO' : 'PROBLEMAS')} - ${problemas.length} problemas detectados\n`;
    try {
      fs.appendFileSync(this.config.archivoLog, logLine);
    } catch (error) {
      console.error('Error escribiendo en monitor.log:', error.message);
    }
  }

  registrarError(timestamp, error) {
    const logLine = `[${timestamp}] ERROR: ${error.message}\n`;
    try {
      fs.appendFileSync(this.config.archivoLog, logLine);
    } catch (err) {
      console.error('Error escribiendo en monitor.log:', err.message);
    }
  }

  async iniciarMonitoreo() {
    if (this.timer) {
      console.log("El monitoreo ya está en marcha.");
      return;
    }
    
    const intervalo = this.config.intervaloVerificacion;
    console.log(`🚀 Iniciando monitoreo cada ${intervalo / 1000} segundos.`);
    
    this.timer = setInterval(() => this.verificarEstado(), intervalo); 
    await this.verificarEstado();
  }

  detenerMonitoreo() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log("🛑 Monitoreo detenido.");
    }
  }
}

module.exports = AnemometroMonitor;