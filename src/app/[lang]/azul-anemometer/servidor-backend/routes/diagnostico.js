// diagnostico.js
/**********************************************************************************
 * diagnostico.js – Ruta API para diagnóstico del anemómetro
 **********************************************************************************/

const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/anemometro/diagnostico - Obtener diagnóstico completo
router.get("/", async (req, res) => {
  try {
    const diagnostico = {
      timestamp: new Date().toISOString(),
      estado: "analizando",
      datos: {},
      logs: {},
      problemas: [],
      recomendaciones: []
    };

    // 1. Últimos datos de viento
    const ultimosDatos = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM raw_data ORDER BY timestamp DESC LIMIT 10", (err, rows) => {
        err ? reject(err) : resolve(rows);
      });
    });
    diagnostico.datos.ultimos = ultimosDatos;

    // 2. Últimos logs del sistema
    const ultimosLogs = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 10", (err, rows) => {
        err ? reject(err) : resolve(rows);
      });
    });
    diagnostico.logs.ultimos = ultimosLogs;

    // 3. Estadísticas de las últimas 24h
    const stats24h = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_datos,
          COUNT(CASE WHEN timestamp >= datetime('now', '-1 hour') THEN 1 END) as datos_ultima_hora,
          MIN(timestamp) as primer_dato,
          MAX(timestamp) as ultimo_dato
        FROM raw_data 
        WHERE timestamp >= datetime('now', '-24 hours')
      `, (err, row) => {
        err ? reject(err) : resolve(row);
      });
    });
    diagnostico.datos.stats24h = stats24h;

    // 4. Estado Bluetooth
    const estadoBLE = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          ble_ok,
          COUNT(*) as count
        FROM logs 
        WHERE timestamp >= datetime('now', '-1 hour') 
        GROUP BY ble_ok 
        ORDER BY ble_ok DESC 
        LIMIT 1
      `, (err, row) => {
        err ? reject(err) : resolve(row);
      });
    });
    diagnostico.logs.estadoBLE = estadoBLE;

    // 5. Detectar problemas
    const ultimoLog = ultimosLogs[0];
    const ultimoDato = ultimosDatos[0];

    if (ultimoLog) {
      // Problema Bluetooth
      if (ultimoLog.ble_ok === 0) {
        diagnostico.problemas.push({
          tipo: "bluetooth",
          severidad: "alta",
          descripcion: "Bluetooth desconectado",
          timestamp: ultimoLog.timestamp
        });
        diagnostico.recomendaciones.push("Verificar conexión física del sensor");
        diagnostico.recomendaciones.push("Comprobar alimentación del sensor");
        diagnostico.recomendaciones.push("Revisar distancia entre dispositivos");
      }

      // Problema de reinicios
      if (ultimoLog.reset_count > 0) {
        diagnostico.problemas.push({
          tipo: "reinicio",
          severidad: "media",
          descripcion: `Dispositivo reiniciado ${ultimoLog.reset_count} veces`,
          timestamp: ultimoLog.timestamp
        });
        diagnostico.recomendaciones.push("Verificar estabilidad de alimentación");
        diagnostico.recomendaciones.push("Comprobar temperatura del dispositivo");
      }

      // Problema de señal WiFi
      if (ultimoLog.rssi_dBm && ultimoLog.rssi_dBm < -70) {
        diagnostico.problemas.push({
          tipo: "wifi",
          severidad: "baja",
          descripcion: `Señal WiFi débil (${ultimoLog.rssi_dBm}dBm)`,
          timestamp: ultimoLog.timestamp
        });
        diagnostico.recomendaciones.push("Verificar distancia al router");
        diagnostico.recomendaciones.push("Revisar obstáculos en la línea de visión");
      }
    }

    // 6. Detectar gap en datos
    if (ultimoDato) {
      const tiempoDesdeUltimoDato = Date.now() - new Date(ultimoDato.timestamp).getTime();
      const minutosDesdeUltimoDato = Math.floor(tiempoDesdeUltimoDato / (1000 * 60));
      
      if (minutosDesdeUltimoDato > 10) {
        diagnostico.problemas.push({
          tipo: "datos",
          severidad: "alta",
          descripcion: `Sin datos de viento desde hace ${minutosDesdeUltimoDato} minutos`,
          timestamp: ultimoDato.timestamp
        });
        diagnostico.recomendaciones.push("Verificar conexión del sensor anemómetro");
        diagnostico.recomendaciones.push("Comprobar alimentación del sensor");
      }
    }

    // 7. Determinar estado general
    if (diagnostico.problemas.length === 0) {
      diagnostico.estado = "operativo";
    } else if (diagnostico.problemas.some(p => p.severidad === "alta")) {
      diagnostico.estado = "critico";
    } else {
      diagnostico.estado = "advertencia";
    }

    res.json(diagnostico);

  } catch (error) {
    console.error("❌ Error en diagnóstico:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: error.message
    });
  }
});

// GET /api/anemometro/diagnostico/estado - Estado rápido
router.get("/estado", async (req, res) => {
  try {
    const ultimoLog = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 1", (err, row) => {
        err ? reject(err) : resolve(row);
      });
    });

    const ultimoDato = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM raw_data ORDER BY timestamp DESC LIMIT 1", (err, row) => {
        err ? reject(err) : resolve(row);
      });
    });

    const estado = {
      timestamp: new Date().toISOString(),
      bluetooth: ultimoLog?.ble_ok === 1 ? "conectado" : "desconectado",
      datos: ultimoDato ? "activos" : "inactivos",
      rssi: ultimoLog?.rssi_dBm || null,
      reset_count: ultimoLog?.reset_count || 0
    };

    res.json(estado);

  } catch (error) {
    console.error("❌ Error obteniendo estado:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: error.message
    });
  }
});

module.exports = router; 