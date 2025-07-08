// reinicializar_firmware.js
// Script para reinicializar el firmware actual de la ESP

const mqtt = require('mqtt');

// Configuración MQTT
const BROKER = "mqtt://192.168.1.31";
const CONTROL_TOPIC = "anemometro/control";
const DATA_TOPIC = "anemometro/datos";

// Conectar al broker MQTT
const client = mqtt.connect(BROKER);

console.log("🔄 REINICIALIZACIÓN DE FIRMWARE");
console.log("=".repeat(50));
console.log(`🌐 Broker MQTT: ${BROKER}`);
console.log(`📅 Inicio: ${new Date().toLocaleString('es-ES')}`);
console.log("=".repeat(50));

let mensajesRecibidos = 0;
let valoresInicializados = 0;

client.on('connect', () => {
  console.log("✅ Conectado al broker MQTT");
  
  // Suscribirse al topic de datos para monitorear
  client.subscribe(DATA_TOPIC, (err) => {
    if (err) {
      console.error("❌ Error suscribiéndose:", err.message);
    } else {
      console.log("✅ Suscrito al topic de datos");
      iniciarReinicializacion();
    }
  });
});

client.on('message', (topic, payload) => {
  if (topic === DATA_TOPIC) {
    procesarMensaje(payload);
  }
});

