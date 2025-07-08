// control_esp_mqtt.js
// Script para controlar la ESP directamente via MQTT

const mqtt = require('mqtt');

// Configuración MQTT
const BROKER = "mqtt://192.168.1.31";
const CONTROL_TOPIC = "anemometro/control";
const client = mqtt.connect(BROKER);

// Función para enviar comando MQTT
async function enviarComandoMQTT(comando) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      comando: comando,
      timestamp: Date.now(),
      source: "control_script"
    });

    console.log(`🔧 Enviando comando MQTT: ${comando}`);
    console.log(`📡 Topic: ${CONTROL_TOPIC}`);
    console.log(`📦 Payload: ${payload}`);
    
    client.publish(CONTROL_TOPIC, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error(`❌ Error enviando comando ${comando}:`, err.message);
        reject(err);
      } else {
        console.log(`✅ Comando ${comando} enviado correctamente via MQTT`);
        resolve(true);
      }
    });
  });
}

// Función para reiniciar ESP
async function reiniciarESP() {
  try {
    console.log("🔄 Reiniciando ESP via MQTT...");
    await enviarComandoMQTT("reiniciar");
    console.log("⏳ La ESP se reiniciará en unos segundos...");
    console.log("💡 Después del reinicio, ejecuta el diagnóstico para verificar el estado");
  } catch (error) {
    console.error("❌ Error reiniciando ESP:", error.message);
  }
}

// Función para reconectar Bluetooth
async function reconectarBluetooth() {
  try {
    console.log("📱 Reconectando Bluetooth via MQTT...");
    await enviarComandoMQTT("reconectar_ble");
    console.log("⏳ Intentando reconectar con el sensor...");
  } catch (error) {
    console.error("❌ Error reconectando Bluetooth:", error.message);
  }
}

// Función para escanear Bluetooth
async function escanearBluetooth() {
  try {
    console.log("🔍 Escaneando dispositivos Bluetooth via MQTT...");
    await enviarComandoMQTT("escaneo_ble");
    console.log("⏳ Escaneando dispositivos disponibles...");
  } catch (error) {
    console.error("❌ Error escaneando Bluetooth:", error.message);
  }
}

// Función para obtener estado detallado
async function obtenerEstadoDetallado() {
  try {
    console.log("📊 Solicitando estado detallado via MQTT...");
    await enviarComandoMQTT("estado_detallado");
    console.log("⏳ Obteniendo información detallada...");
  } catch (error) {
    console.error("❌ Error obteniendo estado:", error.message);
  }
}

// Función para configurar parámetro
async function configurarParametro(parametro, valor) {
  try {
    console.log(`⚙️ Configurando ${parametro} = ${valor} via MQTT...`);
    await enviarComandoMQTT(`configurar_${parametro}_${valor}`);
    console.log(`🔧 Parámetro configurado: ${parametro} = ${valor}`);
  } catch (error) {
    console.error("❌ Error configurando parámetro:", error.message);
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  const comando = args[0];
  
  console.log("🔧 CONTROL MQTT DE LA ESP DEL ANEMÓMETRO");
  console.log("=".repeat(60));
  console.log(`🌐 Broker MQTT: ${BROKER}`);
  console.log(`📡 Topic: ${CONTROL_TOPIC}`);
  console.log(`📅 Fecha: ${new Date().toLocaleString('es-ES')}`);
  console.log("=".repeat(60));
  
  // Conectar al broker MQTT
  client.on('connect', async () => {
    console.log("✅ Conectado al broker MQTT");
    
    try {
      switch (comando) {
        case 'reiniciar':
          await reiniciarESP();
          break;
          
        case 'reconectar':
          await reconectarBluetooth();
          break;
          
        case 'escaneo':
          await escanearBluetooth();
          break;
          
        case 'estado':
          await obtenerEstadoDetallado();
          break;
          
        case 'configurar':
          const parametro = args[1];
          const valor = args[2];
          if (!parametro || valor === undefined) {
            console.error("❌ Uso: node control_esp_mqtt.js configurar <parametro> <valor>");
            process.exit(1);
          }
          await configurarParametro(parametro, valor);
          break;
          
        case 'ayuda':
        case 'help':
        case '--help':
        case '-h':
          mostrarAyuda();
          break;
          
        default:
          console.log("❌ Comando no reconocido. Usa 'ayuda' para ver opciones disponibles.");
          mostrarAyuda();
          break;
      }
      
      // Desconectar después de enviar el comando
      setTimeout(() => {
        client.end();
        console.log("🔌 Desconectado del broker MQTT");
      }, 2000);
      
    } catch (error) {
      console.error("❌ Error ejecutando comando:", error.message);
      client.end();
    }
  });
  
  client.on('error', (error) => {
    console.error("❌ Error de conexión MQTT:", error.message);
    process.exit(1);
  });
  
  client.on('close', () => {
    console.log("🔌 Conexión MQTT cerrada");
  });
}

function mostrarAyuda() {
  console.log("🔧 CONTROL MQTT DE LA ESP");
  console.log("=".repeat(50));
  console.log("Uso:");
  console.log("  node control_esp_mqtt.js <comando> [opciones]");
  console.log("");
  console.log("Comandos:");
  console.log("  reiniciar           - Reiniciar la ESP completamente");
  console.log("  reconectar          - Forzar reconexión Bluetooth");
  console.log("  escaneo             - Escanear dispositivos Bluetooth");
  console.log("  estado              - Obtener estado detallado");
  console.log("  configurar p v      - Configurar parámetro p = valor v");
  console.log("  ayuda               - Mostrar esta ayuda");
  console.log("");
  console.log("Ejemplos:");
  console.log("  node control_esp_mqtt.js reiniciar");
  console.log("  node control_esp_mqtt.js reconectar");
  console.log("  node control_esp_mqtt.js configurar intervalo_s 10");
  console.log("=".repeat(50));
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(error => {
    console.error("❌ Error fatal:", error.message);
    process.exit(1);
  });
}

module.exports = {
  reiniciarESP,
  reconectarBluetooth,
  escanearBluetooth,
  obtenerEstadoDetallado,
  configurarParametro
}; 