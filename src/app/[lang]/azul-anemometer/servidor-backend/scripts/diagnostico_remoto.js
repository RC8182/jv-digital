// diagnostico_remoto.js
// Script para consultar el diagnóstico del servidor remoto

const https = require('http');

const SERVER_URL = 'http://192.168.1.32:3000';

async function consultarDiagnostico(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${SERVER_URL}${endpoint}`;
    console.log(`🔍 Consultando: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Error parseando JSON: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`Error de conexión: ${error.message}`));
    });
  });
}

async function ejecutarDiagnosticoRemoto() {
  console.log("🔍 DIAGNÓSTICO REMOTO DEL ANEMÓMETRO");
  console.log("=".repeat(60));
  console.log(`🌐 Servidor: ${SERVER_URL}`);
  console.log(`📅 Fecha: ${new Date().toLocaleString('es-ES')}`);
  console.log("=".repeat(60));
  
  try {
    // 1. Verificar conectividad básica
    console.log("\n📡 Verificando conectividad...");
    const estado = await consultarDiagnostico('/api/anemometro/diagnostico/estado');
    
    console.log("✅ Servidor respondiendo correctamente");
    console.log(`📊 Estado actual:`);
    console.log(`   - Bluetooth: ${estado.bluetooth}`);
    console.log(`   - Datos: ${estado.datos}`);
    console.log(`   - RSSI: ${estado.rssi}dBm`);
    console.log(`   - Reset Count: ${estado.reset_count}`);
    console.log(`   - Timestamp: ${new Date(estado.timestamp).toLocaleString('es-ES')}`);
    
    // 2. Diagnóstico completo
    console.log("\n🔍 Ejecutando diagnóstico completo...");
    const diagnostico = await consultarDiagnostico('/api/anemometro/diagnostico');
    
    console.log(`\n📋 RESUMEN DEL DIAGNÓSTICO`);
    console.log("=".repeat(50));
    console.log(`Estado General: ${diagnostico.estado.toUpperCase()}`);
    console.log(`Problemas Detectados: ${diagnostico.problemas.length}`);
    
    if (diagnostico.problemas.length > 0) {
      console.log("\n🚨 PROBLEMAS DETECTADOS:");
      diagnostico.problemas.forEach((problema, index) => {
        console.log(`  ${index + 1}. [${problema.severidad.toUpperCase()}] ${problema.descripcion}`);
        console.log(`     Timestamp: ${new Date(problema.timestamp).toLocaleString('es-ES')}`);
      });
    } else {
      console.log("\n✅ No se detectaron problemas críticos");
    }
    
    if (diagnostico.recomendaciones.length > 0) {
      console.log("\n💡 RECOMENDACIONES:");
      diagnostico.recomendaciones.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
    
    // 3. Estadísticas
    if (diagnostico.datos.stats24h) {
      console.log("\n📊 ESTADÍSTICAS (24h):");
      console.log(`   - Total datos: ${diagnostico.datos.stats24h.total_datos || 0}`);
      console.log(`   - Última hora: ${diagnostico.datos.stats24h.datos_ultima_hora || 0}`);
      console.log(`   - Primer dato: ${diagnostico.datos.stats24h.primer_dato || 'N/A'}`);
      console.log(`   - Último dato: ${diagnostico.datos.stats24h.ultimo_dato || 'N/A'}`);
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ DIAGNÓSTICO REMOTO COMPLETADO");
    console.log("=".repeat(60));
    
  } catch (error) {
    console.error("\n❌ ERROR EN EL DIAGNÓSTICO:");
    console.error(error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log("\n💡 Posibles soluciones:");
      console.log("   1. Verificar que el servidor esté corriendo en 192.168.1.32:3000");
      console.log("   2. Verificar conectividad de red");
      console.log("   3. Verificar firewall");
    }
  }
}

// Ejecutar diagnóstico
ejecutarDiagnosticoRemoto(); 