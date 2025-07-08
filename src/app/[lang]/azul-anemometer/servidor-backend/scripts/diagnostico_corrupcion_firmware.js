// diagnostico_corrupcion_firmware.js
// Script para diagnosticar las posibles causas de corrupción del firmware

const mqtt = require('mqtt');

// Configuración MQTT
const BROKER = "mqtt://192.168.1.31";
const CONTROL_TOPIC = "anemometro/control";
const DATA_TOPIC = "anemometro/datos";

// Conectar al broker MQTT
const client = mqtt.connect(BROKER);

console.log("🔍 DIAGNÓSTICO DE CORRUPCIÓN DE FIRMWARE");
console.log("=".repeat(50));
console.log(`📡 Broker: ${BROKER}`);
console.log(`🎯 Topic Control: ${CONTROL_TOPIC}`);
console.log(`📊 Topic Datos: ${DATA_TOPIC}`);
console.log("");

let diagnostico = {
  inicio: Date.now(),
  mensajesRecibidos: 0,
  erroresDetectados: 0,
  causasIdentificadas: [],
  recomendaciones: []
};

client.on('connect', () => {
  console.log("✅ Conectado al broker MQTT");
  
  client.subscribe(DATA_TOPIC, (err) => {
    if (err) console.error("❌ Error suscribiéndose a datos:", err.message);
    else console.log("✅ Suscrito a topic de datos");
  });
  
  iniciarDiagnostico();
});

client.on('message', (topic, payload) => {
  if (topic === DATA_TOPIC) {
    procesarMensajeDiagnostico(payload);
  }
});

