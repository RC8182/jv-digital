// forzar_logs.js
// Script para forzar el envío de logs detallados de la ESP

const mqtt = require('mqtt');

// Configuración MQTT
const BROKER = "mqtt://192.168.1.31";
const DATA_TOPIC = "anemometro/datos";
const CONTROL_TOPIC = "anemometro/control";
const LOGS_TOPIC = "anemometro/logs";

// Conectar al broker MQTT
const client = mqtt.connect(BROKER);

console.log("📝 FORZANDO ENVÍO DE LOGS DETALLADOS");
console.log("=".repeat(50));
console.log(`🌐 Broker MQTT: ${BROKER}`);
console.log(`📅 Inicio: ${new Date().toLocaleString('es-ES')}`);
console.log("=".repeat(50));

let logsRecibidos = 0;
let datosRecibidos = 0;

client.on('connect', () => {
  console.log("✅ Conectado al broker MQTT");
  
  // Suscribirse a topics
  client.subscribe(DATA_TOPIC, (err) => {
    if (err) console.error("❌ Error suscribiéndose a datos:", err.message);
    else console.log("✅ Suscrito a topic de datos");
  });
  
  client.subscribe(LOGS_TOPIC, (err) => {
    if (err) console.error("❌ Error suscribiéndose a logs:", err.message);
    else console.log("✅ Suscrito a topic de logs");
  });
  
  iniciarForzadoLogs();
});

client.on('message', (topic, payload) => {
  if (topic === DATA_TOPIC) {
    procesarDatos(payload);
  } else if (topic === LOGS_TOPIC) {
    procesarLogs(payload);
  }
});

