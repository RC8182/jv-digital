// aggregator.js
/*******************************************************************************
 * aggregator.js – Tarea programada para agregar datos crudos
 * ¡Implementa cálculo vectorial de dirección y ráfaga mínima correcta!
 *******************************************************************************/
const cron = require("node-cron");
const { db } = require("./db");

const aggregate = async (table, minutes) => {
  try {
    console.log(`[CRON] Iniciando agregación para '${table}' (${minutes} min).`);

    // --- LOG DE DIAGNÓSTICO ---
    const lastAggregated = await new Promise((resolve, reject) => {
      db.get(`SELECT MAX(timestamp) AS max_ts FROM ${table}`, (err, row) => err ? reject(err) : resolve(row));
    });
    const lastTs = lastAggregated ? lastAggregated.max_ts : 'N/A';
    console.log(`[DIAGNOSTIC] Último timestamp en '${table}': ${lastTs}`);

    const newRawRange = await new Promise((resolve, reject) => {
      const query = `
        SELECT MIN(timestamp) AS min_ts, MAX(timestamp) AS max_ts, COUNT(*) as count 
        FROM raw_data 
        WHERE strftime('%s', timestamp) > (SELECT IFNULL(MAX(strftime('%s', timestamp)), 0) FROM ${table})
      `;
      db.get(query, (err, row) => err ? reject(err) : resolve(row));
    });

    if (newRawRange && newRawRange.count > 0) {
      console.log(`[DIAGNOSTIC] Rango de nuevos datos crudos a procesar: ${newRawRange.count} muestras desde ${newRawRange.min_ts} hasta ${newRawRange.max_ts}`);
    } else {
      console.log(`[DIAGNOSTIC] No se encontraron nuevos datos crudos para agregar a '${table}'.`);
      return; // No hay nada que hacer
    }
    // --- FIN LOG DE DIAGNÓSTICO ---

    // --- LOG DE DEPURACIÓN DE BLOQUES A AGREGAR ---
    const debugSql = `
      SELECT 
        strftime('%Y-%m-%dT%H:%M:00', (CAST(strftime('%s', timestamp) / (${minutes * 60}) AS INTEGER)) * ${minutes * 60}, 'unixepoch') || 'Z' AS timestamp_group,
        COUNT(*) as count
      FROM raw_data
      WHERE strftime('%s', timestamp) > (SELECT IFNULL(MAX(strftime('%s', timestamp)), 0) FROM ${table})
      GROUP BY timestamp_group
    `;
    db.all(debugSql, (err, rows) => {
      if (!err && rows.length > 0) {
        rows.forEach(r => {
          console.log(`[DEBUG] Se va a agregar bloque ${r.timestamp_group} con ${r.count} muestras`);
        });
      }
    });
    // --- FIN LOG DE DEPURACIÓN DE BLOQUES A AGREGAR ---

    // Nota: SQLite no tiene funciones trigonométricas por defecto.
    // La librería 'sqlite3' en Node.js las añade automáticamente.
    const sql = `
      INSERT OR REPLACE INTO ${table} (timestamp, avg_speed_kt, gust_speed_kt, min_gust_kt, avg_dir_deg, sample_count)
      SELECT
        -- Agrupar por 'cubos' de tiempo fijos (ej. 10:00, 10:03, 10:06)
        strftime('%Y-%m-%dT%H:%M:00', (CAST(strftime('%s', timestamp) / (${minutes * 60}) AS INTEGER)) * ${minutes * 60}, 'unixepoch') || 'Z' AS timestamp_group,
        
        -- Cálculos de velocidad
        AVG(velocidad) AS avg_speed_kt,
        MAX(velocidad) AS gust_speed_kt,
        MIN(CASE WHEN velocidad > 0.1 THEN velocidad ELSE NULL END) AS min_gust_kt, -- Ráfaga mínima > 0.1 kt
        
        -- Promedio vectorial de la dirección
        CAST((DEGREES(ATAN2(SUM(SIN(RADIANS(direccion))), SUM(COS(RADIANS(direccion))))) + 360) AS REAL) % 360 AS avg_dir_deg,
        
        -- Conteo de muestras
        COUNT(id) as sample_count
        
      FROM raw_data
      -- Procesar solo datos más nuevos que el último agregado en esta tabla
      WHERE strftime('%s', timestamp) > (SELECT IFNULL(MAX(strftime('%s', timestamp)), 0) FROM ${table})
      GROUP BY timestamp_group;
    `;

    db.run(sql, function(err) {
      if (err) {
        console.error(`[CRON] ❌ Error en db.run para '${table}':`, err.message);
      } else if (this.changes > 0) {
        console.log(`[CRON] ✅ Agregados ${this.changes} nuevos registros a '${table}'.`);
      } else {
        console.log(`[CRON] ⚠️ La consulta de inserción no afectó a ninguna fila para '${table}'.`);
      }
    });

  } catch (error) {
    console.error(`[CRON] ❌ Error catastrófico en la agregación para '${table}':`, error);
  }
};

// Programar las tareas de agregación
console.log("Scheduler de agregación inicializado.");
cron.schedule("*/3 * * * *", () => aggregate("data_3min", 3));
cron.schedule("*/15 * * * *", () => aggregate("data_15min", 15));
cron.schedule("1 * * * *", () => aggregate("data_hourly", 60)); // A la hora y 1 minuto