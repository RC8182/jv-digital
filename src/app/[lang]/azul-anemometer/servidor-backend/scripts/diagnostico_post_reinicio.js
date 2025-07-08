// diagnostico_post_reinicio.js
// Diagnóstico después del reinicio - valores null en el sistema

const mqtt = require('mqtt');

// Configuración MQTT
const BROKER = "mqtt://192.168.1.31";
const DATA_TOPIC = "anemometro/datos";
const CONTROL_TOPIC = "anemometro/control";

// Variables de diagnóstico
let diagnostico = {
  mensajes_recibidos: 0,
  valores_null: 0,
  valores_validos: 0,
  ble_ok: null,
  uptime_detectado: false,
  reset_count_detectado: false,
  ultimo_mensaje: null
};

// Conectar al broker MQTT
const client = mqtt.connect(BROKER);

console.log("🔍 DIAGNÓSTICO POST-REINICIO - VALORES NULL");
console.log("=".repeat(60));
console.log(`🌐 Broker MQTT: ${BROKER}`);
console.log(`📅 Inicio: ${new Date().toLocaleString('es-ES')}`);
console.log("=".repeat(60));

client.on('connect', () => {
  console.log("✅ Conectado al broker MQTT");
  console.log("📡 Suscribiéndose al topic de datos...");
  
  client.subscribe(DATA_TOPIC, (err) => {
    if (err) {
      console.error("❌ Error suscribiéndose:", err.message);
    } else {
      console.log("✅ Suscrito al topic de datos");
      console.log("🔍 Monitoreando mensajes post-reinicio...");
      console.log("=".repeat(60));
    }
  });
});

client.on('message', (topic, payload) => {
  if (topic === DATA_TOPIC) {
    procesarMensajePostReinicio(payload);
  }
});

