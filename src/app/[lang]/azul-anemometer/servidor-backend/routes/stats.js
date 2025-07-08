const express = require("express");
const { db } = require("../db");
const router  = express.Router();

router.get("/", (req, res) => {
  const mins = Math.max(1, Math.min(+req.query.minutes || 15, 1440)); // 1‑1440
  const wantRaw = req.query.raw === 'true';
  console.log(`[STATS] Requested stats for ${mins} minutes, raw=${wantRaw}`);
  
  const sql  = `
    SELECT
      AVG(velocidad)              AS avg_kt,
      MAX(velocidad)              AS max_kt,
      MIN(CASE WHEN velocidad > 0.1 THEN velocidad ELSE NULL END) AS min_kt,
      (AVG(velocidad*velocidad) -
       AVG(velocidad)*AVG(velocidad)) AS var_kt,
      COUNT(*)                    AS samples,
      COUNT(CASE WHEN velocidad > 0.1 THEN 1 END) AS non_zero_samples,
      -- Promedio vectorial de la dirección
      CAST((DEGREES(ATAN2(SUM(SIN(RADIANS(direccion))), SUM(COS(RADIANS(direccion))))) + 360) AS REAL) % 360 AS avg_dir_deg
    FROM raw_data
    WHERE timestamp >= datetime('now', ?)
      AND velocidad IS NOT NULL
  `;
  
  const params = [`-${mins} minutes`];

  db.get(sql, params, (err, row) => {
    if (err) {
      console.error('[STATS] Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    console.log('[STATS] Raw database result:', row);
    
    const result = {
      window_min: mins,
      avg_kt:  row.avg_kt ? +row.avg_kt.toFixed(2) : null,
      max_kt:  row.max_kt ? +row.max_kt.toFixed(2) : null,
      min_kt:  row.min_kt ? +row.min_kt.toFixed(2) : null,
      gust_factor: (row.avg_kt && row.max_kt) ? +(row.max_kt / row.avg_kt).toFixed(2) : null,
      std_kt: row.var_kt ? +Math.sqrt(row.var_kt).toFixed(2) : null,
      samples: row.samples,
      non_zero_samples: row.non_zero_samples,
      avg_dir_deg: row.avg_dir_deg ? +row.avg_dir_deg.toFixed(2) : null
    };
    
    console.log('[STATS] Processed result:', result);
    if (!wantRaw) {
      return res.json(result);
    }
    // Si se pide raw, traemos los datos crudos usados
    db.all(
      `SELECT id, timestamp, velocidad, direccion FROM raw_data WHERE timestamp >= datetime('now', ?) AND velocidad IS NOT NULL ORDER BY timestamp ASC`,
      params,
      (err2, rows) => {
        if (err2) {
          console.error('[STATS] Error al obtener datos crudos:', err2);
          return res.status(500).json({ error: 'Database error (raw)' });
        }
        result.raw_data = rows;
        res.json(result);
      }
    );
  });
});

module.exports = router;