// ejecutarDiagnostico.js
/**********************************************************************************
 * ejecutarDiagnostico.js – Script para ejecutar diagnóstico manual desde el servidor
 **********************************************************************************/

const { diagnosticarDispositivo } = require("./diagnostico");
const AnemometroMonitor = require("./monitor");

async function ejecutarDiagnosticoCompleto() {
  console.log("=".repeat(60));
  console.log("🔍 DIAGNÓSTICO MANUAL DEL ANEMÓMETRO");
  console.log("=".repeat(60));
  console.log(`📅 Fecha: ${new Date().toLocaleString('es-ES')}`);
  console.log(`🖥️  Servidor: ${process.env.HOSTNAME || 'localhost'}`);
  console.log("=".repeat(60));
  
  try {
    // 1. Diagnóstico básico
    console.log("\n📊 EJECUTANDO DIAGNÓSTICO BÁSICO...");
    await diagnosticarDispositivo();
    
    // 2. Diagnóstico avanzado con monitoreo
    console.log("\n🚀 EJECUTANDO DIAGNÓSTICO AVANZADO...");
    const monitor = new AnemometroMonitor();
    const resultado = await monitor.verificarEstado();
    
    console.log("\n" + "=".repeat(60));
    console.log("📋 RESUMEN DEL DIAGNÓSTICO");
    console.log("=".repeat(60));
    console.log(`Estado General: ${resultado.estado.toUpperCase()}`);
    console.log(`Problemas Detectados: ${resultado.problemas.length}`);
    console.log(`Timestamp: ${resultado.timestamp}`);
    
    if (resultado.problemas.length > 0) {
      console.log("\n🚨 PROBLEMAS DETECTADOS:");
      resultado.problemas.forEach((problema, index) => {
        console.log(`  ${index + 1}. [${problema.severidad.toUpperCase()}] ${problema.descripcion}`);
        console.log(`     Timestamp: ${problema.timestamp}`);
        if (problema.valor) {
          console.log(`     Valor: ${problema.valor}`);
        }
      });
    } else {
      console.log("\n✅ No se detectaron problemas críticos");
    }
    
    // 3. Estado del monitoreo
    const estadoMonitor = monitor.obtenerEstado();
    console.log("\n📊 ESTADO DEL MONITOREO:");
    console.log(`Última Verificación: ${estadoMonitor.ultimaVerificacion || 'N/A'}`);
    console.log(`Alertas Activas: ${estadoMonitor.alertasActivas}`);
    console.log(`Intervalo de Verificación: ${estadoMonitor.configuracion.intervaloVerificacion / 60000} minutos`);
    
    // 4. Alertas recientes
    const alertas = monitor.obtenerAlertas();
    if (alertas.length > 0) {
      console.log("\n🚨 ALERTAS RECIENTES:");
      alertas.slice(-5).forEach((alerta, index) => {
        console.log(`  ${index + 1}. [${alerta.timestamp}] ${alerta.mensaje}`);
      });
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ DIAGNÓSTICO COMPLETADO");
    console.log("=".repeat(60));
    
  } catch (error) {
    console.error("\n❌ ERROR EN EL DIAGNÓSTICO:");
    console.error(error.message);
    console.error("\nStack trace:", error.stack);
  }
}

// Función para diagnóstico rápido
async function diagnosticoRapido() {
  console.log("🔍 DIAGNÓSTICO RÁPIDO DEL ANEMÓMETRO");
  console.log("=".repeat(50));
  
  try {
    const monitor = new AnemometroMonitor();
    const resultado = await monitor.verificarEstado();
    
    console.log(`Estado: ${resultado.estado.toUpperCase()}`);
    console.log(`Problemas: ${resultado.problemas.length}`);
    
    if (resultado.problemas.length > 0) {
      console.log("\nProblemas críticos:");
      resultado.problemas
        .filter(p => p.severidad === 'alta')
        .forEach(p => console.log(`- ${p.descripcion}`));
    } else {
      console.log("✅ Sistema operativo");
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Función para monitoreo continuo
async function monitoreoContinuo(intervaloMinutos = 5) {
  console.log(`🚀 INICIANDO MONITOREO CONTINUO (cada ${intervaloMinutos} minutos)`);
  console.log("Presiona Ctrl+C para detener");
  console.log("=".repeat(50));
  
  const monitor = new AnemometroMonitor();
  monitor.config.intervaloVerificacion = intervaloMinutos * 60 * 1000;
  
  try {
    await monitor.iniciarMonitoreo();
    
    // Mantener el proceso activo
    process.on('SIGINT', () => {
      console.log("\n🛑 Monitoreo detenido por el usuario");
      process.exit(0);
    });
    
  } catch (error) {
    console.error("❌ Error en monitoreo:", error.message);
  }
}

// Manejo de argumentos de línea de comandos
const args = process.argv.slice(2);
const comando = args[0];

switch (comando) {
  case 'rapido':
    diagnosticoRapido().then(() => process.exit(0));
    break;
    
  case 'monitor':
    const intervalo = parseInt(args[1]) || 5;
    monitoreoContinuo(intervalo);
    break;
    
  case 'completo':
  default:
    ejecutarDiagnosticoCompleto().then(() => process.exit(0));
    break;
}

// Si no hay argumentos, mostrar ayuda
if (args.length === 0) {
  console.log("🔍 SCRIPT DE DIAGNÓSTICO DEL ANEMÓMETRO");
  console.log("=".repeat(50));
  console.log("Uso:");
  console.log("  node ejecutarDiagnostico.js [comando] [opciones]");
  console.log("");
  console.log("Comandos:");
  console.log("  completo    - Diagnóstico completo (por defecto)");
  console.log("  rapido      - Diagnóstico rápido");
  console.log("  monitor [n] - Monitoreo continuo cada n minutos (default: 5)");
  console.log("");
  console.log("Ejemplos:");
  console.log("  node ejecutarDiagnostico.js");
  console.log("  node ejecutarDiagnostico.js rapido");
  console.log("  node ejecutarDiagnostico.js monitor 10");
  console.log("=".repeat(50));
  
  // Ejecutar diagnóstico completo por defecto
  ejecutarDiagnosticoCompleto().then(() => process.exit(0));
} 