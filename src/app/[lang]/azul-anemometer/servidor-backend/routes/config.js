// routes/config.js
/************************************************************
 * routes/config.js – API para gestionar la configuración del ESP32
 ************************************************************/

const express = require("express");
const db = require("../db"); // Ruta relativa a db.js
const mqttHandler = require("../mqttHandler"); // Ruta relativa a mqttHandler.js

const router = express.Router();

// Endpoint para obtener la configuración actual
router.get("/", async (req, res) => {
  try {
    const configRows = await new Promise((resolve, reject) => {
      db.all("SELECT key, value FROM config", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const config = {};
    configRows.forEach((row) => {
      // Intentar parsear a número si es posible
      const numValue = Number(row.value);
      config[row.key] = isNaN(numValue) ? row.value : numValue;
    });

    res.json(config);
  } catch (error) {
    console.error("Error retrieving config:", error.message);
    res.status(500).json({ error: "Failed to retrieve configuration" });
  }
});

// Endpoint para actualizar la configuración
router.post("/", async (req, res) => {
  const newConfig = req.body;
  if (Object.keys(newConfig).length === 0) {
    return res.status(400).json({ error: "No configuration provided." });
  }

  // Define los campos permitidos y sus tipos esperados para validación
  // Estos deben coincidir con lo que el ESP32 espera
  const allowedConfigKeys = {
    wakeTime: "string", // "HH:MM"
    sleepTime: "string", // "HH:MM"
    readDayMs: "number",
    readNightMs: "number",
    sendDayMs: "number",
    sendNightMs: "number",
    mqttKeepAliveS: "number",
  };

  const dbPromises = [];

  try {
    for (const key in newConfig) {
      if (Object.prototype.hasOwnProperty.call(newConfig, key)) {
        if (allowedConfigKeys[key] === undefined) {
          console.warn(`[CONFIG API] Key '${key}' is not a recognized configuration parameter.`);
          continue; // Ignorar claves no reconocidas
        }

        const value = newConfig[key];
        // Validar tipo y formato
        if (typeof value !== allowedConfigKeys[key]) {
          return res.status(400).json({ error: `Invalid type for '${key}'. Expected ${allowedConfigKeys[key]}, got ${typeof value}.` });
        }
        if (allowedConfigKeys[key] === "string" && !/^\d{2}:\d{2}$/.test(value)) {
          return res.status(400).json({ error: `Invalid format for '${key}'. Expected HH:MM.` });
        }
        if (allowedConfigKeys[key] === "number" && (value < 0 || !Number.isInteger(value))) {
            return res.status(400).json({ error: `Invalid value for '${key}'. Expected a positive integer.` });
        }

        dbPromises.push(new Promise((resolve, reject) => {
          db.run(
            "INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)",
            [key, String(value)], // Almacenar todo como TEXTO en la DB
            function (err) {
              if (err) reject(err);
              else resolve();
            }
          );
        }));
      }
    }

    await Promise.all(dbPromises); // Esperar a que todas las escrituras en la DB se completen

    // Publicar la nueva configuración vía MQTT
    const published = await mqttHandler.publishConfig();

    if (published) {
      res
        .status(200)
        .json({ message: "Configuration updated and published successfully." });
    } else {
      res.status(500).json({
        error: "Configuration updated in DB, but failed to publish via MQTT.",
      });
    }
  } catch (error) {
    console.error("Error updating config:", error.message);
    res.status(500).json({ error: "Failed to update configuration" });
  }
});

module.exports = router;