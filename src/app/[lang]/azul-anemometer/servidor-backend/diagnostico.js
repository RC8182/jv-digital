// diagnostico.js
/**********************************************************************************
 * diagnostico.js – Script de diagnóstico para el anemómetro
 * Monitorea el estado del dispositivo y detecta problemas
 **********************************************************************************/

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const mqttHandler = require("./mqttHandler");
const { broadcast } = require("./server"); // <-- RUTA CORREGIDA

async function diagnosticarDispositivo() {
    const resultados = {
        timestamp: new Date().toISOString(),
        database: { status: 'pending', details: '' },
        mqtt: { status: 'pending', details: '' },
        device: { status: 'pending', details: '' }
    };

    broadcast({ type: 'diag_start', message: 'Iniciando diagnóstico...' });

    // 1. Diagnóstico de la Base de Datos
    try {
        const db = await open({
            filename: process.env.DB_FILE || "./anemometro.db",
            driver: sqlite3.Database
        });
        await db.get("SELECT 1");
        resultados.database.status = 'ok';
        resultados.database.details = 'Conexión exitosa.';
        await db.close();
        broadcast({ type: 'diag_update', payload: { component: 'database', ...resultados.database } });
    } catch (error) {
        resultados.database.status = 'error';
        resultados.database.details = `Fallo en la conexión: ${error.message}`;
        broadcast({ type: 'diag_update', payload: { component: 'database', ...resultados.database } });
    }

    // 2. Diagnóstico de MQTT
    try {
        if (mqttHandler.isMqttConnected()) {
            resultados.mqtt.status = 'ok';
            resultados.mqtt.details = 'Cliente MQTT conectado.';
        } else {
            resultados.mqtt.status = 'warning';
            resultados.mqtt.details = 'Cliente MQTT no conectado. Intentando reconectar...';
            // Opcional: intentar reconectar aquí si es necesario
        }
        broadcast({ type: 'diag_update', payload: { component: 'mqtt', ...resultados.mqtt } });
    } catch (error) {
        resultados.mqtt.status = 'error';
        resultados.mqtt.details = `Error en el cliente MQTT: ${error.message}`;
        broadcast({ type: 'diag_update', payload: { component: 'mqtt', ...resultados.mqtt } });
    }

    // 3. Diagnóstico del Dispositivo (Estado General)
    try {
        const ultimoEstado = await mqttHandler.getUltimoEstado();
        if (ultimoEstado) {
            const ahora = new Date();
            const ultimoRegistro = new Date(ultimoEstado.timestamp);
            const diferenciaMin = (ahora - ultimoRegistro) / (1000 * 60);

            if (diferenciaMin > 30) { // Umbral de 30 minutos
                resultados.device.status = 'warning';
                resultados.device.details = `No se ha recibido estado del dispositivo en ${Math.round(diferenciaMin)} minutos.`;
            } else {
                resultados.device.status = 'ok';
                resultados.device.details = 'El dispositivo está reportando estado activamente.';
            }
        } else {
            resultados.device.status = 'warning';
            resultados.device.details = 'Aún no se ha recibido ningún estado del dispositivo.';
        }
        broadcast({ type: 'diag_update', payload: { component: 'device', ...resultados.device } });
    } catch (error) {
        resultados.device.status = 'error';
        resultados.device.details = `Error al verificar estado del dispositivo: ${error.message}`;
        broadcast({ type: 'diag_update', payload: { component: 'device', ...resultados.device } });
    }

    const estadoFinal = (
        resultados.database.status === 'ok' &&
        resultados.mqtt.status === 'ok' &&
        resultados.device.status === 'ok'
    ) ? 'ok' : 'warning';

    console.log('Resultados del diagnóstico:', JSON.stringify(resultados, null, 2));
    broadcast({ type: 'diag_end', status: estadoFinal, payload: resultados });
    
    return resultados;
}

// Ejecutar diagnóstico si se llama directamente
if (require.main === module) {
  diagnosticarDispositivo().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error("❌ Error fatal:", err);
    process.exit(1);
  });
}

module.exports = { diagnosticarDispositivo }; 