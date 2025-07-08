// diagnostico_definitivo.js
// Diagnóstico definitivo: ESP vs Anemómetro - ¿Dónde está el problema?

const mqtt = require('mqtt');

// Configuración MQTT
const BROKER = "mqtt://192.168.1.31";
const DATA_TOPIC = "anemometro/datos";
const CONTROL_TOPIC = "anemometro/control";

// Variables de diagnóstico
let diagnostico = {
  esp_funcionando: false,
  ble_funcionando: false,
  anemometro_detectado: false,
  rssi_detectado: false,
  errores_ble: 0,
  mensajes_recibidos: 0,
  ultima_conexion: null,
  rssi_values: [],
  uptime_esp: 0,
  reset_count: 0
};

// Conectar al broker MQTT
const client = mqtt.connect(BROKER);

console.log("🔬 DIAGNÓSTICO DEFINITIVO: ESP vs ANEMÓMETRO");
console.log("=".repeat(70));
console.log(`🌐 Broker MQTT: ${BROKER}`);
console.log(`📅 Inicio: ${new Date().toLocaleString('es-ES')}`);
console.log("=".repeat(70));

client.on('connect', () => {
  console.log("✅ Conectado al broker MQTT");
  iniciarDiagnosticoDefinitivo();
});

client.on('message', (topic, payload) => {
  if (topic === DATA_TOPIC) {
    procesarMensajeDefinitivo(payload);
  }
});

