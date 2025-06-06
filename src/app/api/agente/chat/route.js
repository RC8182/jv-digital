// src/app/api/agente/chat/route.js

import { NextResponse }     from 'next/server';
import OpenAI               from 'openai';
import { getServerSession } from 'next-auth/next';
import { authOptions }      from '@/app/api/auth/[...nextauth]/route';

import { saveMessage, loadMemory } from '../utils/memory.js';
// La función searchDocs importada aquí es la general, ahora usaremos searchDocs desde Events.js
// import { searchDocs }              from '../utils/qdrant.js';
import { buildMessages }           from '../utils/promptBuilder.js';

import * as Events   from './events.js'; // Ahora Events.js incluye también las funciones de Gastos
import * as Tasks    from './tasks.js';
import prisma from '@/lib/prisma.js';

export const runtime = 'nodejs';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


// Juntamos todas las funciones
const functions = [
  ...Events.functions,
  ...Tasks.functions,
  {
    name: 'plan_week',
    description: 'Sugiere planificación semanal combinando tareas y eventos',
    parameters: {
      type: 'object',
      properties: { weekStart: { type: 'string', format: 'date' } },
      required: ['weekStart']
    }
  }
];

export async function POST(req) {
  const { query, sessionId, userId: bodyUserId, accessToken: bodyAccessToken, refreshToken: bodyRefreshToken } = await req.json();

  if (!query || !sessionId) {
    return NextResponse.json({ error: 'Faltan parámetros básicos (query o sessionId).' }, { status: 400 });
  }

  const session = await getServerSession(authOptions);

  let finalUserId = bodyUserId || session?.user?.id;
  let finalAccessToken = bodyAccessToken || session?.accessToken;
  let finalRefreshToken = bodyRefreshToken || session?.refreshToken;

  if (!finalUserId) {
      console.error('CHAT ROUTE: No se pudo determinar el ID de usuario desde el cuerpo ni la sesión.');
      return NextResponse.json({ error: 'User ID not found or provided.' }, { status: 401 });
  }

  console.log('CHAT ROUTE: Datos de usuario disponibles:', {
    userId: finalUserId,
    accessToken: finalAccessToken ? 'presente' : 'ausente',
    refreshToken: finalRefreshToken ? 'presente' : 'ausente'
  });

  // Nota: La función buildMessages ahora no recibe `searchDocs` directamente,
  // sino que `Events.search_expenses` la llamará si el LLM lo indica.
  // Para la búsqueda general de RAG que ya tenías, habría que ver dónde se usa
  // `searchDocs` y si es preferible llamarla desde `buildMessages` o como una herramienta.
  // Por ahora, asumimos que si quieres buscar sobre gastos, el agente usará `search_expenses`.
  const memory = await loadMemory(prisma, sessionId);
  // La búsqueda general de docs para RAG (si tienes un searchDocs fuera de tools)
  // necesita ser revisada si quieres que use `expenses-pdfs` o la colección `pdfs`.
  // Por simplicidad, por ahora `buildMessages` no usará `searchDocs` directamente para la query inicial.
  // Si necesitas que la query inicial del usuario también busque en Qdrant (fuera de una tool call),
  // deberías considerar si esa búsqueda también debe ser en 'expenses-pdfs' o en una colección general.
  const docs = []; // Inicialmente vacío, si la búsqueda general no es una herramienta.
  // Si tu `buildMessages` ya usa `searchDocs(query)` globalmente, se mantendrá.
  // Si quieres que el searchDocs GLOBAL también use expenses-pdfs, deberías modificarlo también.
  // Por ahora, solo modificamos la tool_call de `search_expenses`.
  let messages = await buildMessages(prisma, sessionId, query, memory, docs);


  try {
    while (true) {
      const completion = await openai.chat.completions.create({
        model:         'gpt-4o-mini',
        messages:      messages,
        functions,
        function_call: 'auto'
      });

      const msg = completion.choices[0].message;

      if (msg.function_call) {
        const { name, arguments: argStr } = msg.function_call;
        let args;
        try {
          args = JSON.parse(argStr);
        } catch (parseError) {
          console.error(`CHAT ROUTE: Error al parsear argumentos para ${name}:`, argStr, parseError);
          messages.push(msg);
          messages.push({
            role: 'function',
            name: name,
            content: JSON.stringify({ error: `Argumentos inválidos: ${parseError.message}` })
          });
          continue;
        }

        let result;
        try {
          // *** AÑADIR LA LÓGICA PARA search_expenses ***
          if (Events[name]) {
            if (['list_events', 'create_event', 'update_event', 'delete_event', 'move_all_events_to_date',
                 'list_emails', 'read_email_content', 'find_email_by_subject', 'process_pdf_attachment_to_qdrant'].includes(name)) {
                result = await Events[name](finalAccessToken, finalRefreshToken, args);
            } else if (['list_invoices', 'get_invoice_summary', 'get_client_id_by_name', 'update_invoice_status'].includes(name)) {
                result = await Events[name](args);
            } else if (name === 'search_expenses') { // <-- NUEVA LÓGICA PARA GASTOS
                result = await Events[name](args); // search_expenses no necesita tokens de Google
            }
            else {
                throw new Error(`Función "${name}" no mapeada en Events.`);
            }
          } else if (Tasks[name]) {
            result = await Tasks[name](null, args, finalUserId);
          } else if (name === 'plan_week') {
            console.log(`CHAT ROUTE: Ejecutando plan_week con weekStart=${args.weekStart}`);
            result = await fetch(
              `${process.env.NEXT_PUBLIC_SITE_URL}/api/agente/agenda/plan-week`,
              {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                  weekStart: args.weekStart,
                  userId: finalUserId,
                  accessToken: finalAccessToken,
                  refreshToken: finalRefreshToken
                })
              }
            ).then(r => r.json());
          } else {
            throw new Error(`Función "${name}" no implementada o reconocida.`);
          }
        } catch (e) {
          console.error(`CHAT ROUTE: Error al ejecutar función ${name}:`, e);
          result = { error: `Error al ejecutar ${name}: ${e.message}` };
        }

        messages.push(msg);
        messages.push({ role: 'function', name, content: JSON.stringify(result) });

        await saveMessage(
          prisma,
          sessionId,
          'assistant',
          JSON.stringify({ function: name, arguments: args, result })
        );

        continue;
      }

      const textReply = msg.content;
       await saveMessage(prisma, sessionId, 'assistant', textReply);
      return NextResponse.json({ content: textReply });
    }
  } catch (err) {
    console.error('CHAT ROUTE: POST /api/dashboard/agente/chat error general:', err);
    return NextResponse.json(
      { error: 'internal', details: err.message },
      { status: 500 }
    );
  }
}