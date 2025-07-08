/**********************************************************************************
 * control.js – Ruta API para controlar la ESP del anemómetro
 **********************************************************************************/

const express = require("express");
const router = express.Router();
const { publishControlCommand } = require('../mqttHandler');

// Configuración MQTT
const BROKER = process.env.MQTT_BROKER || "mqtt://192.168.1.31";
const CONTROL_TOPIC = "anemometro/control";

// POST /api/anemometro/control/ - Enviar comando
router.post('/', (req, res) => {
  const { comando, parametros } = req.body;

  if (!comando) {
    return res.status(400).json({ error: 'El campo "comando" es obligatorio.' });
  }

  const commandPayload = {
    comando,
    parametros: parametros || {}, // Asegurar que parámetros sea un objeto
    timestamp: Date.now(),
    source: 'web_panel',
  };

  const success = publishControlCommand(commandPayload, { retain: true });

  if (success) {
    res.status(200).json({ message: `Comando '${comando}' planificado con éxito.` });
  } else {
    res.status(500).json({ error: 'No se pudo planificar el comando a través de MQTT.' });
  }
});

// GET /api/anemometro/control/comandos - Listar comandos disponibles
router.get("/comandos", (req, res) => {
  const comandos = [
    {
      comando: "reiniciar",
      descripcion: "Reiniciar la ESP completamente",
      endpoint: "POST /api/anemometro/control/"
    },
    {
      comando: "reconectar_ble",
      descripcion: "Forzar reconexión del sensor Bluetooth",
      endpoint: "POST /api/anemometro/control/"
    },
    {
      comando: "escaneo_ble",
      descripcion: "Escanear dispositivos Bluetooth disponibles",
      endpoint: "POST /api/anemometro/control/"
    },
    {
      comando: "estado_detallado",
      descripcion: "Obtener estado detallado de la ESP",
      endpoint: "POST /api/anemometro/control/"
    },
    {
      comando: "configurar_[parametro]_[valor]",
      descripcion: "Configurar parámetros específicos",
      endpoint: "POST /api/anemometro/control/",
      body: { parametro: "string", valor: "any" }
    }
  ];
  
  res.json({
    comandos,
    broker: BROKER,
    topic: CONTROL_TOPIC
  });
});

module.exports = router; 