// diagnostico_ble_avanzado.js
// Diagnóstico avanzado para determinar si el problema está en el Bluetooth de la ESP o en el anemómetro

const mqtt = require('mqtt');

// Configuración MQTT
const BROKER = "mqtt://192.168.1.31";
const DATA_TOPIC = "anemometro/datos";
const CONTROL_TOPIC = "anemometro/control";

// Variables de diagnóstico
let resultadosDiagnostico = {
  esp_bluetooth_funcional: false,
  anemometro_detectado: false,
  anemometro_conectable: false,
  dispositivos_encontrados: [],
  errores_ble: [],
  rssi_historico: [],
  intentos_conexion: 0,
  ultima_conexion_exitosa: null
};

// Conectar al broker MQTT
const client = mqtt.connect(BROKER);

console.log("🔬 DIAGNÓSTICO AVANZADO BLE - ESP vs ANEMÓMETRO");
console.log("=".repeat(70));
console.log(`🌐 Broker MQTT: ${BROKER}`);
console.log(`📅 Inicio: ${new Date().toLocaleString('es-ES')}`);
console.log("=".repeat(70));

client.on('connect', () => {
  console.log("✅ Conectado al broker MQTT");
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
      source: "diagnostico_avanzado"
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

// Función para procesar mensajes de diagnóstico
function procesarMensajeDiagnostico(payload) {
  try {
    const data = JSON.parse(payload.toString());
    const sys = data.sys || {};
    
    // Extraer información relevante
    const bleOk = sys.ble_ok;
    const bleFails = sys.ble_fails;
    const rssi = sys.rssi_dBm;
    const uptime = sys.uptime_s;
    const resetCount = sys.reset_count;
    const resetReason = sys.reset_reason;
    
    // Guardar RSSI si está disponible
    if (rssi !== undefined) {
      resultadosDiagnostico.rssi_historico.push({
        valor: rssi,
        timestamp: Date.now(),
        ble_ok: bleOk
      });
    }
    
    // Analizar errores BLE
    if (bleFails !== undefined && bleFails > 0) {
      resultadosDiagnostico.errores_ble.push({
        fails: bleFails,
        timestamp: Date.now(),
        uptime: uptime
      });
    }
    
    // Verificar si hubo conexión exitosa
    if (bleOk === 1) {
      resultadosDiagnostico.ultima_conexion_exitosa = Date.now();
      console.log("✅ ¡Conexión BLE exitosa detectada!");
    }
    
    console.log(`📊 Estado actual - BLE: ${bleOk === 1 ? '✅ Conectado' : '❌ Desconectado'}, RSSI: ${rssi || 'N/A'}dBm`);
    
  } catch (error) {
    console.error("❌ Error procesando mensaje:", error.message);
  }
}

// Función para iniciar el diagnóstico completo
async function iniciarDiagnostico() {
  console.log("🔬 INICIANDO DIAGNÓSTICO COMPLETO...");
  console.log("");
  
  // Paso 1: Verificar estado inicial
  console.log("📋 PASO 1: Verificando estado inicial del sistema...");
  await enviarComandoControl('estado_detallado');
  await esperar(3000);
  
  // Paso 2: Escaneo BLE para detectar dispositivos
  console.log("\n📋 PASO 2: Realizando escaneo BLE...");
  console.log("🔍 Buscando dispositivos Bluetooth disponibles...");
  await enviarComandoControl('escaneo_ble', { duracion: 10000 });
  await esperar(12000);
  
  // Paso 3: Intentar reconexión BLE
  console.log("\n📋 PASO 3: Intentando reconexión BLE...");
  console.log("🔄 Forzando reconexión con el anemómetro...");
  await enviarComandoControl('reconectar_ble');
  await esperar(5000);
  
  // Paso 4: Verificar configuración BLE
  console.log("\n📋 PASO 4: Verificando configuración BLE...");
  await enviarComandoControl('config_ble');
  await esperar(3000);
  
  // Paso 5: Test de conectividad BLE
  console.log("\n📋 PASO 5: Realizando test de conectividad...");
  await enviarComandoControl('test_ble');
  await esperar(5000);
  
  // Paso 6: Análisis de resultados
  console.log("\n📋 PASO 6: Analizando resultados...");
  await esperar(2000);
  
  // Generar reporte final
  generarReporteDiagnostico();
}

// Función para esperar
function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para generar reporte de diagnóstico
function generarReporteDiagnostico() {
  console.log("\n" + "=".repeat(70));
  console.log("📊 REPORTE DE DIAGNÓSTICO BLE");
  console.log("=".repeat(70));
  
  // Análisis de RSSI
  if (resultadosDiagnostico.rssi_historico.length > 0) {
    const rssiValues = resultadosDiagnostico.rssi_historico.map(r => r.valor);
    const rssiPromedio = rssiValues.reduce((a, b) => a + b, 0) / rssiValues.length;
    const rssiMin = Math.min(...rssiValues);
    const rssiMax = Math.max(...rssiValues);
    
    console.log("\n📶 ANÁLISIS DE SEÑAL RSSI:");
    console.log(`   Promedio: ${rssiPromedio.toFixed(1)}dBm`);
    console.log(`   Mínimo: ${rssiMin}dBm`);
    console.log(`   Máximo: ${rssiMax}dBm`);
    
    // Interpretar RSSI
    if (rssiPromedio > -50) {
      console.log("   📡 Señal EXCELENTE - El anemómetro está muy cerca");
    } else if (rssiPromedio > -70) {
      console.log("   📡 Señal BUENA - El anemómetro está a distancia normal");
    } else if (rssiPromedio > -80) {
      console.log("   📡 Señal DÉBIL - El anemómetro puede estar lejos");
    } else {
      console.log("   📡 Señal MUY DÉBIL - El anemómetro está muy lejos o apagado");
    }
  }
  
  // Análisis de errores BLE
  if (resultadosDiagnostico.errores_ble.length > 0) {
    console.log("\n❌ ANÁLISIS DE ERRORES BLE:");
    const totalFails = resultadosDiagnostico.errores_ble.reduce((sum, err) => sum + err.fails, 0);
    console.log(`   Total de fallos BLE: ${totalFails}`);
    
    if (totalFails > 100) {
      console.log("   🔴 MUCHOS ERRORES - Posible problema en el hardware BLE de la ESP");
    } else if (totalFails > 50) {
      console.log("   🟡 ERRORES MODERADOS - Posible problema de configuración");
    } else {
      console.log("   🟢 POCOS ERRORES - El hardware BLE parece estar bien");
    }
  }
  
  // Análisis de conexiones
  console.log("\n🔗 ANÁLISIS DE CONEXIONES:");
  if (resultadosDiagnostico.ultima_conexion_exitosa) {
    const tiempoDesdeConexion = Date.now() - resultadosDiagnostico.ultima_conexion_exitosa;
    const minutosDesdeConexion = Math.floor(tiempoDesdeConexion / 60000);
    console.log(`   ✅ Última conexión exitosa: hace ${minutosDesdeConexion} minutos`);
    console.log("   🟢 El Bluetooth de la ESP funciona correctamente");
  } else {
    console.log("   ❌ No se detectaron conexiones exitosas recientes");
  }
  
  // Diagnóstico final
  console.log("\n🔬 DIAGNÓSTICO FINAL:");
  console.log("-".repeat(50));
  
  // Verificar si la ESP puede detectar dispositivos
  const rssiPromedio = resultadosDiagnostico.rssi_historico.length > 0 ? 
    resultadosDiagnostico.rssi_historico.reduce((sum, r) => sum + r.valor, 0) / resultadosDiagnostico.rssi_historico.length : -100;
  
  if (rssiPromedio > -90) {
    console.log("✅ El Bluetooth de la ESP está FUNCIONANDO");
    console.log("   - Puede detectar señales del anemómetro");
    console.log("   - El problema está en el anemómetro:");
    console.log("     • Posiblemente apagado");
    console.log("     • Sin batería");
    console.log("     • Fuera de rango");
    console.log("     • Fallo en el hardware del anemómetro");
  } else {
    console.log("❌ El Bluetooth de la ESP puede tener PROBLEMAS");
    console.log("   - No detecta señales del anemómetro");
    console.log("   - Posibles causas:");
    console.log("     • Hardware BLE dañado en la ESP");
    console.log("     • Problema de configuración BLE");
    console.log("     • Interferencias electromagnéticas");
  }
  
  // Recomendaciones
  console.log("\n💡 RECOMENDACIONES:");
  console.log("-".repeat(50));
  
  if (rssiPromedio > -90) {
    console.log("1. 🔍 Verificar físicamente el anemómetro:");
    console.log("   - Comprobar si está encendido");
    console.log("   - Verificar nivel de batería");
    console.log("   - Acercar el anemómetro a la ESP");
    console.log("   - Reiniciar el anemómetro");
    console.log("");
    console.log("2. 📱 Usar una app de escaneo BLE en el móvil");
    console.log("   - Buscar dispositivos con nombre similar al anemómetro");
    console.log("   - Verificar si aparece en el escaneo");
  } else {
    console.log("1. 🔧 Verificar el hardware de la ESP:");
    console.log("   - Comprobar conexiones de la antena BLE");
    console.log("   - Verificar alimentación de la ESP");
    console.log("   - Reiniciar completamente la ESP");
    console.log("");
    console.log("2. 📡 Verificar interferencias:");
    console.log("   - Mover la ESP lejos de fuentes de interferencia");
    console.log("   - Verificar otros dispositivos WiFi/BT cercanos");
  }
  
  console.log("\n3. 🔄 Continuar monitoreando:");
  console.log("   - Ejecutar: node monitor_ble_mqtt.js");
  console.log("   - Observar si hay cambios en el RSSI");
  console.log("   - Verificar si aparece el anemómetro en escaneos");
  
  console.log("\n" + "=".repeat(70));
  console.log("🔬 DIAGNÓSTICO COMPLETADO");
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