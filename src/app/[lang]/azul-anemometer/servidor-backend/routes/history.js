const express = require('express');
const router = express.Router();
const { getHistory } = require('../db');

// GET /api/anemometro/history?date=YYYY-MM-DD&startHour=HH:mm&endHour=HH:mm&timeframe=1h
router.get('/', async (req, res) => {
  try {
    const { date, startHour = '00:00', endHour = '23:59', timeframe = '1h' } = req.query;
    if (!date) return res.status(400).json({ error: 'date is required' });

    // Construir rango de tiempo
    const start = new Date(`${date}T${startHour}:00`);
    const end = new Date(`${date}T${endHour}:59.999`);

    // Seleccionar colección/tabla según timeframe
    let table = 'raw';
    if (timeframe === '3min') table = '3min';
    else if (timeframe === '15min') table = '15min';
    else if (timeframe === '1h') table = '1h';

    // Consulta a la base de datos
    const data = await getHistory(table, start, end);

    res.json({ data });
  } catch (err) {
    console.error('Error en /api/anemometro/history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;