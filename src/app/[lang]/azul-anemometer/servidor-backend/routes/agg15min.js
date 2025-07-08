/************************************************************
 * routes/agg15min.js – GET /api/anemometro/15min
 ************************************************************/
const express = require("express");
const { db } = require("../db");

const router = express.Router();

router.get("/", (_, res) =>
  db.all(
    `SELECT * 
       FROM data_15min
       ORDER BY timestamp DESC
       LIMIT 200`,
    (_, rows) => res.json(rows)
  )
);

module.exports = router;