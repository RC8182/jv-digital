// src/app/api/agente/utils/memory.js

// Ya NO IMPORTAMOS PRISMA AQUÍ DIRECTAMENTE:
// import prisma from '@/lib/prisma';
// NO hay `console.log` para prisma aquí, ya que no lo importamos directamente.

/**
 * Guarda un mensaje en la base de datos para la memoria conversacional.
 * @param {Object} prismaClient - Instancia de PrismaClient.
 * @param {string} sessionId - ID de la sesión de chat.
 * @param {'user' | 'assistant' | 'function'} role - Rol del mensaje.
 * @param {string} content - Contenido del mensaje.
 * @returns {Promise<Object>} El mensaje guardado.
 */
export async function saveMessage(prismaClient, sessionId, role, content) {
  try {
    const message = await prismaClient.memoryEntry.create({ // Asegúrate de que tu modelo se llama MemoryEntry
      data: {
        sessionId: sessionId,
        role: role,
        content: content,
        createdAt: new Date(), // Usar createdAt en lugar de timestamp si es el nombre de tu campo
      },
    });
    // console.log(`Memoria: Mensaje de ${role} guardado (ID: ${message.id}).`);
    return message;
  } catch (error) {
    console.error('Memoria: Error al guardar mensaje:', error);
    throw error;
  }
}

/**
 * Carga la memoria conversacional para una sesión.
 * Por defecto, carga los últimos 10 mensajes.
 * @param {Object} prismaClient - Instancia de PrismaClient.
 * @param {string} sessionId - ID de la sesión de chat.
 * @param {number} limit - Número máximo de mensajes a cargar para el LLM.
 * @returns {Promise<Array<Object>>} Array de mensajes (role, content).
 */
export async function loadMemory(prismaClient, sessionId, limit = 10) {
  try {
    const messages = await prismaClient.memoryEntry.findMany({ // Asegúrate de que tu modelo se llama MemoryEntry
      where: { sessionId: sessionId },
      orderBy: { createdAt: 'asc' }, // Usar createdAt en lugar de timestamp
      take: -limit, // Esto toma los últimos 'limit' mensajes
    });
    // console.log(`Memoria: Cargados ${messages.length} mensajes para la sesión ${sessionId}.`);
    return messages.map(msg => ({ role: msg.role, content: msg.content }));
  } catch (error) {
    console.error('Memoria: Error al cargar memoria:', error);
    return [];
  }
}

/**
 * Carga todo el historial de mensajes de una sesión.
 * @param {Object} prismaClient - Instancia de PrismaClient.
 * @param {string} sessionId - ID de la sesión de chat.
 * @returns {Promise<Array<Object>>} Array de todos los mensajes (con sus IDs y metadata).
 */
export async function getAllMessages(prismaClient, sessionId) {
  try {
    console.log('DEBUG (memory.js - getAllMessages): Intentando usar prismaClient:', prismaClient ? 'DEFINIDO' : 'UNDEFINED'); // <-- AÑADIDO DEBUG FINAL
    const messages = await prismaClient.memoryEntry.findMany({ // Asegúrate de que tu modelo se llama MemoryEntry
      where: { sessionId: sessionId },
      orderBy: { createdAt: 'asc' }, // Usar createdAt en lugar de timestamp
    });
    console.log(`Memoria: Cargados TODO el historial de ${messages.length} mensajes para la sesión ${sessionId}.`);
    return messages; // Devuelve el objeto completo del mensaje incluyendo ID
  } catch (error) {
    console.error('Memoria: Error al cargar todo el historial:', error);
    throw error; // Propagar el error para que la ruta de API pueda manejarlo
  }
}

/**
 * Elimina un mensaje específico de la memoria por su ID.
 * @param {Object} prismaClient - Instancia de PrismaClient.
 * @param {number} messageId - ID único del mensaje a eliminar.
 * @returns {Promise<Object>} El mensaje eliminado.
 */
export async function deleteMessageById(prismaClient, messageId) {
  try {
    const deletedMessage = await prismaClient.memoryEntry.delete({ // Asegúrate de que tu modelo se llama MemoryEntry
      where: { id: messageId },
    });
    console.log(`Memoria: Mensaje (ID: ${messageId}) eliminado.`);
    return deletedMessage;
  } catch (error) {
    console.error(`Memoria: Error al eliminar mensaje con ID ${messageId}:`, error);
    throw error;
  }
}

/**
 * Borra toda la memoria conversacional de una sesión.
 * @param {Object} prismaClient - Instancia de PrismaClient.
 * @param {string} sessionId - ID de la sesión de chat.
 * @returns {Promise<number>} Número de mensajes eliminados.
 */
export async function clearSessionMemory(prismaClient, sessionId) {
  try {
    const { count } = await prismaClient.memoryEntry.deleteMany({ // Asegúrate de que tu modelo se llama MemoryEntry
      where: { sessionId: sessionId },
    });
    console.log(`Memoria: Borrados ${count} mensajes para la sesión ${sessionId}.`);
    return count;
  } catch (error) {
    console.error(`Memoria: Error al borrar la sesión ${sessionId}:`, error);
    throw error;
  }
}