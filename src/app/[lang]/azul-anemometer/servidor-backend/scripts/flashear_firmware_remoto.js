// flashear_firmware_remoto.js
// Script para flashear el firmware de la ESP remotamente vía MQTT con OTA

const mqtt = require('mqtt');
const fs = require('fs');
const crypto = require('crypto');

// Configuración MQTT
const BROKER = "mqtt://192.168.1.31";
const CONTROL_TOPIC = "anemometro/control";
const OTA_TOPIC = "anemometro/ota";
const FLASH_TOPIC = "anemometro/flash";

// Conectar al broker MQTT
const client = mqtt.connect(BROKER);

console.log("💾 FLASHEO REMOTO DE FIRMWARE ESP");
console.log("=".repeat(60));
console.log(`🌐 Broker MQTT: ${BROKER}`);
console.log(`📅 Inicio: ${new Date().toLocaleString('es-ES')}`);
console.log("=".repeat(60));

let estadoFlasheo = {
  iniciado: false,
  progreso: 0,
  chunksEnviados: 0,
  totalChunks: 0,
  errores: 0,
  completado: false
};

client.on('connect', () => {
  console.log("✅ Conectado al broker MQTT");
  
  // Suscribirse a topics de respuesta
  client.subscribe(OTA_TOPIC, (err) => {
    if (err) console.error("❌ Error suscribiéndose a OTA:", err.message);
    else console.log("✅ Suscrito a topic OTA");
  });
  
  client.subscribe(FLASH_TOPIC, (err) => {
    if (err) console.error("❌ Error suscribiéndose a FLASH:", err.message);
    else console.log("✅ Suscrito a topic FLASH");
  });
  
  iniciarFlasheoRemoto();
});

client.on('message', (topic, payload) => {
  if (topic === OTA_TOPIC) {
    procesarRespuestaOTA(payload);
  } else if (topic === FLASH_TOPIC) {
    procesarRespuestaFlash(payload);
  }
});

// Función para enviar comando de control
async function enviarComandoControl(comando, parametros = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      comando: comando,
      parametros: parametros,
      timestamp: Date.now(),
      source: "flashear_firmware_remoto"
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
    console.log("📡 Respuesta OTA:", data);
    
    if (data.estado === 'listo') {
      console.log("✅ ESP lista para recibir firmware");
      enviarFirmware();
    } else if (data.estado === 'progreso') {
      estadoFlasheo.progreso = data.progreso || 0;
      console.log(`📊 Progreso: ${estadoFlasheo.progreso}%`);
    } else if (data.estado === 'completado') {
      console.log("✅ Flasheo completado");
      estadoFlasheo.completado = true;
      finalizarFlasheo();
    } else if (data.estado === 'error') {
      console.error("❌ Error en flasheo:", data.mensaje);
      estadoFlasheo.errores++;
    }
  } catch (error) {
    console.error("❌ Error procesando respuesta OTA:", error.message);
  }
}

// Función para procesar respuesta Flash
function procesarRespuestaFlash(payload) {
  try {
    const data = JSON.parse(payload.toString());
    console.log("📡 Respuesta Flash:", data);
  } catch (error) {
    console.error("❌ Error procesando respuesta Flash:", error.message);
  }
}

// Función para iniciar flasheo remoto
async function iniciarFlasheoRemoto() {
  console.log("💾 INICIANDO FLASHEO REMOTO...");
  console.log("");
  
  // Paso 1: Verificar si la ESP soporta OTA
  console.log("📋 PASO 1: Verificando soporte OTA...");
  await enviarComandoControl('verificar_ota');
  await esperar(3000);
  
  // Paso 2: Iniciar modo OTA
  console.log("\n📋 PASO 2: Iniciando modo OTA...");
  await enviarComandoControl('iniciar_ota');
  await esperar(5000);
  
  // Paso 3: Preparar firmware
  console.log("\n📋 PASO 3: Preparando firmware...");
  await prepararFirmware();
  
  // Paso 4: Enviar firmware
  console.log("\n📋 PASO 4: Enviando firmware...");
  await enviarFirmware();
}

// Función para preparar firmware
async function prepararFirmware() {
  console.log("📦 Preparando firmware para envío...");
  
  // Intentar cargar firmware real si existe
  const firmwareReal = cargarFirmwareReal();
  
  if (firmwareReal) {
    console.log("✅ Firmware real cargado");
    estadoFlasheo.totalChunks = Math.ceil(firmwareReal.length / 1024);
    console.log(`📊 Tamaño: ${firmwareReal.length} bytes`);
    console.log(`📦 Chunks: ${estadoFlasheo.totalChunks}`);
    return firmwareReal;
  } else {
    console.log("⚠️  Usando firmware simulado");
    return crearFirmwareSimulado();
  }
}

// Función para cargar firmware real
function cargarFirmwareReal() {
  const posiblesRutas = [
    './firmware/anemometro.bin',
    './firmware/esp32_anemometro.bin',
    './anemometro_firmware.bin',
    './esp32_firmware.bin'
  ];
  
  for (const ruta of posiblesRutas) {
    if (fs.existsSync(ruta)) {
      try {
        const firmware = fs.readFileSync(ruta);
        console.log(`📦 Firmware encontrado: ${ruta}`);
        return firmware;
      } catch (error) {
        console.error(`❌ Error leyendo ${ruta}:`, error.message);
      }
    }
  }
  
  return null;
}