// Función para enviar comando de control
async function enviarComandoControl(comando, parametros = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      comando: comando,
      parametros: parametros,
      timestamp: Date.now(),
      source: "diagnostico_corrupcion"
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

// Función para esperar
function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para procesar mensajes de diagnóstico
function procesarMensajeDiagnostico(payload) {
  try {
    const data = JSON.parse(payload.toString());
    diagnostico.mensajesRecibidos++;
    
    console.log(`📊 Mensaje #${diagnostico.mensajesRecibidos} recibido`);
    
    // Analizar estructura del mensaje
    analizarEstructuraMensaje(data);
    
    // Analizar valores del sistema
    analizarValoresSistema(data);
    
    // Analizar patrones de error
    analizarPatronesError(data);
    
  } catch (error) {
    console.error("❌ Error procesando mensaje:", error.message);
    diagnostico.erroresDetectados++;
  }
}

// Función para analizar estructura del mensaje
function analizarEstructuraMensaje(data) {
  console.log("🔍 Analizando estructura del mensaje...");
  
  // Verificar campos obligatorios
  const camposObligatorios = ['data', 'sys'];
  const camposFaltantes = camposObligatorios.filter(campo => !data.hasOwnProperty(campo));
  
  if (camposFaltantes.length > 0) {
    console.log(`⚠️  Campos faltantes: ${camposFaltantes.join(', ')}`);
    diagnostico.causasIdentificadas.push('Estructura JSON incompleta');
  }
  
  // Verificar tipos de datos
  if (data.sys) {
    const sys = data.sys;
    
    // Verificar si los valores son del tipo correcto
    if (typeof sys.uptime_s !== 'number' && sys.uptime_s !== null) {
      console.log("⚠️  uptime_s no es número válido");
      diagnostico.causasIdentificadas.push('Tipo de dato incorrecto en uptime_s');
    }
    
    if (typeof sys.reset_count !== 'number' && sys.reset_count !== null) {
      console.log("⚠️  reset_count no es número válido");
      diagnostico.causasIdentificadas.push('Tipo de dato incorrecto en reset_count');
    }
    
    if (typeof sys.ble_ok !== 'boolean' && sys.ble_ok !== null) {
      console.log("⚠️  ble_ok no es booleano válido");
      diagnostico.causasIdentificadas.push('Tipo de dato incorrecto en ble_ok');
    }
  }
}

// Función para analizar valores del sistema
function analizarValoresSistema(data) {
  if (!data.sys) return;
  
  const sys = data.sys;
  console.log("🔍 Analizando valores del sistema...");
  
  // Verificar valores NULL
  const valoresNull = [];
  if (sys.uptime_s === null) valoresNull.push('uptime_s');
  if (sys.reset_count === null) valoresNull.push('reset_count');
  if (sys.reset_reason === null) valoresNull.push('reset_reason');
  if (sys.ble_ok === null) valoresNull.push('ble_ok');
  if (sys.heap_free === null) valoresNull.push('heap_free');
  
  if (valoresNull.length > 0) {
    console.log(`⚠️  Valores NULL detectados: ${valoresNull.join(', ')}`);
    diagnostico.causasIdentificadas.push('Variables del sistema no inicializadas');
  }
  
  // Verificar valores anómalos
  if (sys.uptime_s !== null && sys.uptime_s < 0) {
    console.log("⚠️  uptime_s negativo detectado");
    diagnostico.causasIdentificadas.push('Uptime negativo (overflow)');
  }
  
  if (sys.heap_free !== null && sys.heap_free < 10000) {
    console.log("⚠️  Memoria heap baja detectada");
    diagnostico.causasIdentificadas.push('Memoria heap insuficiente');
  }
  
  if (sys.reset_count !== null && sys.reset_count > 100) {
    console.log("⚠️  Alto número de reinicios detectado");
    diagnostico.causasIdentificadas.push('Múltiples reinicios (posible loop)');
  }
}

// Función para analizar patrones de error
function analizarPatronesError(data) {
  if (!data.sys) return;
  
  const sys = data.sys;
  console.log("🔍 Analizando patrones de error...");
  
  // Verificar razones de reinicio problemáticas
  const razonesProblematicas = ['TaskWDT', 'InterruptWDT', 'Panic', 'Brownout'];
  if (sys.reset_reason && razonesProblematicas.includes(sys.reset_reason)) {
    console.log(`⚠️  Razón de reinicio problemática: ${sys.reset_reason}`);
    diagnostico.causasIdentificadas.push(`Reinicio por ${sys.reset_reason}`);
  }
  
  // Verificar fallos de conexión
  if (sys.ble_fails !== null && sys.ble_fails > 10) {
    console.log("⚠️  Múltiples fallos BLE detectados");
    diagnostico.causasIdentificadas.push('Fallos repetidos de conexión BLE');
  }
  
  if (sys.mqtt_fails !== null && sys.mqtt_fails > 10) {
    console.log("⚠️  Múltiples fallos MQTT detectados");
    diagnostico.causasIdentificadas.push('Fallos repetidos de conexión MQTT');
  }
}

// Función para iniciar diagnóstico
async function iniciarDiagnostico() {
  console.log("🔍 INICIANDO DIAGNÓSTICO DE CORRUPCIÓN...");
  console.log("");
  
  // Paso 1: Verificar estado actual
  console.log("📋 PASO 1: Verificando estado actual...");
  await enviarComandoControl('estado_detallado');
  await esperar(5000);
  
  // Paso 2: Verificar memoria
  console.log("\n📋 PASO 2: Verificando memoria...");
  await enviarComandoControl('verificar_memoria');
  await esperar(3000);
  
  // Paso 3: Verificar NVS
  console.log("\n📋 PASO 3: Verificando NVS...");
  await enviarComandoControl('verificar_nvs');
  await esperar(3000);
  
  // Paso 4: Verificar stack
  console.log("\n📋 PASO 4: Verificando stack...");
  await enviarComandoControl('verificar_stack');
  await esperar(3000);
  
  // Paso 5: Monitorear por 30 segundos
  console.log("\n📋 PASO 5: Monitoreando comportamiento...");
  console.log("⏳ Monitoreando por 30 segundos...");
  
  setTimeout(() => {
    generarReporteDiagnostico();
  }, 30000);
}

// Función para generar reporte de diagnóstico
function generarReporteDiagnostico() {
  console.log("\n" + "=".repeat(60));
  console.log("🔍 REPORTE DE DIAGNÓSTICO DE CORRUPCIÓN");
  console.log("=".repeat(60));
  
  console.log("\n📊 ESTADÍSTICAS:");
  console.log(`   📡 Mensajes recibidos: ${diagnostico.mensajesRecibidos}`);
  console.log(`   ❌ Errores detectados: ${diagnostico.erroresDetectados}`);
  console.log(`   🔍 Causas identificadas: ${diagnostico.causasIdentificadas.length}`);
  
  if (diagnostico.causasIdentificadas.length > 0) {
    console.log("\n🚨 CAUSAS IDENTIFICADAS:");
    console.log("-".repeat(40));
    diagnostico.causasIdentificadas.forEach((causa, index) => {
      console.log(`${index + 1}. ${causa}`);
    });
  }
  
  console.log("\n💡 ANÁLISIS DE POSIBLES CAUSAS:");
  console.log("-".repeat(40));
  
  // Análisis basado en el firmware original
  console.log("🔍 BASADO EN EL FIRMWARE ORIGINAL:");
  console.log("");
  
  console.log("1. 📦 PROBLEMAS DE MEMORIA:");
  console.log("   • StaticJsonDocument<512> puede ser insuficiente");
  console.log("   • Buffer de salida de 1600 bytes puede ser pequeño");
  console.log("   • Múltiples objetos JSON simultáneos");
  console.log("");
  
  console.log("2. ⏰ WATCHDOG TIMEOUT:");
  console.log("   • Timeout de 120 segundos puede ser muy largo");
  console.log("   • Reinicios por watchdog pueden corromper flash");
  console.log("   • Operaciones bloqueantes en el loop principal");
  console.log("");
  
  console.log("3. 🔵 PROBLEMAS BLE:");
  console.log("   • Excepciones BLE no manejadas correctamente");
  console.log("   • Reconexiones repetidas cada 30 segundos");
  console.log("   • Manejo de std::exception en memoria limitada");
  console.log("");
  
  console.log("4. 📡 PROBLEMAS MQTT:");
  console.log("   • Timeout de 15 segundos para conexión");
  console.log("   • Múltiples intentos de reconexión");
  console.log("   • Buffer de 512 bytes para mensajes");
  console.log("");
  
  console.log("5. 💾 PROBLEMAS NVS:");
  console.log("   • Corrupción de preferencias");
  console.log("   • Contador de reinicios corrupto");
  console.log("   • Problemas de escritura en flash");
  console.log("");
  
  console.log("6. 🔄 PROBLEMAS DE INICIALIZACIÓN:");
  console.log("   • Variables globales no inicializadas");
  console.log("   • Orden de inicialización incorrecto");
  console.log("   • Dependencias entre módulos");
  console.log("");
  
  // Generar recomendaciones
  generarRecomendaciones();
  
  client.end();
  process.exit(0);
}

// Función para generar recomendaciones
function generarRecomendaciones() {
  console.log("\n💡 RECOMENDACIONES:");
  console.log("-".repeat(40));
  
  if (diagnostico.causasIdentificadas.includes('Variables del sistema no inicializadas')) {
    console.log("🔧 PRIORIDAD ALTA - Reflashear firmware:");
    console.log("   1. Descargar firmware limpio y compatible");
    console.log("   2. Verificar checksum del firmware");
    console.log("   3. Flashear físicamente con esptool");
    console.log("   4. Verificar que la ESP sea compatible");
  }
  
  if (diagnostico.causasIdentificadas.includes('Memoria heap insuficiente')) {
    console.log("🔧 PRIORIDAD ALTA - Optimizar memoria:");
    console.log("   1. Reducir tamaño de buffers JSON");
    console.log("   2. Implementar gestión de memoria dinámica");
    console.log("   3. Optimizar uso de stack");
    console.log("   4. Considerar usar PSRAM si está disponible");
  }
  
  if (diagnostico.causasIdentificadas.includes('Reinicio por TaskWDT')) {
    console.log("🔧 PRIORIDAD MEDIA - Optimizar loop principal:");
    console.log("   1. Reducir tiempo de watchdog");
    console.log("   2. Implementar tareas separadas");
    console.log("   3. Optimizar operaciones bloqueantes");
    console.log("   4. Usar FreeRTOS tasks");
  }
  
  if (diagnostico.causasIdentificadas.includes('Fallos repetidos de conexión BLE')) {
    console.log("🔧 PRIORIDAD MEDIA - Mejorar manejo BLE:");
    console.log("   1. Implementar backoff exponencial");
    console.log("   2. Mejorar manejo de excepciones");
    console.log("   3. Verificar compatibilidad de librería");
    console.log("   4. Considerar alternativas a NimBLE");
  }
  
  console.log("\n📋 PRÓXIMOS PASOS:");
  console.log("-".repeat(40));
  console.log("1. 🔧 Si hay corrupción confirmada:");
  console.log("   • Reflashear físicamente la ESP");
  console.log("   • Usar firmware limpio y verificado");
  console.log("   • Verificar compatibilidad de hardware");
  console.log("");
  console.log("2. 🔍 Si el problema es de configuración:");
  console.log("   • Reinicializar configuración por defecto");
  console.log("   • Verificar parámetros de red");
  console.log("   • Comprobar configuración BLE");
  console.log("");
  console.log("3. 📊 Monitoreo continuo:");
  console.log("   • Implementar logging detallado");
  console.log("   • Monitorear uso de memoria");
  console.log("   • Verificar estabilidad del sistema");
}

// Manejo de errores
client.on('error', (err) => {
  console.error("❌ Error de conexión MQTT:", err.message);
  diagnostico.erroresDetectados++;
});

process.on('SIGINT', () => {
  console.log("\n🛑 Interrumpiendo diagnóstico...");
  generarReporteDiagnostico();
});

console.log("🔍 DIAGNÓSTICO DE CORRUPCIÓN DE FIRMWARE");
console.log("=".repeat(50));
console.log("Este script analiza las posibles causas de corrupción");
console.log("basándose en el firmware original del anemómetro.");
console.log("");
console.log("📋 FUNCIONES:");
console.log("1. Analiza estructura de mensajes JSON");
console.log("2. Verifica tipos de datos y valores");
console.log("3. Detecta patrones de error comunes");
console.log("4. Identifica problemas de memoria");
console.log("5. Genera recomendaciones específicas");
console.log("");
console.log("⏳ Iniciando en 3 segundos..."); 