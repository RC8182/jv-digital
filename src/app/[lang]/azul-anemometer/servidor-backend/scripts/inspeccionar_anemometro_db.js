const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Cambia la ruta si tu base de datos está en otro lugar
const dbPath = path.join(__dirname, '../anemometro.db');
const db = new sqlite3.Database(dbPath);

console.log('Mostrando los 10 registros más recientes de raw_data:');
db.all(
  `SELECT id, timestamp, velocidad, direccion FROM raw_data ORDER BY timestamp DESC LIMIT 10`,
  (err, rows) => {
    if (err) {
      console.error('Error al consultar los datos:', err);
      process.exit(1);
    }
    rows.forEach(row => {
      console.log(row);
    });
    contarPorVentana();
  }
);

function contarPorVentana() {
  const ventanas = [10, 20, 30];
  let pendientes = ventanas.length;
  ventanas.forEach(min => {
    db.get(
      `SELECT COUNT(*) as cuenta FROM raw_data WHERE timestamp >= datetime('now', ?)` ,
      [`-${min} minutes`],
      (err, row) => {
        if (err) {
          console.error(`Error al contar para ${min} minutos:`, err);
        } else {
          console.log(`Registros en los últimos ${min} minutos: ${row.cuenta}`);
        }
        if (--pendientes === 0) {
          db.close();
        }
      }
    );
  });
} 