// Función para crear firmware simulado
function crearFirmwareSimulado() {
  console.log("🔧 Creando firmware simulado...");
  
  // Crear un firmware simulado de 1MB
  const firmwareSimulado = Buffer.alloc(1024 * 1024, 0xFF);
  
  // Agregar header simulado
  const header = {
    version: "2.0.0",
    timestamp: Date.now(),
    checksum: crypto.createHash('md5').update(firmwareSimulado).digest('hex'),
    size: firmwareSimulado.length
  };
  
  console.log(`📦 Firmware simulado creado: ${firmwareSimulado.length} bytes`);
  console.log(`🔢 Versión: ${header.version}`);
  console.log(`🔐 Checksum: ${header.checksum}`);
  
  return firmwareSimulado;
}

// Función para enviar firmware
async function enviarFirmware() {
  const firmware = await prepararFirmware();
  const chunkSize = 1024;
  const totalChunks = Math.ceil(firmware.length / chunkSize);
  
  console.log(`📦 Enviando firmware en ${totalChunks} chunks...`);
  
  // Enviar chunks
  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, firmware.length);
    const chunk = firmware.slice(start, end);
    
    const chunkData = {
      numero: i + 1,
      total: totalChunks,
      datos: chunk.toString('base64'),
      checksum: crypto.createHash('md5').update(chunk).digest('hex'),
      timestamp: Date.now()
    };
    
    const payload = JSON.stringify({
      tipo: "firmware_chunk",
      chunk: chunkData
    });
    
    try {
      client.publish(OTA_TOPIC, payload, { qos: 1 });
      estadoFlasheo.chunksEnviados++;
      
      const progreso = Math.round((estadoFlasheo.chunksEnviados / totalChunks) * 100);
      console.log(`📦 Chunk ${i + 1}/${totalChunks} enviado (${progreso}%)`);
      
      // Esperar un poco entre chunks
      await esperar(100);
      
    } catch (error) {
      console.error(`❌ Error enviando chunk ${i + 1}:`, error.message);
      estadoFlasheo.errores++;
    }
  }
  
  // Enviar comando de finalización
  const finalPayload = JSON.stringify({
    tipo: "firmware_completado",
    total_chunks: totalChunks,
    checksum_final: crypto.createHash('md5').update(firmware).digest('hex'),
    timestamp: Date.now()
  });
  
  client.publish(OTA_TOPIC, finalPayload, { qos: 2 });
  console.log("✅ Envío de firmware completado");
  
  // Esperar confirmación
  setTimeout(() => {
    if (!estadoFlasheo.completado) {
      console.log("⏳ Esperando confirmación de flasheo...");
    }
  }, 5000);
}

// Función para finalizar flasheo
function finalizarFlasheo() {
  console.log("\n" + "=".repeat(60));
  console.log("💾 FLASHEO REMOTO COMPLETADO");
  console.log("=".repeat(60));
  
  console.log("\n📊 ESTADÍSTICAS:");
  console.log(`   📦 Chunks enviados: ${estadoFlasheo.chunksEnviados}`);
  console.log(`   📊 Total chunks: ${estadoFlasheo.totalChunks}`);
  console.log(`   ❌ Errores: ${estadoFlasheo.errores}`);
  console.log(`   ✅ Completado: ${estadoFlasheo.completado ? 'SÍ' : 'NO'}`);
  
  if (estadoFlasheo.completado) {
    console.log("\n✅ FLASHEO EXITOSO");
    console.log("🔄 La ESP se reiniciará automáticamente");
    console.log("⏳ Espera 30-60 segundos para que se reinicie");
    
    setTimeout(() => {
      console.log("\n📋 PRÓXIMOS PASOS:");
      console.log("1. Ejecutar: node monitor_ble_mqtt.js");
      console.log("2. Verificar que los valores del sistema se inicialicen");
      console.log("3. Comprobar si el Bluetooth funciona");
      console.log("4. Verificar conexión con el anemómetro");
      
      client.end();
      process.exit(0);
    }, 10000);
  } else {
    console.log("\n❌ FLASHEO FALLIDO");
    console.log("💡 Posibles causas:");
    console.log("   • La ESP no tiene soporte OTA");
    console.log("   • Firmware incompatible");
    console.log("   • Problema de conectividad");
    console.log("   • Memoria insuficiente");
    
    client.end();
    process.exit(1);
  }
}

// Función para esperar
function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  console.log("\n🛑 Deteniendo flasheo...");
  client.end();
  process.exit(0);
});

// Mostrar instrucciones
console.log("\n💡 INSTRUCCIONES:");
console.log("-".repeat(40));
console.log("1. Este script intenta flashear la ESP remotamente");
console.log("2. La ESP debe tener soporte OTA habilitado");
console.log("3. Si no funciona, necesitarás flashear físicamente");
console.log("");
console.log("📋 Para usar firmware real:");
console.log("1. Coloca el archivo .bin en la carpeta");
console.log("2. Nombra el archivo como: anemometro.bin");
console.log("3. El script lo detectará automáticamente"); 