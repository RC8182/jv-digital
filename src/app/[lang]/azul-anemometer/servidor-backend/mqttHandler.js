// mqttHandler.js
/**********************************************************************************
 * mqttHandler.js – Ingesta de datos y logs, publicación de hora y config.
 * (ACTUALIZADO para el nuevo formato de logs y funciones de estado)
 **********************************************************************************/

require("dotenv").config();
const mqtt = require("mqtt");
const { db } = require("./db");
let broadcast; // Se inicializará desde server.js

// --- NUEVO: Estado en memoria ---
// Guardamos el último estado del dispositivo recibido para consultas internas.
let ultimoEstadoRecibido = null;

// --- Constantes y Conexión ---
const BROKER = process.env.MQTT_BROKER || "mqtt://192.168.1.31";
const DATA_TOPIC = "anemometro/datos";
const TIME_TOPIC = "anemometro/time";
const CONFIG_TOPIC = "anemometro/config";
const CONTROL_TOPIC = "anemometro/control";
const client = mqtt.connect(BROKER);

function setBroadcastCallback(callback) {
  broadcast = callback;
}

// --- Funciones de Publicación ---
function publishTime() {
  const ts = Math.floor(Date.now() / 1000);
  client.publish(TIME_TOPIC, JSON.stringify({ unixtime: ts }), { retain: true });
}

async function publishConfig() {
  try {
    const rows = await new Promise((resolve, reject) => db.all("SELECT key, value FROM config", (err, r) => err ? reject(err) : resolve(r)));
    const config = {};
    rows.forEach(row => {
      const numValue = Number(row.value);
      config[row.key] = isNaN(numValue) ? row.value : numValue;
    });
    client.publish(CONFIG_TOPIC, JSON.stringify(config), { retain: true });
    console.log(`[MQTT] Configuración publicada: ${JSON.stringify(config)}`);
    return true;
  } catch (e) {
    console.error("❌ Error publicando configuración MQTT:", e.message);
    return false;
  }
}

function publishControlCommand(command, options = {}) {
  if (!client.connected) {
    console.error("❌ MQTT no conectado. No se puede enviar el comando.");
    return false;
  }
  const payload = JSON.stringify(command);
  client.publish(CONTROL_TOPIC, payload, { qos: 1, ...options });
  console.log(`[MQTT] Comando de control publicado: ${payload} con opciones ${JSON.stringify(options)}`);
  return true;
}

// --- NUEVAS FUNCIONES DE ESTADO ---
function isMqttConnected() {
    return client.connected;
}

async function getUltimoEstado() {
    return ultimoEstadoRecibido;
}

// --- Inicialización y Manejador de Mensajes ---
function initMqttClient() {
  client.on("connect", () => {
    console.log(`✅ MQTT conectado → ${BROKER}`);
    client.subscribe(DATA_TOPIC);
    publishTime();
    publishConfig();
    setInterval(publishTime, 60_000);
  });

  client.on("message", (topic, payload) => {
    if (topic === DATA_TOPIC) {
      try {
        const pkt = JSON.parse(payload.toString());
        const nowMs = Date.now();
        
        // === 1. PROCESAR DATOS DE VIENTO ===
        if (pkt.data && Array.isArray(pkt.data.spd)) {
          // ... (tu lógica existente, sin cambios)
          const { data: d, sys: s = {} } = pkt;
          const { spd: spdArr, dir: dirArr } = d;
          const intervalS = Number(s.read_interval_s) || Number(s.interval_s) || 5;
          const batchLen = spdArr.length;
          
          if (Array.isArray(dirArr) && batchLen === dirArr.length && batchLen > 0) {
            const stmt = db.prepare(`INSERT INTO raw_data (timestamp, velocidad, direccion, bateria_pct, volt_mV, bateria_anemo_pct, rssi_dBm, mode, interval_s) VALUES (?,?,?,?,?,?,?,?,?)`);
            for (let i = 0; i < batchLen; i++) {
              const velMs = spdArr[i];
              const dir = dirArr[i];
              if (velMs == null || dir == null) continue;
              
              const tsMs = nowMs - (batchLen - 1 - i) * intervalS * 1000;
              const sampleTimeUTC = new Date(tsMs).toISOString();
              const velKt = +(velMs * 1.94384).toFixed(2);
              
              stmt.run(sampleTimeUTC, velKt, dir, d.bateria_pct, d.volt_mV, d.bateria_anemo_pct, s.rssi_dBm, s.mode, intervalS);
            }
            stmt.finalize();
            console.log(`[DATA] Ingestadas ${batchLen} muestras de viento.`);
          }
        }

        // === 2. PROCESAR LOGS DE SISTEMA Y ACTUALIZAR ESTADO ---
        if (pkt.sys) {
          const { sys: s } = pkt;
          const logTimeUTC = new Date(nowMs).toISOString();

          // ACTUALIZAR ESTADO EN MEMORIA
          ultimoEstadoRecibido = {
              ...s, // Copia todas las propiedades del objeto sys
              timestamp: logTimeUTC // Añade el timestamp de cuando se recibió
          };

          // Guardar en la base de datos
          db.run(
            `INSERT INTO logs (timestamp, uptime_s, heap_free, reset_count, reset_reason, mode, interval_s, ble_ok, ble_fails, mqtt_fails, rssi_dBm) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [ logTimeUTC, s.uptime_s, s.heap_free, s.reset_count, s.reset_reason, s.mode, s.interval_s, s.ble_ok ? 1 : 0, s.ble_fails, s.mqtt_fails, s.rssi_dBm ],
            (err) => {
              if (err) console.error("❌ Error guardando log de sistema:", err.message);
              else console.log(`[LOGS] Log de sistema guardado. Reset Cnt: ${s.reset_count}, Reason: ${s.reset_reason}`);
            }
          );
        }

        // === 3. PROCESAR LOGS DE DISPOSITIVO ===
        if (pkt.logs) {
          const logLines = pkt.logs.split('\n').filter(line => line.length > 0);
          if (broadcast && logLines.length > 0) {
            logLines.forEach(line => broadcast({ type: 'log', message: line }));
          }
        }

        // === 4. RETRANSMITIR PAQUETE COMPLETO POR WEBSOCKET ===
        if (broadcast) {
          broadcast({ type: 'data', payload: pkt });
        }

      } catch (e) {
        console.error("❌ MQTT handler error:", e.message);
      }
    }
  });

  client.on("error", (err) => console.error("❌ MQTT Client Error:", err));
}

// --- EXPORTS ACTUALIZADOS ---
module.exports = { 
    initMqttClient, 
    publishConfig, 
    publishControlCommand, 
    setBroadcastCallback,
    isMqttConnected,  // <-- Exportar nueva función
    getUltimoEstado     // <-- Exportar nueva función
};