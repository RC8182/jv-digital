// src/lib/prisma.js
import { PrismaClient } from '@prisma/client';

// Declarar una variable global para almacenar la instancia de PrismaClient
// Esto es para evitar instanciar múltiples clientes en desarrollo debido al hot-reloading de Next.js
// y asegurar una única conexión a la base de datos.
const globalForPrisma = global; // Define 'globalForPrisma' para no chocar con 'global' si ya existe

let prisma;

if (process.env.NODE_ENV === 'production') {
  // En producción, siempre creamos una nueva instancia
  prisma = new PrismaClient();
  console.log('DEBUG: PrismaClient creado en producción.');
} else {
  // En desarrollo, reutilizamos la instancia si ya existe en 'global'
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
    console.log('DEBUG: PrismaClient creado y almacenado en global (desarrollo).');
  }
  prisma = globalForPrisma.prisma;
  console.log('DEBUG: PrismaClient reutilizado desde global (desarrollo).');
}

// Verifica que el objeto prisma esté definido antes de exportar
console.log('DEBUG: PrismaClient final exportado:', prisma ? 'DEFINIDO' : 'UNDEFINED');

export default prisma;