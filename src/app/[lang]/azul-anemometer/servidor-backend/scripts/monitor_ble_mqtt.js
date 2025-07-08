// monitor_ble_mqtt.js
// Script para monitorear el estado del Bluetooth de la ESP en tiempo real vía MQTT

const mqtt = require('mqtt');

// Configuración MQTT
const BROKER = "mqtt://192.168.1.31";
const DATA_TOPIC = "anemometro/datos";
const CONTROL_TOPIC = "anemometro/control";

// Variables de estado
let ultimoEstadoBLE = null;
let ultimoTimestamp = null;
let contadorMensajes = 0;
let contadorBLEConectado = 0;
let contadorBLEDesconectado = 0;

// Conectar al broker MQTT
const client = mqtt.connect(BROKER);

console.log("📱 MONITOREO BLE DE LA ESP EN TIEMPO REAL");
console.log("=".repeat(60));
console.log(`🌐 Broker MQTT: ${BROKER}`);
console.log(`📡 Topic de datos: ${DATA_TOPIC}`);
console.log(`📡 Topic de control: ${CONTROL_TOPIC}`);
console.log(`📅 Inicio: ${new Date().toLocaleString('es-ES')}`);
console.log("=".repeat(60));
console.log("⏳ Conectando al broker MQTT...");

client.on('connect', () => {
  console.log("✅ Conectado al broker MQTT");
  console.log("📡 Suscribiéndose al topic de datos...");
  
  // Suscribirse al topic de datos
  client.subscribe(DATA_TOPIC, (err) => {
    if (err) {
      console.error("❌ Error suscribiéndose:", err.message);
    } else {
      console.log("✅ Suscrito al topic de datos");
      console.log("🔍 Monitoreando estado del Bluetooth...");
      console.log("=".repeat(60));
    }
  });
});

client.on('message', (topic, payload) => {
  if (topic === DATA_TOPIC) {
    try {
      const data = JSON.parse(payload.toString());
      contadorMensajes++;
      
      // Extraer información del sistema
      const sys = data.sys || {};
      const bleOk = sys.ble_ok;
      const timestamp = data.ts || Date.now() / 1000;
      const uptime = sys.uptime_s;
      const resetCount = sys.reset_count;
      const resetReason = sys.reset_reason;
      const bleFails = sys.ble_fails;
      const mqttFails = sys.mqtt_fails;
      const rssi = sys.rssi_dBm;
      
      // Convertir timestamp a fecha legible
      const fecha = new Date(timestamp * 1000).toLocaleString('es-ES');
      
      // Verificar si el estado BLE cambió
      const estadoCambio = ultimoEstadoBLE !== null && ultimoEstadoBLE !== bleOk;
      
      // Actualizar contadores
      if (bleOk === 1) {
        contadorBLEConectado++;
      } else if (bleOk === 0) {
        contadorBLEDesconectado++;
      }
      
      // Mostrar información
      console.log(`📊 Mensaje #${contadorMensajes} - ${fecha}`);
      console.log(`   📱 BLE: ${bleOk === 1 ? '✅ Conectado' : '❌ Desconectado'}`);
      
      if (estadoCambio) {
        console.log(`   🔄 CAMBIO DE ESTADO DETECTADO!`);
        console.log(`      BLE cambió de ${ultimoEstadoBLE === 1 ? 'Conectado' : 'Desconectado'} a ${bleOk === 1 ? 'Conectado' : 'Desconectado'}`);
      }
      
      // Información adicional del sistema
      if (uptime !== undefined) {
        console.log(`   ⏱️  Uptime: ${Math.floor(uptime/60)}min`);
      }
      
      if (resetCount !== undefined) {
        console.log(`   🔢 Reset Count: ${resetCount}`);
      }
      
      if (resetReason !== undefined) {
        console.log(`   📝 Reset Reason: ${resetReason}`);
      }
      
      if (bleFails !== undefined) {
        console.log(`   ❌ BLE Fails: ${bleFails}`);
      }
      
      if (mqttFails !== undefined) {
        console.log(`   🌐 MQTT Fails: ${mqttFails}`);
      }
      
      if (rssi !== undefined) {
        console.log(`   📶 RSSI: ${rssi}dBm`);
      }
      
      // Información de datos si están disponibles
      if (data.data) {
        const datos = data.data;
        if (datos.spd && datos.spd.length > 0) {
          console.log(`   💨 Datos de viento: ${datos.spd.length} muestras`);
          console.log(`      Velocidad: ${datos.spd[datos.spd.length - 1]} m/s`);
          if (datos.dir && datos.dir.length > 0) {
            console.log(`      Dirección: ${datos.dir[datos.dir.length - 1]}°`);
          }
        } else {
          console.log(`   💨 Sin datos de viento`);
        }
        
        if (datos.bateria_pct !== undefined) {
          console.log(`   🔋 Batería ESP: ${datos.bateria_pct}%`);
        }
        
        if (datos.bateria_anemo_pct !== undefined) {
          console.log(`   🔋 Batería Anemómetro: ${datos.bateria_anemo_pct}%`);
        }
      }
      
      console.log("");
      
      // Actualizar estado anterior
      ultimoEstadoBLE = bleOk;
      ultimoTimestamp = timestamp;
      
    } catch (error) {
      console.error("❌ Error parseando mensaje MQTT:", error.message);
      console.error("📦 Payload:", payload.toString());
    }
  }
});

