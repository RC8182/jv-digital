// test_bluetooth_esp.js
// Test para verificar si el Bluetooth de la ESP funciona detectando cualquier dispositivo

const mqtt = require('mqtt');

// Configuración MQTT
const BROKER = "mqtt://192.168.1.31";
const DATA_TOPIC = "anemometro/datos";
const CONTROL_TOPIC = "anemometro/control";

// Variables de test
let dispositivosDetectados = [];
let rssiValues = [];
let bleErrors = [];
let testStartTime = Date.now();

// Conectar al broker MQTT
const client = mqtt.connect(BROKER);

console.log("🧪 TEST DE FUNCIONALIDAD BLE DE LA ESP");
console.log("=".repeat(60));
console.log(`🌐 Broker MQTT: ${BROKER}`);
console.log(`📅 Inicio: ${new Date().toLocaleString('es-ES')}`);
console.log("=".repeat(60));

client.on('connect', () => {
  console.log("✅ Conectado al broker MQTT");
  iniciarTestBLE();
});

client.on('message', (topic, payload) => {
  if (topic === DATA_TOPIC) {
    procesarMensajeTest(payload);
  }
});

// Función para enviar comando de control
async function enviarComandoControl(comando, parametros = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      comando: comando,
      parametros: parametros,
      timestamp: Date.now(),
      source: "test_bluetooth"
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

// Función para procesar mensajes del test
function procesarMensajeTest(payload) {
  try {
    const data = JSON.parse(payload.toString());
    const sys = data.sys || {};
    
    // Extraer información relevante
    const bleOk = sys.ble_ok;
    const bleFails = sys.ble_fails;
    const rssi = sys.rssi_dBm;
    const uptime = sys.uptime_s;
    
    // Guardar RSSI si está disponible
    if (rssi !== undefined) {
      rssiValues.push({
        valor: rssi,
        timestamp: Date.now(),
        ble_ok: bleOk
      });
    }
    
    // Guardar errores BLE
    if (bleFails !== undefined && bleFails > 0) {
      bleErrors.push({
        fails: bleFails,
        timestamp: Date.now(),
        uptime: uptime
      });
    }
    
    // Mostrar estado actual
    const tiempoTranscurrido = Math.floor((Date.now() - testStartTime) / 1000);
    console.log(`⏱️  ${tiempoTranscurrido}s - BLE: ${bleOk === 1 ? '✅ Conectado' : '❌ Desconectado'}, RSSI: ${rssi || 'N/A'}dBm`);
    
  } catch (error) {
    console.error("❌ Error procesando mensaje:", error.message);
  }
}

// Función para iniciar el test BLE
async function iniciarTestBLE() {
  console.log("🧪 INICIANDO TEST DE FUNCIONALIDAD BLE...");
  console.log("");
  
  // Paso 1: Escaneo BLE amplio
  console.log("📋 PASO 1: Escaneo BLE amplio (30 segundos)...");
  console.log("🔍 Buscando CUALQUIER dispositivo Bluetooth...");
  await enviarComandoControl('escaneo_ble', { duracion: 30000, modo: 'amplio' });
  
  // Esperar durante el escaneo
  console.log("⏳ Esperando resultados del escaneo...");
  await esperar(35000);
  
  // Paso 2: Test de conectividad básica
  console.log("\n📋 PASO 2: Test de conectividad básica...");
  await enviarComandoControl('test_ble_basico');
  await esperar(10000);
  
  // Paso 3: Verificar configuración BLE
  console.log("\n📋 PASO 3: Verificando configuración BLE...");
  await enviarComandoControl('config_ble');
  await esperar(5000);
  
  // Paso 4: Test de potencia de transmisión
  console.log("\n📋 PASO 4: Test de potencia de transmisión...");
  await enviarComandoControl('test_potencia_ble');
  await esperar(5000);
  
  // Generar reporte final
  generarReporteTest();
}

// Función para esperar
function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para generar reporte del test
function generarReporteTest() {
  console.log("\n" + "=".repeat(60));
  console.log("📊 REPORTE DE TEST BLE");
  console.log("=".repeat(60));
  
  // Análisis de RSSI
  if (rssiValues.length > 0) {
    const rssiValuesOnly = rssiValues.map(r => r.valor);
    const rssiPromedio = rssiValuesOnly.reduce((a, b) => a + b, 0) / rssiValuesOnly.length;
    const rssiMin = Math.min(...rssiValuesOnly);
    const rssiMax = Math.max(...rssiValuesOnly);
    
    console.log("\n📶 ANÁLISIS DE SEÑAL RSSI:");
    console.log(`   Muestras: ${rssiValues.length}`);
    console.log(`   Promedio: ${rssiPromedio.toFixed(1)}dBm`);
    console.log(`   Mínimo: ${rssiMin}dBm`);
    console.log(`   Máximo: ${rssiMax}dBm`);
    
    // Interpretar RSSI
    if (rssiPromedio > -50) {
      console.log("   📡 Señal EXCELENTE - Dispositivos muy cerca");
    } else if (rssiPromedio > -70) {
      console.log("   📡 Señal BUENA - Dispositivos a distancia normal");
    } else if (rssiPromedio > -80) {
      console.log("   📡 Señal DÉBIL - Dispositivos lejos");
    } else if (rssiPromedio > -90) {
      console.log("   📡 Señal MUY DÉBIL - Pocos dispositivos detectados");
    } else {
      console.log("   📡 Sin señal - No se detectan dispositivos");
    }
  } else {
    console.log("\n📶 ANÁLISIS DE SEÑAL RSSI:");
    console.log("   ❌ No se recibieron datos RSSI");
  }
  
  // Análisis de errores BLE
  if (bleErrors.length > 0) {
    console.log("\n❌ ANÁLISIS DE ERRORES BLE:");
    const totalFails = bleErrors.reduce((sum, err) => sum + err.fails, 0);
    console.log(`   Total de fallos BLE: ${totalFails}`);
    console.log(`   Errores registrados: ${bleErrors.length}`);
    
    if (totalFails > 100) {
      console.log("   🔴 MUCHOS ERRORES - Posible problema en el hardware BLE");
    } else if (totalFails > 50) {
      console.log("   🟡 ERRORES MODERADOS - Posible problema de configuración");
    } else {
      console.log("   🟢 POCOS ERRORES - El hardware BLE parece estar bien");
    }
  } else {
    console.log("\n❌ ANÁLISIS DE ERRORES BLE:");
    console.log("   🟢 No se registraron errores BLE");
  }
  
  // Diagnóstico final
  console.log("\n🔬 DIAGNÓSTICO FINAL:");
  console.log("-".repeat(50));
  
  const rssiPromedio = rssiValues.length > 0 ? 
    rssiValues.reduce((sum, r) => sum + r.valor, 0) / rssiValues.length : -100;
  
  if (rssiPromedio > -90) {
    console.log("✅ El Bluetooth de la ESP está FUNCIONANDO");
    console.log("   - Puede detectar señales Bluetooth");
    console.log("   - El hardware BLE está operativo");
    console.log("   - El problema está específicamente en el anemómetro:");
    console.log("     • Anemómetro apagado");
    console.log("     • Anemómetro sin batería");
    console.log("     • Anemómetro fuera de rango");
    console.log("     • Fallo en el anemómetro específicamente");
  } else {
    console.log("❌ El Bluetooth de la ESP tiene PROBLEMAS");
    console.log("   - No detecta señales Bluetooth");
    console.log("   - Posibles causas:");
    console.log("     • Hardware BLE dañado en la ESP");
    console.log("     • Antena BLE desconectada o dañada");
    console.log("     • Problema de alimentación de la ESP");
    console.log("     • Firmware BLE corrupto");
    console.log("     • Interferencias electromagnéticas severas");
  }
  
  // Recomendaciones específicas
  console.log("\n💡 RECOMENDACIONES ESPECÍFICAS:");
  console.log("-".repeat(50));
  
  if (rssiPromedio > -90) {
    console.log("✅ El problema está en el ANEMÓMETRO:");
    console.log("1. 🔍 Verificar físicamente el anemómetro:");
    console.log("   - Comprobar si está encendido");
    console.log("   - Verificar nivel de batería");
    console.log("   - Acercar el anemómetro a la ESP");
    console.log("   - Reiniciar el anemómetro");
    console.log("");
    console.log("2. 📱 Usar app de escaneo BLE en el móvil:");
    console.log("   - Buscar dispositivos con nombre del anemómetro");
    console.log("   - Verificar si aparece en el escaneo");
    console.log("   - Si no aparece, el anemómetro está apagado/dañado");
  } else {
    console.log("❌ El problema está en la ESP:");
    console.log("1. 🔧 Verificar hardware de la ESP:");
    console.log("   - Comprobar conexiones de la antena BLE");
    console.log("   - Verificar alimentación estable de la ESP");
    console.log("   - Reiniciar completamente la ESP");
    console.log("");
    console.log("2. 🔄 Reflashear firmware:");
    console.log("   - Descargar firmware limpio");
    console.log("   - Reflashear la ESP completamente");
    console.log("   - Verificar configuración BLE");
  }
  
  console.log("\n3. 🔄 Continuar monitoreando:");
  console.log("   - Ejecutar: node monitor_ble_mqtt.js");
  console.log("   - Observar cambios en RSSI");
  console.log("   - Verificar si aparecen dispositivos en escaneos");
  
  console.log("\n" + "=".repeat(60));
  console.log("🧪 TEST COMPLETADO");
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
  console.log("\n🛑 Deteniendo test...");
  client.end();
  process.exit(0);
}); 