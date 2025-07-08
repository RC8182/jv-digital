// verificar_reinicio.js
// Script para verificar si la ESP se ha reiniciado analizando los logs

const https = require('http');

const SERVER_URL = 'http://192.168.1.32:3000';

async function obtenerLogs() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '192.168.1.32',
      port: 3000,
      path: '/api/anemometro/logs',
      method: 'GET'
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Error parseando logs: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Error de conexión: ${error.message}`));
    });
    
    req.end();
  });
}

async function verificarReinicio() {
  console.log("🔍 VERIFICANDO REINICIOS DE LA ESP");
  console.log("=".repeat(60));
  console.log(`🌐 Servidor: ${SERVER_URL}`);
  console.log(`📅 Fecha: ${new Date().toLocaleString('es-ES')}`);
  console.log("=".repeat(60));
  
  try {
    // Obtener logs del sistema
    console.log("\n📋 Obteniendo logs del sistema...");
    const logs = await obtenerLogs();
    
    if (!logs || logs.length === 0) {
      console.log("❌ No hay logs disponibles");
      return;
    }
    
    console.log(`✅ Se obtuvieron ${logs.length} logs del sistema`);
    
    // Analizar los últimos 20 logs
    const ultimosLogs = logs.slice(0, 20);
    
    console.log("\n📊 ANÁLISIS DE LOS ÚLTIMOS LOGS:");
    console.log("-".repeat(50));
    
    let reiniciosDetectados = 0;
    let ultimoResetCount = null;
    let ultimoResetReason = null;
    
    ultimosLogs.forEach((log, index) => {
      const timestamp = new Date(log.timestamp).toLocaleString('es-ES');
      const resetCount = log.reset_count;
      const resetReason = log.reset_reason;
      const bleOk = log.ble_ok;
      const uptime = log.uptime_s;
      
      console.log(`${index + 1}. ${timestamp}`);
      console.log(`   Reset Count: ${resetCount || 'N/A'}`);
      console.log(`   Reset Reason: ${resetReason || 'N/A'}`);
      console.log(`   BLE OK: ${bleOk === 1 ? '✅' : '❌'}`);
      console.log(`   Uptime: ${uptime ? Math.floor(uptime/60) + 'min' : 'N/A'}`);
      
      // Detectar cambios en reset_count (posible reinicio)
      if (ultimoResetCount !== null && resetCount !== null) {
        if (resetCount !== ultimoResetCount) {
          console.log(`   🔄 POSIBLE REINICIO DETECTADO!`);
          console.log(`      Reset Count cambió de ${ultimoResetCount} a ${resetCount}`);
          reiniciosDetectados++;
        }
      }
      
      // Detectar uptime bajo (indicador de reinicio reciente)
      if (uptime && uptime < 300) { // Menos de 5 minutos
        console.log(`   ⚡ UPTIME BAJO - Posible reinicio reciente`);
      }
      
      ultimoResetCount = resetCount;
      ultimoResetReason = resetReason;
      console.log("");
    });
    
    // Análisis de patrones
    console.log("🔍 ANÁLISIS DE PATRONES:");
    console.log("-".repeat(50));
    
    const logsConResetCount = ultimosLogs.filter(log => log.reset_count !== null);
    const logsConResetReason = ultimosLogs.filter(log => log.reset_reason !== null);
    
    if (logsConResetCount.length > 0) {
      const resetCounts = logsConResetCount.map(log => log.reset_count);
      const maxResetCount = Math.max(...resetCounts);
      const minResetCount = Math.min(...resetCounts);
      
      console.log(`📈 Reset Count - Mínimo: ${minResetCount}, Máximo: ${maxResetCount}`);
      
      if (maxResetCount > minResetCount) {
        console.log(`🔄 Se detectaron ${maxResetCount - minResetCount} reinicios en este período`);
      } else {
        console.log(`✅ No se detectaron reinicios en este período`);
      }
    }
    
    if (logsConResetReason.length > 0) {
      const resetReasons = [...new Set(logsConResetReason.map(log => log.reset_reason))];
      console.log(`📋 Razones de reinicio encontradas: ${resetReasons.join(', ')}`);
    }
    
    // Análisis de uptime
    const logsConUptime = ultimosLogs.filter(log => log.uptime_s !== null);
    if (logsConUptime.length > 0) {
      const uptimes = logsConUptime.map(log => log.uptime_s);
      const maxUptime = Math.max(...uptimes);
      const minUptime = Math.min(...uptimes);
      
      console.log(`⏱️  Uptime - Mínimo: ${Math.floor(minUptime/60)}min, Máximo: ${Math.floor(maxUptime/60)}min`);
      
      if (minUptime < 300) { // Menos de 5 minutos
        console.log(`⚠️  Se detectó uptime bajo (${Math.floor(minUptime/60)}min) - Posible reinicio reciente`);
      }
    }
    
    // Análisis de Bluetooth
    const logsConBLE = ultimosLogs.filter(log => log.ble_ok !== null);
    if (logsConBLE.length > 0) {
      const bleStatus = logsConBLE.map(log => log.ble_ok);
      const bleConectado = bleStatus.filter(status => status === 1).length;
      const bleDesconectado = bleStatus.filter(status => status === 0).length;
      
      console.log(`📱 Estado Bluetooth - Conectado: ${bleConectado}, Desconectado: ${bleDesconectado}`);
      
      if (bleDesconectado > bleConectado) {
        console.log(`❌ Bluetooth mayormente desconectado - Problema persistente`);
      }
    }
    
    // Resumen
    console.log("\n📋 RESUMEN:");
    console.log("-".repeat(50));
    
    if (reiniciosDetectados > 0) {
      console.log(`🔄 Se detectaron ${reiniciosDetectados} posibles reinicios`);
    } else {
      console.log(`✅ No se detectaron reinicios en el período analizado`);
    }
    
    const ultimoLog = ultimosLogs[0];
    if (ultimoLog) {
      console.log(`📅 Último log: ${new Date(ultimoLog.timestamp).toLocaleString('es-ES')}`);
      console.log(`🔢 Último Reset Count: ${ultimoLog.reset_count || 'N/A'}`);
      console.log(`📝 Último Reset Reason: ${ultimoLog.reset_reason || 'N/A'}`);
      console.log(`📱 Último BLE Status: ${ultimoLog.ble_ok === 1 ? 'Conectado' : 'Desconectado'}`);
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ ANÁLISIS DE REINICIOS COMPLETADO");
    console.log("=".repeat(60));
    
  } catch (error) {
    console.error("\n❌ ERROR EN EL ANÁLISIS:");
    console.error(error.message);
  }
}

// Ejecutar análisis
verificarReinicio(); 