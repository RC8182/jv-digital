// monitor_post_flasheo.js
// Monitoreo post-flasheo para verificar si el problema se resolvió

const mqtt = require('mqtt');

// Configuración MQTT
const BROKER = "mqtt://192.168.1.31";
const DATA_TOPIC = "anemometro/datos";
const CONTROL_TOPIC = "anemometro/control";

// Variables de monitoreo
let monitoreo = {
  mensajesRecibidos: 0,
  valoresInicializados: 0,
  bleConectado: false,
  ultimaConexionBLE: null,
  uptimeDetectado: false,
  resetCountDetectado: false,
  rssiDetectado: false,
  inicio: Date.now()
};

// Conectar al broker MQTT
const client = mqtt.connect(BROKER);

console.log("🔍 MONITOREO POST-FLASHEO");
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
      console.log("🔍 Monitoreando estado post-flasheo...");
      console.log("=".repeat(50));
    }
  });
});

client.on('message', (topic, payload) => {
  if (topic === DATA_TOPIC) {
    procesarMensajePostFlasheo(payload);
  }
});

// Función para enviar comando de control
async function enviarComandoControl(comando, parametros = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      comando: comando,
      parametros: parametros,
      timestamp: Date.now(),
      source: "monitor_post_flasheo"
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

// Función para procesar mensajes post-flasheo
function procesarMensajePostFlasheo(payload) {
  try {
    const data = JSON.parse(payload.toString());
    monitoreo.mensajesRecibidos++;
    
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
    
    // Verificar valores inicializados
    let valoresValidos = 0;
    if (uptime !== null && uptime !== undefined) {
      valoresValidos++;
      monitoreo.uptimeDetectado = true;
    }
    if (resetCount !== null && resetCount !== undefined) {
      valoresValidos++;
      monitoreo.resetCountDetectado = true;
    }
    if (bleOk !== null && bleOk !== undefined) {
      valoresValidos++;
      if (bleOk === 1) {
        monitoreo.bleConectado = true;
        monitoreo.ultimaConexionBLE = Date.now();
      }
    }
    if (rssi !== null && rssi !== undefined) {
      valoresValidos++;
      monitoreo.rssiDetectado = true;
    }
    
    monitoreo.valoresInicializados += valoresValidos;
    
    // Mostrar información del mensaje
    const timestamp = new Date().toLocaleString('es-ES');
    const tiempoTranscurrido = Math.floor((Date.now() - monitoreo.inicio) / 1000);
    
    console.log(`📊 Msg #${monitoreo.mensajesRecibidos} - ${timestamp} (${tiempoTranscurrido}s)`);
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
    console.log(`   📊 Valores válidos: ${valoresValidos}/10`);
    console.log("");
    
    // Si recibimos suficientes mensajes, hacer análisis
    if (monitoreo.mensajesRecibidos >= 15) {
      setTimeout(() => {
        generarAnalisisPostFlasheo();
      }, 3000);
    }
    
  } catch (error) {
    console.error("❌ Error procesando mensaje:", error.message);
  }
}

// Función para generar análisis post-flasheo
function generarAnalisisPostFlasheo() {
  console.log("\n" + "=".repeat(50));
  console.log("📊 ANÁLISIS POST-FLASHEO");
  console.log("=".repeat(50));
  
  const promedioValoresValidos = monitoreo.valoresInicializados / monitoreo.mensajesRecibidos;
  const porcentajeInicializacion = (promedioValoresValidos / 10) * 100;
  
  console.log("\n📊 ESTADÍSTICAS:");
  console.log(`   📡 Mensajes recibidos: ${monitoreo.mensajesRecibidos}`);
  console.log(`   ✅ Total valores válidos: ${monitoreo.valoresInicializados}`);
  console.log(`   📊 Promedio valores válidos: ${promedioValoresValidos.toFixed(1)}/10`);
  console.log(`   📈 Porcentaje de inicialización: ${porcentajeInicializacion.toFixed(1)}%`);
  
  console.log("\n🔍 ESTADO DEL SISTEMA:");
  console.log(`   ⏱️  Uptime detectado: ${monitoreo.uptimeDetectado ? '✅ SÍ' : '❌ NO'}`);
  console.log(`   🔢 Reset Count detectado: ${monitoreo.resetCountDetectado ? '✅ SÍ' : '❌ NO'}`);
  console.log(`   📱 BLE conectado: ${monitoreo.bleConectado ? '✅ SÍ' : '❌ NO'}`);
  console.log(`   📶 RSSI detectado: ${monitoreo.rssiDetectado ? '✅ SÍ' : '❌ NO'}`);
  
  if (monitoreo.ultimaConexionBLE) {
    const tiempoDesdeConexion = Math.floor((Date.now() - monitoreo.ultimaConexionBLE) / 60000);
    console.log(`   ⏰ Última conexión BLE: hace ${tiempoDesdeConexion} minutos`);
  }
  
  console.log("\n🔬 DIAGNÓSTICO POST-FLASHEO:");
  console.log("-".repeat(40));
  
  if (porcentajeInicializacion >= 80) {
    console.log("✅ FLASHEO EXITOSO");
    console.log("   - La mayoría de valores se inicializaron correctamente");
    console.log("   - El firmware está funcionando correctamente");
    console.log("   - El problema de valores NULL se resolvió");
    
    if (monitoreo.bleConectado) {
      console.log("   - El Bluetooth está conectado y funcionando");
      console.log("   - El anemómetro debería estar funcionando");
    } else {
      console.log("   - El Bluetooth no está conectado");
      console.log("   - Verificar el anemómetro físicamente");
    }
  } else if (porcentajeInicializacion >= 50) {
    console.log("⚠️  FLASHEO PARCIALMENTE EXITOSO");
    console.log("   - Algunos valores se inicializaron");
    console.log("   - El firmware funciona pero con limitaciones");
    console.log("   - Puede haber problemas menores");
  } else {
    console.log("❌ FLASHEO FALLIDO");
    console.log("   - La mayoría de valores siguen en NULL");
    console.log("   - El firmware no se inicializa correctamente");
    console.log("   - Se requiere flasheo físico");
  }
  
  // Recomendaciones específicas
  console.log("\n💡 RECOMENDACIONES:");
  console.log("-".repeat(40));
  
  if (porcentajeInicializacion >= 80) {
    console.log("✅ CONTINUAR MONITOREO:");
    console.log("1. Ejecutar: node monitor_ble_mqtt.js");
    console.log("2. Verificar datos de viento");
    console.log("3. Comprobar que el anemómetro envía datos");
    console.log("4. Si todo funciona, el problema está resuelto");
  } else if (porcentajeInicializacion >= 50) {
    console.log("⚠️  VERIFICAR CONFIGURACIÓN:");
    console.log("1. Revisar configuración del firmware");
    console.log("2. Verificar parámetros de inicialización");
    console.log("3. Considerar reflashear si persiste");
  } else {
    console.log("❌ REFLASHEAR FÍSICAMENTE:");
    console.log("1. Conectar la ESP por USB");
    console.log("2. Usar esptool para flashear");
    console.log("3. Verificar que el firmware sea correcto");
    console.log("4. Comprobar compatibilidad de hardware");
  }
  
  console.log("\n📋 PRÓXIMOS PASOS:");
  console.log("-".repeat(40));
  console.log("1. Continuar monitoreando: node monitor_ble_mqtt.js");
  console.log("2. Verificar si el anemómetro se conecta");
  console.log("3. Documentar cualquier mejora");
  console.log("4. Si no mejora, considerar flasheo físico");
  
  console.log("\n" + "=".repeat(50));
  console.log("🔍 ANÁLISIS COMPLETADO");
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
  console.log("\n🛑 Deteniendo monitoreo...");
  client.end();
  process.exit(0);
}); 