// Función para enviar comando de control
async function enviarComandoControl(comando, parametros = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      comando: comando,
      parametros: parametros,
      timestamp: Date.now(),
      source: "forzar_logs"
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

// Función para procesar datos
function procesarDatos(payload) {
  try {
    const data = JSON.parse(payload.toString());
    datosRecibidos++;
    
    const timestamp = new Date().toLocaleString('es-ES');
    console.log(`📊 Datos #${datosRecibidos} - ${timestamp}`);
    
    // Mostrar información del sistema
    const sys = data.sys || {};
    console.log(`   ⏱️  Uptime: ${sys.uptime_s !== null ? `${Math.floor(sys.uptime_s/60)}min` : 'NULL'}`);
    console.log(`   🔢 Reset Count: ${sys.reset_count !== null ? sys.reset_count : 'NULL'}`);
    console.log(`   📝 Reset Reason: ${sys.reset_reason !== null ? sys.reset_reason : 'NULL'}`);
    console.log(`   📱 BLE: ${sys.ble_ok === 1 ? '✅ Conectado' : sys.ble_ok === 0 ? '❌ Desconectado' : '❓ NULL'}`);
    console.log(`   ❌ BLE Fails: ${sys.ble_fails !== null ? sys.ble_fails : 'NULL'}`);
    console.log(`   🌐 MQTT Fails: ${sys.mqtt_fails !== null ? sys.mqtt_fails : 'NULL'}`);
    console.log(`   📶 RSSI: ${sys.rssi_dBm !== null ? `${sys.rssi_dBm}dBm` : 'NULL'}`);
    console.log(`   💾 Heap Free: ${sys.heap_free !== null ? `${sys.heap_free} bytes` : 'NULL'}`);
    console.log(`   🔧 Mode: ${sys.mode !== null ? sys.mode : 'NULL'}`);
    console.log(`   ⏰ Interval: ${sys.interval_s !== null ? `${sys.interval_s}s` : 'NULL'}`);
    
    // Mostrar datos de viento si están disponibles
    if (data.data) {
      const datos = data.data;
      console.log(`   💨 Datos de viento:`);
      if (datos.spd && datos.spd.length > 0) {
        console.log(`      Velocidad: ${datos.spd[datos.spd.length - 1]} m/s`);
      }
      if (datos.dir && datos.dir.length > 0) {
        console.log(`      Dirección: ${datos.dir[datos.dir.length - 1]}°`);
      }
      if (datos.bateria_pct !== undefined) {
        console.log(`      Batería ESP: ${datos.bateria_pct}%`);
      }
      if (datos.bateria_anemo_pct !== undefined) {
        console.log(`      Batería Anemómetro: ${datos.bateria_anemo_pct}%`);
      }
    }
    
    console.log("");
    
  } catch (error) {
    console.error("❌ Error procesando datos:", error.message);
  }
}

// Función para procesar logs
function procesarLogs(payload) {
  try {
    const data = JSON.parse(payload.toString());
    logsRecibidos++;
    
    const timestamp = new Date().toLocaleString('es-ES');
    console.log(`📝 Log #${logsRecibidos} - ${timestamp}`);
    
    // Mostrar información del log
    console.log(`   🔢 Nivel: ${data.nivel || 'INFO'}`);
    console.log(`   📝 Mensaje: ${data.mensaje || 'N/A'}`);
    console.log(`   🔧 Función: ${data.funcion || 'N/A'}`);
    console.log(`   📍 Línea: ${data.linea || 'N/A'}`);
    console.log(`   ⏱️  Timestamp: ${data.timestamp || 'N/A'}`);
    
    if (data.datos_adicionales) {
      console.log(`   📊 Datos adicionales:`, data.datos_adicionales);
    }
    
    console.log("");
    
  } catch (error) {
    console.error("❌ Error procesando log:", error.message);
    console.log("📦 Payload raw:", payload.toString());
  }
}

// Función para iniciar el forzado de logs
async function iniciarForzadoLogs() {
  console.log("📝 INICIANDO FORZADO DE LOGS...");
  console.log("");
  
  // Paso 1: Solicitar logs detallados
  console.log("📋 PASO 1: Solicitando logs detallados...");
  await enviarComandoControl('enviar_logs_detallados', { nivel: 'DEBUG' });
  await esperar(3000);
  
  // Paso 2: Forzar dump de memoria
  console.log("\n📋 PASO 2: Forzando dump de memoria...");
  await enviarComandoControl('dump_memoria');
  await esperar(3000);
  
  // Paso 3: Solicitar estado completo
  console.log("\n📋 PASO 3: Solicitando estado completo...");
  await enviarComandoControl('estado_completo');
  await esperar(3000);
  
  // Paso 4: Forzar logs de sistema
  console.log("\n📋 PASO 4: Forzando logs de sistema...");
  await enviarComandoControl('logs_sistema');
  await esperar(3000);
  
  // Paso 5: Solicitar información de debug
  console.log("\n📋 PASO 5: Solicitando información de debug...");
  await enviarComandoControl('debug_info');
  await esperar(3000);
  
  // Paso 6: Forzar logs de BLE
  console.log("\n📋 PASO 6: Forzando logs de BLE...");
  await enviarComandoControl('logs_ble');
  await esperar(3000);
  
  // Paso 7: Solicitar logs de inicialización
  console.log("\n📋 PASO 7: Solicitando logs de inicialización...");
  await enviarComandoControl('logs_inicializacion');
  await esperar(3000);
  
  console.log("\n⏳ Esperando respuestas...");
  console.log("📊 Monitoreando logs y datos...");
  
  // Esperar un tiempo para recibir respuestas
  setTimeout(() => {
    generarResumenLogs();
  }, 15000);
}

// Función para generar resumen de logs
function generarResumenLogs() {
  console.log("\n" + "=".repeat(50));
  console.log("📊 RESUMEN DE LOGS FORZADOS");
  console.log("=".repeat(50));
  
  console.log("\n📊 ESTADÍSTICAS:");
  console.log(`   📝 Logs recibidos: ${logsRecibidos}`);
  console.log(`   📊 Datos recibidos: ${datosRecibidos}`);
  console.log(`   ⏱️  Tiempo total: 15 segundos`);
  
  console.log("\n🔍 ANÁLISIS:");
  console.log("-".repeat(40));
  
  if (logsRecibidos > 0) {
    console.log("✅ LOGS RECIBIDOS");
    console.log("   - La ESP está enviando logs");
    console.log("   - El sistema de logging funciona");
    console.log("   - Podemos obtener información detallada");
  } else {
    console.log("❌ NO SE RECIBIERON LOGS");
    console.log("   - La ESP no tiene sistema de logging");
    console.log("   - O no responde a comandos de logging");
    console.log("   - Solo tenemos datos básicos");
  }
  
  if (datosRecibidos > 0) {
    console.log("✅ DATOS RECIBIDOS");
    console.log("   - La ESP está enviando datos");
    console.log("   - El sistema de datos funciona");
    console.log("   - Podemos monitorear el estado");
  } else {
    console.log("❌ NO SE RECIBIERON DATOS");
    console.log("   - La ESP no está enviando datos");
    console.log("   - Puede haber un problema crítico");
  }
  
  console.log("\n💡 RECOMENDACIONES:");
  console.log("-".repeat(40));
  
  if (logsRecibidos > 0) {
    console.log("✅ CONTINUAR CON LOGS:");
    console.log("1. Analizar los logs recibidos");
    console.log("2. Buscar errores o problemas");
    console.log("3. Usar logs para diagnóstico");
  } else {
    console.log("⚠️  USAR DATOS BÁSICOS:");
    console.log("1. Analizar solo los datos recibidos");
    console.log("2. Verificar valores del sistema");
    console.log("3. Considerar flasheo físico");
  }
  
  console.log("\n📋 PRÓXIMOS PASOS:");
  console.log("-".repeat(40));
  console.log("1. Analizar logs y datos recibidos");
  console.log("2. Buscar patrones o errores");
  console.log("3. Ejecutar: node monitor_ble_mqtt.js");
  console.log("4. Documentar hallazgos");
  
  console.log("\n" + "=".repeat(50));
  console.log("📝 FORZADO DE LOGS COMPLETADO");
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
  console.log("\n🛑 Deteniendo forzado de logs...");
  client.end();
  process.exit(0);
}); 