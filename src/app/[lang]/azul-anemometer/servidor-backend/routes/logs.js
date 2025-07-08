// routes/logs.js (NUEVO ARCHIVO)
/*******************************************************************************
 * routes/logs.js – GET /api/anemometro/logs
 * Expone los logs de sistema del dispositivo
 *******************************************************************************/
const express = require("express");
const db = require("../db");
const router = express.Router();

// GET /api/anemometro/logs - Obtener los últimos 50 logs
router.get("/", (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  
  db.all(
    `SELECT timestamp, reset_reason, mode, ble_ok, ble_fails, mqtt_fails, rssi_dBm, reset_count, uptime_s, heap_free 
     FROM logs 
     ORDER BY timestamp DESC 
     LIMIT ?`,
    [limit],
    (err, rows) => {
      if (err) {
        console.error("❌ Error obteniendo logs históricos:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      res.json(rows);
    }
  );
});

module.exports = router;