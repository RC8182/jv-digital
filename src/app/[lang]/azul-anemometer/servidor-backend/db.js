// db.js
/************************************************************
 * db.js – Inicializa la base de datos SQLite y las tablas.
 * (ACTUALIZADO para el nuevo formato de logs y agregados)
 ************************************************************/

const path = require("path");
const fs   = require("fs");
const sqlite3 = require("sqlite3").verbose();

const DB_PATH = path.join(__dirname, "anemometro.db");
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("❌ Error al abrir la base de datos:", err.message);
    process.exit(1);
  }
  console.log(`✅ Conectado a SQLite en ${DB_PATH}`);
});

db.serialize(() => {
  // 1) Tabla para datos crudos (raw_data) - SIN CAMBIOS
  db.run(
    `CREATE TABLE IF NOT EXISTS raw_data (
      id                   INTEGER PRIMARY KEY AUTOINCREMENT,
      velocidad            REAL    NOT NULL,
      direccion            REAL    NOT NULL,
      bateria_pct          INTEGER,
      volt_mV              INTEGER,
      bateria_anemo_pct    INTEGER,
      rssi_dBm             INTEGER,
      mode                 TEXT,
      interval_s           INTEGER,
      timestamp            TEXT    NOT NULL
    )`
  );

  // 2) Tabla para logs de sistema (logs) - ¡MODIFICADA!
  // Adaptada al nuevo payload del firmware.
  db.run(
    `CREATE TABLE IF NOT EXISTS logs (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp          TEXT    NOT NULL,
      uptime_s           INTEGER,
      heap_free          INTEGER,
      reset_count        INTEGER,
      reset_reason       TEXT,
      mode               TEXT,
      interval_s         INTEGER,
      ble_ok             INTEGER, -- booleano (0 o 1)
      ble_fails          INTEGER,
      mqtt_fails         INTEGER,
      rssi_dBm           INTEGER
    )`
  );

  // 3, 4, 5) Tablas para agregados - ¡MODIFICADAS!
  // Nombres de columna mejorados para claridad.
  ['data_3min', 'data_15min', 'data_hourly'].forEach(table => {
    db.run(
      `CREATE TABLE IF NOT EXISTS ${table} (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp       TEXT NOT NULL UNIQUE,
        avg_speed_kt    REAL NOT NULL,
        gust_speed_kt   REAL NOT NULL,
        min_gust_kt     REAL, -- Puede ser NULL si solo hay calma
        avg_dir_deg     REAL NOT NULL,
        sample_count    INTEGER NOT NULL
      )`
    );
  });
  
  // 6) Tabla para la configuración (config) - SIN CAMBIOS
  db.run(
    `CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
    )`
  );

  console.log("✅ Todas las tablas han sido verificadas/creadas.");
});

// Devuelve los datos filtrados por tabla y rango de fechas
function getHistory(table, start, end) {
  // Mapear los nombres de timeframe a las tablas reales
  const tableMap = {
    raw: 'raw_data',
    '3min': 'data_3min',
    '15min': 'data_15min',
    '1h': 'data_hourly'
  };
  const realTable = tableMap[table] || 'raw_data';

  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM ${realTable} WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp ASC`,
      [start.toISOString(), end.toISOString()],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}

module.exports = {
  db,
  getHistory
};