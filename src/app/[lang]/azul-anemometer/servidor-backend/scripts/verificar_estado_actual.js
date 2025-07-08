// verificar_estado_actual.js
// Verificar el estado actual de la ESP después del intento de flasheo remoto

const mqtt = require('mqtt');

// Configuración MQTT
const BROKER = "mqtt://192.168.1.31";
const DATA_TOPIC = "anemometro/datos";
const CONTROL_TOPIC = "anemometro/control";

// Variables de verificación
let verificacion = {
  mensajesRecibidos: 0,
  valoresNull: 0,
  valoresValidos: 0,
  bleOk: null,
  uptime: null,
  resetCount: null,
  rssi: null,
  inicio: Date.now()
};

// Conectar al broker MQTT
const client = mqtt.connect(BROKER);

console.log("🔍 VERIFICACIÓN DE ESTADO ACTUAL");
console.log("=".repeat(50));
console.log(`🌐 Broker MQTT: ${BROKER}`);
console.log(`📅 Inicio: ${new Date().toLocaleString('es-ES')}`);
console.log("=".repeat(50));

client.on('connect', () => {
  console.log("✅ Conectado al broker MQTT");
  
  client.subscribe(DATA_TOPIC, (err) => {
    if (err) {
      console.error("❌ Error suscribiéndose:", err.message);
    } else {
      console.log("✅ Suscrito al topic de datos");
      console.log("🔍 Verificando estado actual...");
      console.log("=".repeat(50));
    }
  });
});

client.on('message', (topic, payload) => {
  if (topic === DATA_TOPIC) {
    procesarMensajeVerificacion(payload);
  }
});