// Función para enviar comando de control
async function enviarComandoControl(comando, parametros = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      comando: comando,
      parametros: parametros,
      timestamp: Date.now(),
      source: "diagnostico_post_reinicio"
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

// Función para procesar mensajes post-reinicio
function procesarMensajePostReinicio(payload) {
  try {
    const data = JSON.parse(payload.toString());
    diagnostico.mensajes_recibidos++;
    diagnostico.ultimo_mensaje = data;
    
    // Extraer información del sistema
    const sys = data.sys || {};
    const uptime = sys.uptime_s;
    const resetCount = sys.reset_count;
    const resetReason = sys.reset_reason;
    const bleOk = sys.ble_ok;
    const bleFails = sys.ble_fails;
    const mqttFails = sys.mqtt_fails;
    const rssi = sys.rssi_dBm;
    const heapFree = sys.heap_free;
    const mode = sys.mode;
    const interval = sys.interval_s;
    
    // Contar valores null vs válidos
    const valores = [uptime, resetCount, resetReason, bleOk, bleFails, mqttFails, rssi, heapFree, mode, interval];
    const nullCount = valores.filter(v => v === null).length;
    const validCount = valores.filter(v => v !== null).length;
    
    diagnostico.valores_null += nullCount;
    diagnostico.valores_validos += validCount;
    
    // Verificar valores específicos
    if (uptime !== null) diagnostico.uptime_detectado = true;
    if (resetCount !== null) diagnostico.reset_count_detectado = true;
    if (bleOk !== null) diagnostico.ble_ok = bleOk;
    
    // Mostrar información del mensaje
    const timestamp = new Date().toLocaleString('es-ES');
    console.log(`📊 Mensaje #${diagnostico.mensajes_recibidos} - ${timestamp}`);
    console.log(`   📱 BLE: ${bleOk === 1 ? '✅ Conectado' : bleOk === 0 ? '❌ Desconectado' : '❓ NULL'}`);
    console.log(`   ⏱️  Uptime: ${uptime !== null ? `${Math.floor(uptime/60)}min` : 'NULL'}`);
    console.log(`   🔢 Reset Count: ${resetCount !== null ? resetCount : 'NULL'}`);
    console.log(`   📝 Reset Reason: ${resetReason !== null ? resetReason : 'NULL'}`);
    console.log(`   ❌ BLE Fails: ${bleFails !== null ? bleFails : 'NULL'}`);
    console.log(`   🌐 MQTT Fails: ${mqttFails !== null ? mqttFails : 'NULL'}`);
    console.log(`   📶 RSSI: ${rssi !== null ? `${rssi}dBm` : 'NULL'}`);
    console.log(`   💾 Heap Free: ${heapFree !== null ? `${heapFree} bytes` : 'NULL'}`);
    console.log(`   🔧 Mode: ${mode !== null ? mode : 'NULL'}`);
    console.log(`   ⏰ Interval: ${interval !== null ? `${interval}s` : 'NULL'}`);
    console.log(`   📊 Valores NULL: ${nullCount}/10, Válidos: ${validCount}/10`);
    console.log("");
    
    // Si recibimos suficientes mensajes, hacer análisis
    if (diagnostico.mensajes_recibidos >= 5) {
      setTimeout(() => {
        generarAnalisisPostReinicio();
      }, 2000);
    }
    
  } catch (error) {
    console.error("❌ Error procesando mensaje:", error.message);
    console.error("📦 Payload:", payload.toString());
  }
}

// Función para generar análisis post-reinicio
function generarAnalisisPostReinicio() {
  console.log("\n" + "=".repeat(60));
  console.log("🔍 ANÁLISIS POST-REINICIO");
  console.log("=".repeat(60));
  
  console.log("\n📊 ESTADÍSTICAS:");
  console.log(`   📡 Mensajes recibidos: ${diagnostico.mensajes_recibidos}`);
  console.log(`   ❌ Total valores NULL: ${diagnostico.valores_null}`);
  console.log(`   ✅ Total valores válidos: ${diagnostico.valores_validos}`);
  console.log(`   📊 Porcentaje NULL: ${((diagnostico.valores_null / (diagnostico.valores_null + diagnostico.valores_validos)) * 100).toFixed(1)}%`);
  
  console.log("\n🔍 DIAGNÓSTICO:");
  console.log("-".repeat(40));
  
  if (diagnostico.valores_null > diagnostico.valores_validos) {
    console.log("❌ PROBLEMA CRÍTICO: Firmware no inicializa correctamente");
    console.log("   - La mayoría de valores del sistema están en NULL");
    console.log("   - El firmware no está configurando las variables del sistema");
    console.log("   - Posibles causas:");
    console.log("     • Firmware corrupto o incompleto");
    console.log("     • Problema en la inicialización del sistema");
    console.log("     • Configuración incorrecta");
    console.log("     • Memoria insuficiente o corrupta");
  } else if (diagnostico.uptime_detectado && diagnostico.reset_count_detectado) {
    console.log("✅ Firmware inicializa correctamente");
    console.log("   - Los valores del sistema se están configurando");
    console.log("   - El problema puede ser temporal");
  } else {
    console.log("⚠️  PROBLEMA PARCIAL: Algunos valores no se inicializan");
    console.log("   - Algunos valores del sistema están en NULL");
    console.log("   - Puede ser un problema de configuración específica");
  }
  
  // Análisis específico del Bluetooth
  console.log("\n📱 ANÁLISIS DEL BLUETOOTH:");
  console.log("-".repeat(40));
  
  if (diagnostico.ble_ok === null) {
    console.log("❌ BLE no inicializado");
    console.log("   - El sistema BLE no se está configurando");
    console.log("   - Posible problema en la inicialización BLE");
  } else if (diagnostico.ble_ok === 0) {
    console.log("❌ BLE inicializado pero desconectado");
    console.log("   - El sistema BLE funciona pero no hay conexión");
    console.log("   - El problema está en el anemómetro, no en la ESP");
  } else if (diagnostico.ble_ok === 1) {
    console.log("✅ BLE conectado y funcionando");
    console.log("   - El sistema BLE está funcionando correctamente");
  }
  
  // Recomendaciones
  console.log("\n💡 RECOMENDACIONES:");
  console.log("-".repeat(40));
  
  if (diagnostico.valores_null > diagnostico.valores_validos) {
    console.log("🔧 SOLUCIONAR PROBLEMA DE FIRMWARE:");
    console.log("1. Reflashear firmware limpio");
    console.log("2. Verificar que el firmware sea el correcto");
    console.log("3. Comprobar configuración de inicialización");
    console.log("4. Verificar memoria disponible");
    console.log("5. Revisar logs de compilación del firmware");
  } else if (diagnostico.ble_ok === 0) {
    console.log("🔍 VERIFICAR ANEMÓMETRO:");
    console.log("1. Comprobar si el anemómetro está encendido");
    console.log("2. Verificar batería del anemómetro");
    console.log("3. Acercar el anemómetro a la ESP");
    console.log("4. Reiniciar el anemómetro");
  } else {
    console.log("✅ TODO FUNCIONA CORRECTAMENTE");
    console.log("1. Continuar monitoreando");
    console.log("2. Verificar datos de viento");
  }
  
  console.log("\n📋 PRÓXIMOS PASOS:");
  console.log("-".repeat(40));
  console.log("1. Si hay muchos valores NULL → Reflashear firmware");
  console.log("2. Si BLE está desconectado → Verificar anemómetro");
  console.log("3. Continuar monitoreando: node monitor_ble_mqtt.js");
  
  console.log("\n" + "=".repeat(60));
  console.log("🔍 ANÁLISIS COMPLETADO");
  console.log("=".repeat(60));
  
  // Cerrar conexión
  client.end();
  process.exit(0);
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
  console.log("\n🛑 Deteniendo diagnóstico...");
  client.end();
  process.exit(0);
}); 