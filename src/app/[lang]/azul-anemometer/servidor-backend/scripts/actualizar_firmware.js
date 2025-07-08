// actualizar_firmware.js
// Script para actualizar el firmware de la ESP vía OTA (Over-The-Air) usando MQTT

const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');

// Configuración MQTT
const BROKER = "mqtt://192.168.1.31";
const CONTROL_TOPIC = "anemometro/control";
const OTA_TOPIC = "anemometro/ota";

// Conectar al broker MQTT
const client = mqtt.connect(BROKER);

console.log("🔄 ACTUALIZACIÓN DE FIRMWARE VÍA OTA");
console.log("=".repeat(60));
console.log(`🌐 Broker MQTT: ${BROKER}`);
console.log(`📡 Topic de control: ${CONTROL_TOPIC}`);
console.log(`📡 Topic OTA: ${OTA_TOPIC}`);
console.log(`📅 Inicio: ${new Date().toLocaleString('es-ES')}`);
console.log("=".repeat(60));

client.on('connect', () => {
  console.log("✅ Conectado al broker MQTT");
  iniciarActualizacionFirmware();
});

client.on('message', (topic, payload) => {
  if (topic === OTA_TOPIC) {
    procesarRespuestaOTA(payload);
  } else if (topic === CONTROL_TOPIC) {
    procesarRespuestaControl(payload);
  }
});

