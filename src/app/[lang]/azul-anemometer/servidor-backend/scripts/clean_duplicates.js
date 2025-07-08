// clean_duplicates.js
// Script para limpiar duplicados en tablas agregadas del anemómetro

const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, '../anemometro.db');
const db = new sqlite3.Database(DB_PATH);

const tables = ['data_3min', 'data_15min', 'data_hourly'];

function cleanTable(table) {
  return new Promise((resolve, reject) => {
    // Elimina todos los duplicados dejando solo el de mayor id para cada timestamp
    const sql = `
      DELETE FROM ${table}
      WHERE id NOT IN (
        SELECT MAX(id) FROM ${table} GROUP BY timestamp
      )
    `;
    db.run(sql, function(err) {
      if (err) {
        console.error(`❌ Error limpiando ${table}:`, err.message);
        reject(err);
      } else {
        console.log(`✅ Limpiados duplicados en ${table}. Filas afectadas: ${this.changes}`);
        resolve();
      }
    });
  });
}

(async () => {
  for (const table of tables) {
    await cleanTable(table);
  }
  db.close();
  console.log('✅ Limpieza de duplicados completada.');
})(); 