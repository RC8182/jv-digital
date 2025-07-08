#!/usr/bin/env node
// start.js
/**********************************************************************************
 * start.js – Script de inicio del servidor con diagnóstico automático
 **********************************************************************************/

const { spawn } = require('child_process');
const path = require('path');

console.log("🚀 INICIANDO SERVIDOR DEL ANEMÓMETRO CON DIAGNÓSTICO");
console.log("=".repeat(60));

// Función para ejecutar diagnóstico
async function ejecutarDiagnostico() {
  return new Promise((resolve, reject) => {
    console.log("\n🔍 Ejecutando diagnóstico previo...");
    
    const diagnostico = spawn('node', ['diagnostico.js'], {
      cwd: __dirname,
      stdio: 'pipe'
    });
    
    diagnostico.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    diagnostico.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    diagnostico.on('close', (code) => {
      if (code === 0) {
        console.log("✅ Diagnóstico completado");
        resolve();
      } else {
        console.log(`⚠️ Diagnóstico terminó con código ${code}`);
        resolve(); // Continuar aunque haya errores
      }
    });
    
    diagnostico.on('error', (error) => {
      console.error("❌ Error ejecutando diagnóstico:", error.message);
      resolve(); // Continuar aunque haya errores
    });
  });
}

// Función para iniciar el servidor
function iniciarServidor() {
  console.log("\n🌐 Iniciando servidor...");
  
  const server = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit'
  });
  
  server.on('error', (error) => {
    console.error("❌ Error iniciando servidor:", error.message);
    process.exit(1);
  });
  
  server.on('close', (code) => {
    console.log(`\n🛑 Servidor terminado con código ${code}`);
    process.exit(code);
  });
  
  // Manejar señales para cerrar limpiamente
  process.on('SIGINT', () => {
    console.log("\n🛑 Recibida señal SIGINT, cerrando servidor...");
    server.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log("\n🛑 Recibida señal SIGTERM, cerrando servidor...");
    server.kill('SIGTERM');
  });
}

// Función principal
async function main() {
  try {
    // Ejecutar diagnóstico previo
    await ejecutarDiagnostico();
    
    // Esperar un momento antes de iniciar el servidor
    console.log("\n⏳ Esperando 3 segundos antes de iniciar el servidor...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Iniciar el servidor
    iniciarServidor();
    
  } catch (error) {
    console.error("❌ Error fatal:", error.message);
    process.exit(1);
  }
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--no-diagnostico')) {
  console.log("⚠️ Diagnóstico previo deshabilitado");
  iniciarServidor();
} else if (args.includes('--solo-diagnostico')) {
  console.log("🔍 Ejecutando solo diagnóstico");
  ejecutarDiagnostico().then(() => {
    console.log("✅ Diagnóstico completado, saliendo...");
    process.exit(0);
  });
} else if (args.includes('--help') || args.includes('-h')) {
  console.log("🔍 SCRIPT DE INICIO DEL ANEMÓMETRO");
  console.log("=".repeat(50));
  console.log("Uso:");
  console.log("  node start.js [opciones]");
  console.log("");
  console.log("Opciones:");
  console.log("  --no-diagnostico    - Iniciar servidor sin diagnóstico previo");
  console.log("  --solo-diagnostico  - Ejecutar solo diagnóstico y salir");
  console.log("  --help, -h          - Mostrar esta ayuda");
  console.log("");
  console.log("Por defecto ejecuta diagnóstico previo y luego inicia el servidor");
  console.log("=".repeat(50));
  process.exit(0);
} else {
  // Comportamiento por defecto
  main();
} 