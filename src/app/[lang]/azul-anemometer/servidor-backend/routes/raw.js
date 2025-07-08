const express = require("express");
const { db } = require("../db");
const router  = express.Router();

router.get("/", (_req, res) => {
  db.all(
    `SELECT
       id, velocidad, direccion,
       bateria_pct, volt_mV, bateria_anemo_pct,
       rssi_dBm, mode, interval_s, timestamp
     FROM raw_data
     ORDER BY timestamp DESC
     LIMIT 200`,
    (_e, rows) => res.json(rows)
  );
});

// ✅ GET /api/anemometro/raw/filtrar?desde=ISO&hasta=ISO
router.get("/filtrar", (req, res) => {
  const { desde, hasta } = req.query;

  if (!desde || !hasta) {
    return res.status(400).json({
      error: "Parámetros requeridos: desde y hasta (en formato ISO8601)",
    });
  }

  db.all(
    `SELECT * FROM raw_data 
     WHERE timestamp >= ? AND timestamp < ?
     ORDER BY timestamp ASC`,
    [desde, hasta],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;