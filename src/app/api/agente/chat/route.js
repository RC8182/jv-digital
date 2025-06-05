// src/app/api/agente/chat/route.js
import { NextResponse }     from 'next/server';
import OpenAI               from 'openai';
import { getServerSession } from 'next-auth/next';
import { authOptions }      from '@/app/api/auth/[...nextauth]/route';

import { saveMessage, loadMemory } from '../utils/memory.js';
import { searchDocs }              from '../utils/qdrant.js';
import { buildMessages }           from '../utils/promptBuilder.js';

import * as Events   from './events.js'; // Ahora Events.js incluye también las funciones de Gmail
import * as Tasks    from './tasks.js';  
import prisma from '@/lib/prisma.js';

export const runtime = 'nodejs';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


// Juntamos todas las funciones (ahora Events.functions incluye las de Gmail)
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
  // Extraer todos los parámetros del cuerpo de la petición, incluyendo los de sesión
  const { question, sessionId, userId: bodyUserId, accessToken: bodyAccessToken, refreshToken: bodyRefreshToken } = await req.json();

  if (!question || !sessionId) {
    return NextResponse.json({ error: 'Faltan parámetros básicos (question o sessionId).' }, { status: 400 });
  }

  // saveMessage para el usuario se hace ahora en el frontend a través de /api/agente/chat/save-message
  // await saveMessage(sessionId, 'user', question); // <-- ELIMINA ESTA LÍNEA

  // Intentar obtener la sesión de NextAuth (para llamadas directas desde el navegador)
  const session = await getServerSession(authOptions);

  // Determinar los valores finales de userId, accessToken y refreshToken
  // Priorizamos los que vienen en el cuerpo de la petición (de /agente/audio),
  // y si no están, usamos los de la sesión de NextAuth.
  let finalUserId = bodyUserId || session?.user?.id;
  let finalAccessToken = bodyAccessToken || session?.accessToken;
  let finalRefreshToken = bodyRefreshToken || session?.refreshToken;

  if (!finalUserId) {
      console.error('CHAT ROUTE: No se pudo determinar el ID de usuario desde el cuerpo ni la sesión.');
      // await saveMessage(sessionId, 'assistant', 'Lo siento, no puedo acceder a tu información de usuario. Por favor, asegúrate de haber iniciado sesión correctamente o que tu sesión sea válida.'); // <-- ELIMINA ESTA LÍNEA
      return NextResponse.json({ error: 'User ID not found or provided.' }, { status: 401 });
  }

  // Ahora, usa finalUserId, finalAccessToken, finalRefreshToken en el resto de la lógica
  console.log('CHAT ROUTE: Datos de usuario disponibles:', {
    userId: finalUserId,
    accessToken: finalAccessToken ? 'presente' : 'ausente',
    refreshToken: finalRefreshToken ? 'presente' : 'ausente'
  });

  const memory = await loadMemory(prisma, sessionId); // <-- PASA PRISMA AQUÍ
  const docs   = await searchDocs(question);
  let messages = await buildMessages(prisma, sessionId, question, memory, docs);

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
          if (Events[name]) {
            // Pasar los tokens finales a las funciones de eventos
            result = await Events[name](finalAccessToken, finalRefreshToken, args);
          } else if (Tasks[name]) {
            // Pasar el userId final a las funciones de tareas
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
        
        await saveMessage( // <-- PASA PRISMA AQUÍ
          prisma,
          sessionId,
          'assistant',
          JSON.stringify({ function: name, arguments: args, result })
        );

        continue;
      }

      const textReply = msg.content;
       await saveMessage(prisma, sessionId, 'assistant', textReply); // <-- PASA PRISMA AQUÍ
      return NextResponse.json({ content: textReply });
    }
  } catch (err) {
    console.error('CHAT ROUTE: POST /api/dashboard/agente/chat error general:', err);
    // await saveMessage(sessionId, 'assistant', `Error: ${err.message}`); // <-- ELIMINA ESTA LÍNEA
    return NextResponse.json(
      { error: 'internal', details: err.message },
      { status: 500 }
    );
  }
}