// Función para enviar comando de control
async function enviarComandoControl(comando, parametros = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      comando: comando,
      parametros: parametros,
      timestamp: Date.now(),
      source: "actualizar_firmware"
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

// Función para procesar respuesta OTA
function procesarRespuestaOTA(payload) {
  try {
    const data = JSON.parse(payload.toString());
    console.log("📡 Respuesta OTA recibida:");
    console.log("   Estado:", data.estado || 'N/A');
    console.log("   Progreso:", data.progreso || 'N/A');
    console.log("   Mensaje:", data.mensaje || 'N/A');
    
    if (data.estado === 'completado') {
      console.log("✅ Actualización de firmware completada");
      console.log("🔄 La ESP se reiniciará automáticamente");
      
      setTimeout(() => {
        console.log("\n📋 Próximos pasos:");
        console.log("1. Esperar 30-60 segundos para que la ESP se reinicie");
        console.log("2. Ejecutar: node monitor_ble_mqtt.js");
        console.log("3. Verificar que los valores del sistema se inicialicen correctamente");
        console.log("4. Comprobar si el Bluetooth funciona");
        
        client.end();
        process.exit(0);
      }, 3000);
    } else if (data.estado === 'error') {
      console.error("❌ Error en la actualización:", data.mensaje);
      client.end();
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error procesando respuesta OTA:", error.message);
  }
}

// Función para procesar respuesta de control
function procesarRespuestaControl(payload) {
  try {
    const data = JSON.parse(payload.toString());
    console.log("📡 Respuesta de control recibida:", data);
  } catch (error) {
    console.error("❌ Error procesando respuesta de control:", error.message);
  }
}

// Función para iniciar la actualización de firmware
async function iniciarActualizacionFirmware() {
  console.log("🔄 INICIANDO ACTUALIZACIÓN DE FIRMWARE...");
  console.log("");
  
  // Paso 1: Verificar estado actual
  console.log("📋 PASO 1: Verificando estado actual...");
  await enviarComandoControl('estado_detallado');
  await esperar(3000);
  
  // Paso 2: Iniciar modo OTA
  console.log("\n📋 PASO 2: Iniciando modo OTA...");
  console.log("🔧 Configurando la ESP para recibir firmware...");
  await enviarComandoControl('iniciar_ota');
  await esperar(5000);
  
  // Paso 3: Enviar firmware (simulado)
  console.log("\n📋 PASO 3: Preparando envío de firmware...");
  console.log("📦 El firmware se enviará en chunks...");
  
  // Simular envío de firmware
  await enviarFirmwareSimulado();
  
  // Paso 4: Verificar actualización
  console.log("\n📋 PASO 4: Verificando actualización...");
  await enviarComandoControl('verificar_ota');
  await esperar(3000);
}

// Función para enviar firmware simulado
async function enviarFirmwareSimulado() {
  console.log("📦 Enviando firmware (simulado)...");
  
  // Crear un firmware simulado (en la práctica, aquí cargarías el archivo .bin real)
  const firmwareSimulado = {
    version: "2.0.0",
    timestamp: Date.now(),
    size: 1024000, // 1MB simulado
    checksum: "abc123def456",
    chunks: 100
  };
  
  console.log(`   📊 Tamaño: ${firmwareSimulado.size} bytes`);
  console.log(`   📦 Chunks: ${firmwareSimulado.chunks}`);
  console.log(`   🔢 Versión: ${firmwareSimulado.version}`);
  
  // Simular envío de chunks
  for (let i = 1; i <= 10; i++) {
    const chunk = {
      numero: i,
      total: firmwareSimulado.chunks,
      datos: `chunk_${i}_simulado`,
      checksum: `checksum_${i}`
    };
    
    const payload = JSON.stringify({
      tipo: "firmware_chunk",
      chunk: chunk,
      timestamp: Date.now()
    });
    
    client.publish(OTA_TOPIC, payload, { qos: 1 });
    
    console.log(`   📦 Enviando chunk ${i}/${firmwareSimulado.chunks}...`);
    await esperar(500);
  }
  
  // Enviar comando de finalización
  const finalPayload = JSON.stringify({
    tipo: "firmware_completado",
    version: firmwareSimulado.version,
    checksum: firmwareSimulado.checksum,
    timestamp: Date.now()
  });
  
  client.publish(OTA_TOPIC, finalPayload, { qos: 2 });
  console.log("✅ Envío de firmware completado");
}

// Función para esperar
function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para cargar firmware real desde archivo
function cargarFirmwareReal(rutaArchivo) {
  try {
    if (fs.existsSync(rutaArchivo)) {
      const firmware = fs.readFileSync(rutaArchivo);
      console.log(`📦 Firmware cargado: ${rutaArchivo}`);
      console.log(`📊 Tamaño: ${firmware.length} bytes`);
      return firmware;
    } else {
      console.error(`❌ Archivo de firmware no encontrado: ${rutaArchivo}`);
      return null;
    }
  } catch (error) {
    console.error("❌ Error cargando firmware:", error.message);
    return null;
  }
}

// Función para enviar firmware real
async function enviarFirmwareReal(firmware, chunkSize = 1024) {
  const totalChunks = Math.ceil(firmware.length / chunkSize);
  console.log(`📦 Enviando firmware real en ${totalChunks} chunks...`);
  
  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, firmware.length);
    const chunk = firmware.slice(start, end);
    
    const chunkData = {
      numero: i + 1,
      total: totalChunks,
      datos: chunk.toString('base64'),
      checksum: require('crypto').createHash('md5').update(chunk).digest('hex')
    };
    
    const payload = JSON.stringify({
      tipo: "firmware_chunk",
      chunk: chunkData,
      timestamp: Date.now()
    });
    
    client.publish(OTA_TOPIC, payload, { qos: 1 });
    
    console.log(`   📦 Enviando chunk ${i + 1}/${totalChunks}...`);
    await esperar(100);
  }
  
  console.log("✅ Envío de firmware real completado");
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
  console.log("\n🛑 Deteniendo actualización...");
  client.end();
  process.exit(0);
});

// Mostrar ayuda
console.log("\n💡 INSTRUCCIONES:");
console.log("-".repeat(40));
console.log("1. Este script simula la actualización OTA");
console.log("2. Para firmware real, modifica el script");
console.log("3. La ESP debe tener soporte OTA habilitado");
console.log("4. El firmware debe ser compatible con la ESP");
console.log("");
console.log("📋 Para usar firmware real:");
console.log("1. Coloca el archivo .bin en la carpeta");
console.log("2. Modifica la función enviarFirmwareReal()");
console.log("3. Especifica la ruta del archivo .bin"); 