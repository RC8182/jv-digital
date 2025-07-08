/************************************************************
 * routes/hourly.js – GET /api/anemometro/hourly
 ************************************************************/
const express = require("express");
const { db } = require("../db");

const router = express.Router();

router.get("/", (_, res) =>
  db.all(
    `SELECT * 
       FROM data_hourly
       ORDER BY timestamp DESC
       LIMIT 200`,
    (_, rows) => res.json(rows)
  )
);

module.exports = router;