// Función para enviar comando de control
async function enviarComandoControl(comando, parametros = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      comando: comando,
      parametros: parametros,
      timestamp: Date.now(),
      source: "diagnostico_definitivo"
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

// Función para procesar mensajes del diagnóstico definitivo
function procesarMensajeDefinitivo(payload) {
  try {
    const data = JSON.parse(payload.toString());
    const sys = data.sys || {};
    
    diagnostico.mensajes_recibidos++;
    
    // Extraer información del sistema
    const bleOk = sys.ble_ok;
    const bleFails = sys.ble_fails;
    const rssi = sys.rssi_dBm;
    const uptime = sys.uptime_s;
    const resetCount = sys.reset_count;
    
    // Actualizar diagnóstico
    if (uptime !== undefined) diagnostico.uptime_esp = uptime;
    if (resetCount !== undefined) diagnostico.reset_count = resetCount;
    if (bleFails !== undefined) diagnostico.errores_ble += bleFails;
    
    // Verificar RSSI
    if (rssi !== undefined && rssi > -100) {
      diagnostico.rssi_detectado = true;
      diagnostico.rssi_values.push(rssi);
    }
    
    // Verificar conexión BLE
    if (bleOk === 1) {
      diagnostico.ble_funcionando = true;
      diagnostico.ultima_conexion = Date.now();
    }
    
    // Verificar que la ESP está funcionando
    if (uptime > 0) {
      diagnostico.esp_funcionando = true;
    }
    
    console.log(`📊 Msg #${diagnostico.mensajes_recibidos} - BLE: ${bleOk === 1 ? '✅' : '❌'}, RSSI: ${rssi || 'N/A'}dBm, Uptime: ${Math.floor(uptime/60)}min`);
    
  } catch (error) {
    console.error("❌ Error procesando mensaje:", error.message);
  }
}

// Función para iniciar el diagnóstico definitivo
async function iniciarDiagnosticoDefinitivo() {
  console.log("🔬 INICIANDO DIAGNÓSTICO DEFINITIVO...");
  console.log("");
  
  // Paso 1: Verificar estado inicial
  console.log("📋 PASO 1: Verificando estado inicial...");
  await enviarComandoControl('estado_detallado');
  await esperar(5000);
  
  // Paso 2: Escaneo BLE amplio
  console.log("\n📋 PASO 2: Escaneo BLE amplio...");
  console.log("🔍 Buscando cualquier dispositivo Bluetooth...");
  await enviarComandoControl('escaneo_ble', { duracion: 15000 });
  await esperar(17000);
  
  // Paso 3: Intentar reconexión
  console.log("\n📋 PASO 3: Intentando reconexión...");
  await enviarComandoControl('reconectar_ble');
  await esperar(8000);
  
  // Paso 4: Verificar configuración
  console.log("\n📋 PASO 4: Verificando configuración...");
  await enviarComandoControl('config_ble');
  await esperar(5000);
  
  // Generar diagnóstico definitivo
  generarDiagnosticoDefinitivo();
}

// Función para esperar
function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para generar el diagnóstico definitivo
function generarDiagnosticoDefinitivo() {
  console.log("\n" + "=".repeat(70));
  console.log("🔬 DIAGNÓSTICO DEFINITIVO");
  console.log("=".repeat(70));
  
  // Análisis de la ESP
  console.log("\n📱 ANÁLISIS DE LA ESP:");
  console.log(`   ✅ ESP funcionando: ${diagnostico.esp_funcionando ? 'SÍ' : 'NO'}`);
  console.log(`   ⏱️  Uptime: ${Math.floor(diagnostico.uptime_esp/60)} minutos`);
  console.log(`   🔢 Reset count: ${diagnostico.reset_count}`);
  console.log(`   📡 Mensajes recibidos: ${diagnostico.mensajes_recibidos}`);
  
  // Análisis del Bluetooth
  console.log("\n📱 ANÁLISIS DEL BLUETOOTH:");
  console.log(`   🔗 BLE funcionando: ${diagnostico.ble_funcionando ? 'SÍ' : 'NO'}`);
  console.log(`   📶 RSSI detectado: ${diagnostico.rssi_detectado ? 'SÍ' : 'NO'}`);
  console.log(`   ❌ Errores BLE: ${diagnostico.errores_ble}`);
  
  if (diagnostico.rssi_values.length > 0) {
    const rssiPromedio = diagnostico.rssi_values.reduce((a, b) => a + b, 0) / diagnostico.rssi_values.length;
    console.log(`   📊 RSSI promedio: ${rssiPromedio.toFixed(1)}dBm`);
  }
  
  if (diagnostico.ultima_conexion) {
    const tiempoDesdeConexion = Math.floor((Date.now() - diagnostico.ultima_conexion) / 60000);
    console.log(`   ⏰ Última conexión: hace ${tiempoDesdeConexion} minutos`);
  }
  
  // DIAGNÓSTICO DEFINITIVO
  console.log("\n🔬 DIAGNÓSTICO DEFINITIVO:");
  console.log("-".repeat(50));
  
  if (!diagnostico.esp_funcionando) {
    console.log("❌ PROBLEMA CRÍTICO: La ESP no está funcionando");
    console.log("   - La ESP no responde o está apagada");
    console.log("   - Verificar alimentación y conexiones");
  } else if (!diagnostico.rssi_detectado) {
    console.log("❌ PROBLEMA EN EL BLUETOOTH DE LA ESP");
    console.log("   - La ESP no detecta NINGÚN dispositivo Bluetooth");
    console.log("   - El hardware BLE de la ESP está dañado o mal configurado");
    console.log("   - Posibles causas:");
    console.log("     • Antena BLE desconectada o dañada");
    console.log("     • Hardware BLE dañado");
    console.log("     • Firmware BLE corrupto");
    console.log("     • Problema de alimentación");
  } else if (diagnostico.rssi_detectado && !diagnostico.ble_funcionando) {
    console.log("✅ BLUETOOTH DE LA ESP FUNCIONA");
    console.log("❌ PROBLEMA EN EL ANEMÓMETRO");
    console.log("   - La ESP puede detectar dispositivos Bluetooth");
    console.log("   - El anemómetro específicamente no responde");
    console.log("   - Posibles causas:");
    console.log("     • Anemómetro apagado");
    console.log("     • Anemómetro sin batería");
    console.log("     • Anemómetro fuera de rango");
    console.log("     • Fallo en el hardware del anemómetro");
  } else {
    console.log("✅ TODO FUNCIONA CORRECTAMENTE");
    console.log("   - La ESP está funcionando");
    console.log("   - El Bluetooth está conectado");
    console.log("   - El anemómetro está respondiendo");
  }
  
  // RECOMENDACIONES ESPECÍFICAS
  console.log("\n💡 RECOMENDACIONES ESPECÍFICAS:");
  console.log("-".repeat(50));
  
  if (!diagnostico.esp_funcionando) {
    console.log("🔧 VERIFICAR LA ESP:");
    console.log("1. Comprobar alimentación de la ESP");
    console.log("2. Verificar conexiones de cables");
    console.log("3. Reiniciar completamente la ESP");
    console.log("4. Verificar que el firmware esté cargado");
  } else if (!diagnostico.rssi_detectado) {
    console.log("🔧 VERIFICAR BLUETOOTH DE LA ESP:");
    console.log("1. Comprobar conexión de la antena BLE");
    console.log("2. Verificar alimentación estable (3.3V)");
    console.log("3. Reflashear firmware limpio");
    console.log("4. Verificar que no haya interferencias");
    console.log("5. Probar con otra ESP para comparar");
  } else if (diagnostico.rssi_detectado && !diagnostico.ble_funcionando) {
    console.log("🔧 VERIFICAR EL ANEMÓMETRO:");
    console.log("1. Comprobar si el anemómetro está encendido");
    console.log("2. Verificar nivel de batería del anemómetro");
    console.log("3. Acercar el anemómetro a la ESP (< 10m)");
    console.log("4. Reiniciar el anemómetro");
    console.log("5. Usar app de escaneo BLE en el móvil");
    console.log("6. Verificar que el anemómetro no esté dañado");
  }
  
  // PLAN DE ACCIÓN
  console.log("\n📋 PLAN DE ACCIÓN:");
  console.log("-".repeat(50));
  
  if (!diagnostico.rssi_detectado) {
    console.log("1. 🔧 Revisar físicamente la ESP:");
    console.log("   - Verificar antena BLE");
    console.log("   - Comprobar alimentación");
    console.log("   - Reflashear firmware");
    console.log("");
    console.log("2. 🔄 Probar con otra ESP:");
    console.log("   - Si otra ESP detecta dispositivos → problema en esta ESP");
    console.log("   - Si ninguna ESP detecta → problema ambiental");
  } else {
    console.log("1. 🔍 Revisar físicamente el anemómetro:");
    console.log("   - Verificar encendido y batería");
    console.log("   - Acercar a la ESP");
    console.log("   - Reiniciar el anemómetro");
    console.log("");
    console.log("2. 📱 Usar app de escaneo BLE:");
    console.log("   - Buscar dispositivos con nombre del anemómetro");
    console.log("   - Si no aparece → anemómetro apagado/dañado");
    console.log("   - Si aparece → problema de configuración");
  }
  
  console.log("\n3. 🔄 Continuar monitoreando:");
  console.log("   - Ejecutar: node monitor_ble_mqtt.js");
  console.log("   - Observar cambios en el estado");
  console.log("   - Documentar cualquier mejora");
  
  console.log("\n" + "=".repeat(70));
  console.log("🔬 DIAGNÓSTICO DEFINITIVO COMPLETADO");
  console.log("=".repeat(70));
  
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