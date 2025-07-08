// forzar_reinicio.js
// Script para forzar el reinicio de la ESP vía MQTT

const mqtt = require('mqtt');

// Configuración MQTT
const BROKER = "mqtt://192.168.1.31";
const CONTROL_TOPIC = "anemometro/control";

// Conectar al broker MQTT
const client = mqtt.connect(BROKER);

console.log("🔄 FORZANDO REINICIO DE LA ESP");
console.log("=".repeat(50));
console.log(`🌐 Broker MQTT: ${BROKER}`);
console.log(`📡 Topic de control: ${CONTROL_TOPIC}`);
console.log(`📅 Inicio: ${new Date().toLocaleString('es-ES')}`);
console.log("=".repeat(50));

client.on('connect', () => {
  console.log("✅ Conectado al broker MQTT");
  forzarReinicio();
});

// Función para enviar comando de reinicio
async function forzarReinicio() {
  console.log("🔄 Enviando comando de reinicio...");
  
  const payload = JSON.stringify({
    comando: "reiniciar",
    timestamp: Date.now(),
    source: "forzar_reinicio_script",
    prioridad: "alta"
  });

  try {
    client.publish(CONTROL_TOPIC, payload, { qos: 2 }, (err) => {
      if (err) {
        console.error("❌ Error enviando comando de reinicio:", err.message);
      } else {
        console.log("✅ Comando de reinicio enviado con QoS 2");
        console.log("📦 Payload enviado:", payload);
        
        // Esperar un poco y verificar si se reinició
        setTimeout(() => {
          console.log("\n⏳ Esperando reinicio...");
          console.log("📊 La ESP debería reiniciarse en los próximos 10-30 segundos");
          console.log("🔍 Monitorea los logs de la ESP para confirmar el reinicio");
          
          // Cerrar conexión después de 5 segundos
          setTimeout(() => {
            console.log("\n✅ Proceso completado");
            console.log("📋 Próximos pasos:");
            console.log("1. Verificar en los logs de la ESP que se reinició");
            console.log("2. Esperar 30-60 segundos para que se reconecte");
            console.log("3. Ejecutar: node monitor_ble_mqtt.js");
            console.log("4. Verificar si el Bluetooth funciona después del reinicio");
            
            client.end();
            process.exit(0);
          }, 5000);
        }, 2000);
      }
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    client.end();
    process.exit(1);
  }
}

// Manejo de errores
client.on('error', (error) => {
  console.error("❌ Error de conexión MQTT:", error.message);
});

client.on('close', () => {
  console.log("🔌 Conexión MQTT cerrada");
});

// Manejo de señales
process.on('SIGINT', () => {
  console.log("\n🛑 Deteniendo proceso...");
  client.end();
  process.exit(0);
}); 