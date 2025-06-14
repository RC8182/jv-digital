// src/app/api/agente/utils/promptBuilder.js
import { loadMemory } from './memory.js';
import { construirSystemPrompt } from './systemPrompt.js';

/**
 * Construye el array de `messages` que se envía a OpenAI.
 *
 * @param {PrismaClient} prismaClient
 * @param {string}       sessionId
 * @param {string}       userId               ← NUEVO
 * @param {string}       userQuestion
 * @param {Array}        existingMemory
 * @param {Array}        docs
 * @returns {Promise<Array<{role: string, content: string}>>}
 */
export async function buildMessages(
  prismaClient,
  sessionId,
  userId,
  userQuestion,
  existingMemory = null,
  docs = []
) {
  // 1️⃣  System prompt dinámico
  const systemPrompt = await construirSystemPrompt(userId);
  const messages     = [systemPrompt];

  // 2️⃣  Memoria conversacional
  const memory =
    existingMemory || (await loadMemory(prismaClient, sessionId));

  memory.forEach((entry) =>
    messages.push({ role: entry.role, content: entry.content })
  );

  // 3️⃣  Contexto de documentos (RAG)
  if (docs.length) {
    const documentContext = docs
      .map(
        (doc) => `--- Documento: ${doc.filename} ---\n${doc.content}`
      )
      .join('\n\n');

    messages.push({
      role: 'system',
      content:
        'El usuario ha hecho una pregunta. Considera la siguiente información ' +
        'adicional de documentos relevantes para responder si aplica:\n' +
        documentContext
    });
  }

  // 4️⃣  Pregunta actual del usuario
  messages.push({ role: 'user', content: userQuestion });

  return messages;
}
