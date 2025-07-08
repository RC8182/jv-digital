const express = require("express");
const db      = require("../db");
const router  = express.Router();

router.get("/", (_, res) =>
  db.get(
    `SELECT battery_pct, volt_mV, bateria_anemo_pct,
            rssi_dBm, reset_count, timestamp
       FROM logs
      ORDER BY id DESC
      LIMIT 1`,
    (_, row) => res.json(row || {})
  )
);

module.exports = router;