client.on('error', (error) => {
  console.error("❌ Error de conexión MQTT:", error.message);
});

client.on('close', () => {
  console.log("🔌 Conexión MQTT cerrada");
});

client.on('reconnect', () => {
  console.log("🔄 Reconectando al broker MQTT...");
});

// Función para enviar comando de control
async function enviarComandoControl(comando) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      comando: comando,
      timestamp: Date.now(),
      source: "monitor_script"
    });

    console.log(`🔧 Enviando comando: ${comando}`);
    
    client.publish(CONTROL_TOPIC, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error(`❌ Error enviando comando: ${err.message}`);
        reject(err);
      } else {
        console.log(`✅ Comando enviado: ${comando}`);
        resolve(true);
      }
    });
  });
}

// Manejo de señales para cerrar limpiamente
process.on('SIGINT', async () => {
  console.log("\n🛑 Deteniendo monitoreo...");
  
  // Mostrar estadísticas finales
  console.log("\n📊 ESTADÍSTICAS FINALES:");
  console.log("-".repeat(50));
  console.log(`📱 Total mensajes recibidos: ${contadorMensajes}`);
  console.log(`✅ BLE Conectado: ${contadorBLEConectado} veces`);
  console.log(`❌ BLE Desconectado: ${contadorBLEDesconectado} veces`);
  
  if (contadorMensajes > 0) {
    const porcentajeConectado = ((contadorBLEConectado / contadorMensajes) * 100).toFixed(1);
    const porcentajeDesconectado = ((contadorBLEDesconectado / contadorMensajes) * 100).toFixed(1);
    console.log(`📈 Porcentaje conectado: ${porcentajeConectado}%`);
    console.log(`📉 Porcentaje desconectado: ${porcentajeDesconectado}%`);
  }
  
  if (ultimoEstadoBLE !== null) {
    console.log(`📱 Estado final BLE: ${ultimoEstadoBLE === 1 ? 'Conectado' : 'Desconectado'}`);
  }
  
  client.end();
  process.exit(0);
});

// Función para mostrar ayuda
function mostrarAyuda() {
  console.log("📱 MONITOREO BLE VÍA MQTT");
  console.log("=".repeat(50));
  console.log("Este script monitorea el estado del Bluetooth de la ESP");
  console.log("en tiempo real a través de MQTT.");
  console.log("");
  console.log("Comandos disponibles (escribir en la consola):");
  console.log("  reiniciar    - Enviar comando de reinicio a la ESP");
  console.log("  reconectar   - Enviar comando de reconexión BLE");
  console.log("  escaneo      - Enviar comando de escaneo BLE");
  console.log("  estado       - Enviar comando de estado detallado");
  console.log("  ayuda        - Mostrar esta ayuda");
  console.log("  salir        - Salir del programa");
  console.log("");
  console.log("Presiona Ctrl+C para salir");
  console.log("=".repeat(50));
}

// Manejo de entrada de comandos
process.stdin.setEncoding('utf8');
process.stdin.on('data', async (data) => {
  const comando = data.trim().toLowerCase();
  
  switch (comando) {
    case 'reiniciar':
      try {
        await enviarComandoControl('reiniciar');
      } catch (error) {
        console.error("❌ Error enviando comando de reinicio");
      }
      break;
      
    case 'reconectar':
      try {
        await enviarComandoControl('reconectar_ble');
      } catch (error) {
        console.error("❌ Error enviando comando de reconexión");
      }
      break;
      
    case 'escaneo':
      try {
        await enviarComandoControl('escaneo_ble');
      } catch (error) {
        console.error("❌ Error enviando comando de escaneo");
      }
      break;
      
    case 'estado':
      try {
        await enviarComandoControl('estado_detallado');
      } catch (error) {
        console.error("❌ Error enviando comando de estado");
      }
      break;
      
    case 'ayuda':
      mostrarAyuda();
      break;
      
    case 'salir':
      process.emit('SIGINT');
      break;
      
    default:
      if (comando) {
        console.log(`❌ Comando no reconocido: ${comando}`);
        console.log("Escribe 'ayuda' para ver comandos disponibles");
      }
      break;
  }
});

// Mostrar ayuda inicial
setTimeout(() => {
  mostrarAyuda();
}, 2000); 