// Función para enviar comando de control
async function enviarComandoControl(comando, parametros = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      comando: comando,
      parametros: parametros,
      timestamp: Date.now(),
      source: "reinicializar_firmware"
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

// Función para procesar mensajes
function procesarMensaje(payload) {
  try {
    const data = JSON.parse(payload.toString());
    mensajesRecibidos++;
    
    const sys = data.sys || {};
    const uptime = sys.uptime_s;
    const resetCount = sys.reset_count;
    const bleOk = sys.ble_ok;
    const rssi = sys.rssi_dBm;
    
    // Contar valores inicializados
    let valoresValidos = 0;
    if (uptime !== null && uptime !== undefined) valoresValidos++;
    if (resetCount !== null && resetCount !== undefined) valoresValidos++;
    if (bleOk !== null && bleOk !== undefined) valoresValidos++;
    if (rssi !== null && rssi !== undefined) valoresValidos++;
    
    valoresInicializados += valoresValidos;
    
    const timestamp = new Date().toLocaleString('es-ES');
    console.log(`📊 Msg #${mensajesRecibidos} - ${timestamp}`);
    console.log(`   ⏱️  Uptime: ${uptime !== null ? `${Math.floor(uptime/60)}min` : 'NULL'}`);
    console.log(`   🔢 Reset Count: ${resetCount !== null ? resetCount : 'NULL'}`);
    console.log(`   📱 BLE: ${bleOk === 1 ? '✅ Conectado' : bleOk === 0 ? '❌ Desconectado' : '❓ NULL'}`);
    console.log(`   📶 RSSI: ${rssi !== null ? `${rssi}dBm` : 'NULL'}`);
    console.log(`   📊 Valores válidos: ${valoresValidos}/4`);
    console.log("");
    
    // Si recibimos suficientes mensajes, hacer análisis
    if (mensajesRecibidos >= 10) {
      setTimeout(() => {
        generarAnalisisReinicializacion();
      }, 2000);
    }
    
  } catch (error) {
    console.error("❌ Error procesando mensaje:", error.message);
  }
}

// Función para iniciar la reinicialización
async function iniciarReinicializacion() {
  console.log("🔄 INICIANDO REINICIALIZACIÓN DE FIRMWARE...");
  console.log("");
  
  // Paso 1: Reinicio completo
  console.log("📋 PASO 1: Reinicio completo de la ESP...");
  await enviarComandoControl('reiniciar');
  await esperar(10000);
  
  // Paso 2: Reinicializar configuración
  console.log("\n📋 PASO 2: Reinicializando configuración...");
  await enviarComandoControl('reinicializar_config');
  await esperar(5000);
  
  // Paso 3: Reinicializar BLE
  console.log("\n📋 PASO 3: Reinicializando Bluetooth...");
  await enviarComandoControl('reinicializar_ble');
  await esperar(5000);
  
  // Paso 4: Verificar inicialización
  console.log("\n📋 PASO 4: Verificando inicialización...");
  await enviarComandoControl('verificar_inicializacion');
  await esperar(5000);
  
  // Paso 5: Forzar reconexión BLE
  console.log("\n📋 PASO 5: Forzando reconexión BLE...");
  await enviarComandoControl('reconectar_ble');
  await esperar(5000);
  
  console.log("\n⏳ Monitoreando resultados...");
  console.log("📊 Esperando mensajes para analizar la reinicialización...");
}

// Función para generar análisis de reinicialización
function generarAnalisisReinicializacion() {
  console.log("\n" + "=".repeat(50));
  console.log("📊 ANÁLISIS DE REINICIALIZACIÓN");
  console.log("=".repeat(50));
  
  const promedioValoresValidos = valoresInicializados / mensajesRecibidos;
  const porcentajeInicializacion = (promedioValoresValidos / 4) * 100;
  
  console.log("\n📊 ESTADÍSTICAS:");
  console.log(`   📡 Mensajes recibidos: ${mensajesRecibidos}`);
  console.log(`   ✅ Total valores válidos: ${valoresInicializados}`);
  console.log(`   📊 Promedio valores válidos: ${promedioValoresValidos.toFixed(1)}/4`);
  console.log(`   📈 Porcentaje de inicialización: ${porcentajeInicializacion.toFixed(1)}%`);
  
  console.log("\n🔍 DIAGNÓSTICO:");
  console.log("-".repeat(40));
  
  if (porcentajeInicializacion >= 75) {
    console.log("✅ REINICIALIZACIÓN EXITOSA");
    console.log("   - La mayoría de valores se inicializaron correctamente");
    console.log("   - El firmware está funcionando correctamente");
    console.log("   - El problema puede estar resuelto");
  } else if (porcentajeInicializacion >= 50) {
    console.log("⚠️  REINICIALIZACIÓN PARCIAL");
    console.log("   - Algunos valores se inicializaron");
    console.log("   - Puede haber problemas menores");
    console.log("   - El firmware funciona pero con limitaciones");
  } else {
    console.log("❌ REINICIALIZACIÓN FALLIDA");
    console.log("   - La mayoría de valores siguen en NULL");
    console.log("   - El firmware no se inicializa correctamente");
    console.log("   - Se requiere reflashear el firmware");
  }
  
  // Recomendaciones
  console.log("\n💡 RECOMENDACIONES:");
  console.log("-".repeat(40));
  
  if (porcentajeInicializacion >= 75) {
    console.log("✅ CONTINUAR MONITOREO:");
    console.log("1. Ejecutar: node monitor_ble_mqtt.js");
    console.log("2. Verificar si el Bluetooth conecta");
    console.log("3. Comprobar datos de viento");
    console.log("4. Si todo funciona, el problema está resuelto");
  } else if (porcentajeInicializacion >= 50) {
    console.log("⚠️  VERIFICAR CONFIGURACIÓN:");
    console.log("1. Revisar configuración del firmware");
    console.log("2. Verificar parámetros de inicialización");
    console.log("3. Comprobar memoria disponible");
    console.log("4. Considerar reflashear si persiste");
  } else {
    console.log("❌ REFLASHEAR FIRMWARE:");
    console.log("1. Descargar firmware limpio");
    console.log("2. Reflashear completamente la ESP");
    console.log("3. Verificar que el firmware sea correcto");
    console.log("4. Comprobar compatibilidad de hardware");
  }
  
  console.log("\n📋 PRÓXIMOS PASOS:");
  console.log("-".repeat(40));
  console.log("1. Continuar monitoreando: node monitor_ble_mqtt.js");
  console.log("2. Verificar si el anemómetro se conecta");
  console.log("3. Documentar cualquier mejora");
  console.log("4. Si no mejora, considerar reflashear");
  
  console.log("\n" + "=".repeat(50));
  console.log("🔄 REINICIALIZACIÓN COMPLETADA");
  console.log("=".repeat(50));
  
  // Cerrar conexión
  client.end();
  process.exit(0);
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
  console.log("\n🛑 Deteniendo reinicialización...");
  client.end();
  process.exit(0);
}); 