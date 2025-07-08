// server.js
/************************************************************
 * server.js – arranque de la API del anemómetro
 ************************************************************/
require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const path    = require("path");
const http    = require("http");
const { WebSocketServer } = require("ws");
const WebSocket = require('ws');

// --- CREACIÓN DE SERVIDORES Y APP ---
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// --- LÓGICA DE WEBSOCKETS Y EXPORTACIÓN ---
// Esta función se usará para enviar alertas al frontend
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}
// ¡IMPORTANTE! Se exporta aquí para romper la dependencia circular
module.exports = { broadcast };

// Pasar la función de broadcast al mqttHandler para evitar dependencias circulares
const mqttHandler = require('./mqttHandler');
mqttHandler.setBroadcastCallback(broadcast);

wss.on('connection', ws => {
  console.log('Cliente WebSocket conectado');
});

// --- MIDDLEWARES DE EXPRESS ---
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// --- IMPORTACIONES (Después de la exportación para evitar el bucle) ---
require("./db");
require("./aggregator");
const { diagnosticarDispositivo } = require("./diagnostico");
const AnemometroMonitor = require("./monitor");
const rawRouter = require("./routes/raw");
const agg3Router = require("./routes/agg3min");
const agg15Router = require("./routes/agg15min");
const hourlyRouter = require("./routes/hourly");
const statsRouter = require("./routes/stats");
const stateRouter = require("./routes/state");
const timeRouter = require("./routes/time");
const configRouter = require("./routes/config");
const diagnosticoRouter = require("./routes/diagnostico");
const controlRouter = require("./routes/control");
const logsRouter = require("./routes/logs");
const historyRouter = require("./routes/history");

// --- RUTAS DE LA API ---
app.use("/api/anemometro/raw",    rawRouter);
app.use("/api/anemometro/3min",   agg3Router);
app.use("/api/anemometro/15min",  agg15Router);
app.use("/api/anemometro/hourly", hourlyRouter);
app.use("/api/anemometro/stats",  statsRouter);
app.use("/api/anemometro/state",  stateRouter);
app.use("/api/anemometro/time",   timeRouter);
app.use("/api/anemometro/config", configRouter);
app.use("/api/anemometro/diagnostico", diagnosticoRouter);
app.use("/api/anemometro/control", controlRouter);
app.use("/api/anemometro/logs", logsRouter);
app.use("/api/anemometro/history", historyRouter);

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
  try {
    server.listen(PORT, () => {
      console.log(`✅ API operativa → http://localhost:${PORT}`);
      console.log(`✅ Interfaz gráfica disponible en http://localhost:${PORT}`);
      console.log(`✅ Servidor de Alertas (WebSocket) iniciado en el puerto ${PORT}`);
      
      mqttHandler.initMqttClient();
      
      setTimeout(async () => {
        console.log("\n🔍 Ejecutando diagnóstico inicial del sistema...");
        try {
          await diagnosticarDispositivo();
        } catch (error) {
          console.error("❌ Error en diagnóstico inicial:", error.message);
        }
      }, 5000);
      
      setTimeout(async () => {
        console.log("\n🚀 Iniciando monitoreo automático...");
        try {
          const monitor = new AnemometroMonitor();
          await monitor.iniciarMonitoreo();
          console.log("✅ Monitoreo automático iniciado correctamente");
        } catch (error) {
          console.error("❌ Error iniciando monitoreo:", error.message);
        }
      }, 10000);
    });
  } catch (error) {
    console.error("❌ Error fatal iniciando servidor:", error);
    process.exit(1);
  }
}

iniciarServidor();