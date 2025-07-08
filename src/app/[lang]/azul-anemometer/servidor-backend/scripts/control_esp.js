// control_esp.js
// Script para controlar la ESP del anemómetro desde la máquina local

const https = require('http');

const SERVER_URL = 'http://192.168.1.32:3000';

async function enviarComando(endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const url = `${SERVER_URL}${endpoint}`;
    console.log(`🔧 Enviando comando: ${endpoint}`);
    
    const options = {
      hostname: '192.168.1.32',
      port: 3000,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
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
          reject(new Error(`Error parseando respuesta: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Error de conexión: ${error.message}`));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function listarComandos() {
  try {
    const response = await fetch(`${SERVER_URL}/api/anemometro/control/comandos`);
    const data = await response.json();
    
    console.log("📋 COMANDOS DISPONIBLES:");
    console.log("=".repeat(50));
    data.comandos.forEach((cmd, index) => {
      console.log(`${index + 1}. ${cmd.comando}`);
      console.log(`   Descripción: ${cmd.descripcion}`);
      console.log(`   Endpoint: ${cmd.endpoint}`);
      if (cmd.body) {
        console.log(`   Body: ${JSON.stringify(cmd.body)}`);
      }
      console.log("");
    });
    
    console.log(`🌐 Broker MQTT: ${data.broker}`);
    console.log(`📡 Topic: ${data.topic}`);
    
  } catch (error) {
    console.error("❌ Error listando comandos:", error.message);
  }
}

async function reiniciarESP() {
  try {
    console.log("🔄 Reiniciando ESP...");
    const resultado = await enviarComando('/api/anemometro/control/reiniciar');
    
    if (resultado.success) {
      console.log("✅ Comando de reinicio enviado correctamente");
      console.log(`📅 Timestamp: ${new Date(resultado.timestamp).toLocaleString('es-ES')}`);
      console.log("⏳ La ESP se reiniciará en unos segundos...");
    } else {
      console.error("❌ Error enviando comando de reinicio");
    }
    
  } catch (error) {
    console.error("❌ Error reiniciando ESP:", error.message);
  }
}

async function reconectarBluetooth() {
  try {
    console.log("📱 Reconectando Bluetooth...");
    const resultado = await enviarComando('/api/anemometro/control/reconectar-ble');
    
    if (resultado.success) {
      console.log("✅ Comando de reconexión Bluetooth enviado");
      console.log(`📅 Timestamp: ${new Date(resultado.timestamp).toLocaleString('es-ES')}`);
      console.log("⏳ Intentando reconectar con el sensor...");
    } else {
      console.error("❌ Error enviando comando de reconexión");
    }
    
  } catch (error) {
    console.error("❌ Error reconectando Bluetooth:", error.message);
  }
}

async function escanearBluetooth() {
  try {
    console.log("🔍 Escaneando dispositivos Bluetooth...");
    const resultado = await enviarComando('/api/anemometro/control/escaneo-ble');
    
    if (resultado.success) {
      console.log("✅ Comando de escaneo enviado");
      console.log(`📅 Timestamp: ${new Date(resultado.timestamp).toLocaleString('es-ES')}`);
      console.log("⏳ Escaneando dispositivos disponibles...");
    } else {
      console.error("❌ Error enviando comando de escaneo");
    }
    
  } catch (error) {
    console.error("❌ Error escaneando Bluetooth:", error.message);
  }
}

async function obtenerEstadoDetallado() {
  try {
    console.log("📊 Solicitando estado detallado...");
    const resultado = await enviarComando('/api/anemometro/control/estado');
    
    if (resultado.success) {
      console.log("✅ Comando de estado enviado");
      console.log(`📅 Timestamp: ${new Date(resultado.timestamp).toLocaleString('es-ES')}`);
      console.log("⏳ Obteniendo información detallada...");
    } else {
      console.error("❌ Error enviando comando de estado");
    }
    
  } catch (error) {
    console.error("❌ Error obteniendo estado:", error.message);
  }
}

async function configurarParametro(parametro, valor) {
  try {
    console.log(`⚙️ Configurando ${parametro} = ${valor}...`);
    const resultado = await enviarComando('/api/anemometro/control/configurar', {
      parametro,
      valor
    });
    
    if (resultado.success) {
      console.log("✅ Comando de configuración enviado");
      console.log(`📅 Timestamp: ${new Date(resultado.timestamp).toLocaleString('es-ES')}`);
      console.log(`🔧 Parámetro: ${resultado.parametro} = ${resultado.valor}`);
    } else {
      console.error("❌ Error enviando comando de configuración");
    }
    
  } catch (error) {
    console.error("❌ Error configurando parámetro:", error.message);
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  const comando = args[0];
  
  console.log("🔧 CONTROL REMOTO DE LA ESP DEL ANEMÓMETRO");
  console.log("=".repeat(60));
  console.log(`🌐 Servidor: ${SERVER_URL}`);
  console.log(`📅 Fecha: ${new Date().toLocaleString('es-ES')}`);
  console.log("=".repeat(60));
  
  switch (comando) {
    case 'reiniciar':
      await reiniciarESP();
      break;
      
    case 'reconectar':
      await reconectarBluetooth();
      break;
      
    case 'escaneo':
      await escanearBluetooth();
      break;
      
    case 'estado':
      await obtenerEstadoDetallado();
      break;
      
    case 'configurar':
      const parametro = args[1];
      const valor = args[2];
      if (!parametro || valor === undefined) {
        console.error("❌ Uso: node control_esp.js configurar <parametro> <valor>");
        process.exit(1);
      }
      await configurarParametro(parametro, valor);
      break;
      
    case 'comandos':
      await listarComandos();
      break;
      
    case 'ayuda':
    case 'help':
    case '--help':
    case '-h':
      mostrarAyuda();
      break;
      
    default:
      console.log("❌ Comando no reconocido. Usa 'ayuda' para ver opciones disponibles.");
      mostrarAyuda();
      break;
  }
}

function mostrarAyuda() {
  console.log("🔧 CONTROL REMOTO DE LA ESP");
  console.log("=".repeat(50));
  console.log("Uso:");
  console.log("  node control_esp.js <comando> [opciones]");
  console.log("");
  console.log("Comandos:");
  console.log("  reiniciar           - Reiniciar la ESP completamente");
  console.log("  reconectar          - Forzar reconexión Bluetooth");
  console.log("  escaneo             - Escanear dispositivos Bluetooth");
  console.log("  estado              - Obtener estado detallado");
  console.log("  configurar p v      - Configurar parámetro p = valor v");
  console.log("  comandos            - Listar todos los comandos disponibles");
  console.log("  ayuda               - Mostrar esta ayuda");
  console.log("");
  console.log("Ejemplos:");
  console.log("  node control_esp.js reiniciar");
  console.log("  node control_esp.js reconectar");
  console.log("  node control_esp.js configurar intervalo_s 10");
  console.log("  node control_esp.js comandos");
  console.log("=".repeat(50));
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(error => {
    console.error("❌ Error fatal:", error.message);
    process.exit(1);
  });
}

module.exports = {
  reiniciarESP,
  reconectarBluetooth,
  escanearBluetooth,
  obtenerEstadoDetallado,
  configurarParametro
}; 