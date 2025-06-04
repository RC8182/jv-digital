// src/app/api/dashboard/agente/utils/promptBuilder.js

import { loadMemory } from './memory.js'; // Asegúrate de que esta ruta sea correcta para memory.js
import {systemPrompt} from './systemPrompt.js'; // Asumo que el systemPrompt está en la misma carpeta del agente

// La función buildMessages ahora acepta prismaClient como primer argumento
// Y el userQuestion ya no se pasa como argumento aquí, se inyecta al final en chat/route.js
export async function buildMessages(prismaClient, sessionId, userQuestion, existingMemory, docs) { 

let messages = [ systemPrompt ];

  // Cargar la memoria si no viene como existingMemory (limitado para el LLM)
  const memory = existingMemory || await loadMemory(prismaClient, sessionId); // Pasa prismaClient a loadMemory

  // Añadir la memoria conversacional al prompt
  memory.forEach(entry => {
    messages.push({ role: entry.role, content: entry.content });
  });

  // Si hay documentos relevantes de Qdrant, añadirlos al prompt
  // La variable `docs` ya es el resultado de searchDocs(question)
  if (docs && docs.length > 0) {
    const documentContext = docs.map(doc => `--- Documento: ${doc.filename} ---\n${doc.content}`).join('\n\n');
    messages.push({
      role: 'system',
      content: `El usuario ha hecho una pregunta. Considera la siguiente información adicional de documentos relevantes para responder si aplica:\n${documentContext}`
    });
  }

  // Añadir la pregunta actual del usuario
  messages.push({ role: 'user', content: userQuestion });

  return messages;
}