// Función para enviar comando de control
async function enviarComandoControl(comando, parametros = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      comando: comando,
      parametros: parametros,
      timestamp: Date.now(),
      source: "verificar_estado_actual"
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

// Función para procesar mensajes de verificación
function procesarMensajeVerificacion(payload) {
  try {
    const data = JSON.parse(payload.toString());
    verificacion.mensajesRecibidos++;
    
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
    const nullCount = valores.filter(v => v === null || v === undefined).length;
    const validCount = valores.filter(v => v !== null && v !== undefined).length;
    
    verificacion.valoresNull += nullCount;
    verificacion.valoresValidos += validCount;
    
    // Guardar valores importantes
    if (bleOk !== null && bleOk !== undefined) verificacion.bleOk = bleOk;
    if (uptime !== null && uptime !== undefined) verificacion.uptime = uptime;
    if (resetCount !== null && resetCount !== undefined) verificacion.resetCount = resetCount;
    if (rssi !== null && rssi !== undefined) verificacion.rssi = rssi;
    
    // Mostrar información del mensaje
    const timestamp = new Date().toLocaleString('es-ES');
    const tiempoTranscurrido = Math.floor((Date.now() - verificacion.inicio) / 1000);
    
    console.log(`📊 Msg #${verificacion.mensajesRecibidos} - ${timestamp} (${tiempoTranscurrido}s)`);
    console.log(`   ⏱️  Uptime: ${uptime !== null ? `${Math.floor(uptime/60)}min` : 'NULL'}`);
    console.log(`   🔢 Reset Count: ${resetCount !== null ? resetCount : 'NULL'}`);
    console.log(`   📝 Reset Reason: ${resetReason !== null ? resetReason : 'NULL'}`);
    console.log(`   📱 BLE: ${bleOk === 1 ? '✅ Conectado' : bleOk === 0 ? '❌ Desconectado' : '❓ NULL'}`);
    console.log(`   ❌ BLE Fails: ${bleFails !== null ? bleFails : 'NULL'}`);
    console.log(`   🌐 MQTT Fails: ${mqttFails !== null ? mqttFails : 'NULL'}`);
    console.log(`   📶 RSSI: ${rssi !== null ? `${rssi}dBm` : 'NULL'}`);
    console.log(`   💾 Heap Free: ${heapFree !== null ? `${heapFree} bytes` : 'NULL'}`);
    console.log(`   🔧 Mode: ${mode !== null ? mode : 'NULL'}`);
    console.log(`   ⏰ Interval: ${interval !== null ? `${interval}s` : 'NULL'}`);
    console.log(`   📊 Valores NULL: ${nullCount}/10, Válidos: ${validCount}/10`);
    console.log("");
    
    // Si recibimos suficientes mensajes, hacer análisis
    if (verificacion.mensajesRecibidos >= 10) {
      setTimeout(() => {
        generarAnalisisEstadoActual();
      }, 2000);
    }
    
  } catch (error) {
    console.error("❌ Error procesando mensaje:", error.message);
  }
}

// Función para generar análisis del estado actual
function generarAnalisisEstadoActual() {
  console.log("\n" + "=".repeat(50));
  console.log("📊 ANÁLISIS DE ESTADO ACTUAL");
  console.log("=".repeat(50));
  
  const promedioValoresValidos = verificacion.valoresValidos / verificacion.mensajesRecibidos;
  const promedioValoresNull = verificacion.valoresNull / verificacion.mensajesRecibidos;
  const porcentajeInicializacion = (promedioValoresValidos / 10) * 100;
  
  console.log("\n📊 ESTADÍSTICAS:");
  console.log(`   📡 Mensajes recibidos: ${verificacion.mensajesRecibidos}`);
  console.log(`   ✅ Total valores válidos: ${verificacion.valoresValidos}`);
  console.log(`   ❌ Total valores NULL: ${verificacion.valoresNull}`);
  console.log(`   📊 Promedio valores válidos: ${promedioValoresValidos.toFixed(1)}/10`);
  console.log(`   📊 Promedio valores NULL: ${promedioValoresNull.toFixed(1)}/10`);
  console.log(`   📈 Porcentaje de inicialización: ${porcentajeInicializacion.toFixed(1)}%`);
  
  console.log("\n🔍 VALORES ACTUALES:");
  console.log(`   ⏱️  Uptime: ${verificacion.uptime !== null ? `${Math.floor(verificacion.uptime/60)}min` : 'NULL'}`);
  console.log(`   🔢 Reset Count: ${verificacion.resetCount !== null ? verificacion.resetCount : 'NULL'}`);
  console.log(`   📱 BLE: ${verificacion.bleOk === 1 ? '✅ Conectado' : verificacion.bleOk === 0 ? '❌ Desconectado' : '❓ NULL'}`);
  console.log(`   📶 RSSI: ${verificacion.rssi !== null ? `${verificacion.rssi}dBm` : 'NULL'}`);
  
  console.log("\n🔬 DIAGNÓSTICO DEL ESTADO ACTUAL:");
  console.log("-".repeat(40));
  
  if (porcentajeInicializacion >= 80) {
    console.log("✅ FIRMWARE FUNCIONANDO CORRECTAMENTE");
    console.log("   - La mayoría de valores se inicializaron");
    console.log("   - El firmware está operativo");
    console.log("   - El flasheo remoto pudo haber funcionado");
    
    if (verificacion.bleOk === 1) {
      console.log("   - El Bluetooth está conectado");
      console.log("   - El anemómetro debería estar funcionando");
    } else if (verificacion.bleOk === 0) {
      console.log("   - El Bluetooth está desconectado");
      console.log("   - El problema está en el anemómetro");
    }
  } else if (porcentajeInicializacion >= 50) {
    console.log("⚠️  FIRMWARE PARCIALMENTE FUNCIONAL");
    console.log("   - Algunos valores se inicializaron");
    console.log("   - El firmware funciona con limitaciones");
    console.log("   - Puede haber problemas de configuración");
  } else {
    console.log("❌ FIRMWARE NO INICIALIZA CORRECTAMENTE");
    console.log("   - La mayoría de valores siguen en NULL");
    console.log("   - El flasheo remoto no funcionó");
    console.log("   - Se requiere flasheo físico");
  }
  
  // Evaluar si el flasheo remoto funcionó
  console.log("\n💾 EVALUACIÓN DEL FLASHEO REMOTO:");
  console.log("-".repeat(40));
  
  if (porcentajeInicializacion >= 80) {
    console.log("✅ FLASHEO REMOTO PROBABLEMENTE EXITOSO");
    console.log("   - Los valores se inicializaron correctamente");
    console.log("   - El firmware está funcionando");
    console.log("   - La ESP responde correctamente");
  } else if (porcentajeInicializacion >= 50) {
    console.log("⚠️  FLASHEO REMOTO PARCIALMENTE EXITOSO");
    console.log("   - Algunos valores se inicializaron");
    console.log("   - El firmware funciona pero con problemas");
    console.log("   - Puede requerir flasheo físico");
  } else {
    console.log("❌ FLASHEO REMOTO FALLIDO");
    console.log("   - Los valores siguen en NULL");
    console.log("   - La ESP no tiene soporte OTA completo");
    console.log("   - Se requiere flasheo físico obligatorio");
  }
  
  // Recomendaciones específicas
  console.log("\n💡 RECOMENDACIONES:");
  console.log("-".repeat(40));
  
  if (porcentajeInicializacion >= 80) {
    console.log("✅ CONTINUAR MONITOREO:");
    console.log("1. Ejecutar: node monitor_ble_mqtt.js");
    console.log("2. Verificar si el anemómetro se conecta");
    console.log("3. Comprobar datos de viento");
    console.log("4. Si todo funciona, el problema está resuelto");
  } else if (porcentajeInicializacion >= 50) {
    console.log("⚠️  VERIFICAR CONFIGURACIÓN:");
    console.log("1. Revisar configuración del firmware");
    console.log("2. Intentar reinicializar configuración");
    console.log("3. Considerar flasheo físico si persiste");
  } else {
    console.log("❌ REFLASHEAR FÍSICAMENTE:");
    console.log("1. Conectar la ESP por USB");
    console.log("2. Usar esptool para flashear");
    console.log("3. Descargar firmware limpio y compatible");
    console.log("4. Verificar que el firmware sea correcto");
  }
  
  console.log("\n📋 PRÓXIMOS PASOS:");
  console.log("-".repeat(40));
  console.log("1. Continuar monitoreando: node monitor_ble_mqtt.js");
  console.log("2. Verificar si el anemómetro se conecta");
  console.log("3. Si no mejora, preparar flasheo físico");
  console.log("4. Documentar cualquier cambio en el comportamiento");
  
  console.log("\n" + "=".repeat(50));
  console.log("🔍 VERIFICACIÓN COMPLETADA");
  console.log("=".repeat(50));
  
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
  console.log("\n🛑 Deteniendo verificación...");
  client.end();
  process.exit(0);
}); 