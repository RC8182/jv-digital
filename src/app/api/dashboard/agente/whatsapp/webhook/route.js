// src/app/api/agente/whatsapp/webhook/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

export const runtime = 'nodejs';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME;
const WHATSAPP_AGENT_GROUP_JID = process.env.WHATSAPP_AGENT_GROUP_JID;
const BOT_RESPONSE_PREFIX = process.env.BOT_RESPONSE_PREFIX || "[Agente] "; // Asegúrate de que este prefijo coincida con .env.local

export async function POST(req) {
  try {
    const rawData = await req.json();
    console.log('Webhook de Evolution API: Datos recibidos (RAW):', JSON.stringify(rawData, null, 2));

    const message = rawData.data;
    const eventType = rawData.event;

    // --- FILTRADO DE MENSAJES ---
    // 1. Solo procesamos eventos 'messages.upsert'
    if (eventType !== 'messages.upsert') {
      console.log(`Webhook: Ignorando evento no relevante. Tipo: ${eventType}`);
      return NextResponse.json({ status: 'Ignored - irrelevant event type' }, { status: 200 });
    }

    // 2. Asegurarse de que el objeto del mensaje exista
    if (!message) {
      console.log('Webhook: Objeto de mensaje nulo/indefinido, ignorado.');
      return NextResponse.json({ status: 'Ignored - null message object' }, { status: 200 });
    }

    const chatJid = message.key.remoteJid;
    let userQuestion = message.message?.conversation || message.message?.extendedTextMessage?.text;

    // 3. Filtrar por GRUPO ESPECÍFICO
    if (chatJid !== WHATSAPP_AGENT_GROUP_JID) {
      console.log(`Webhook: Mensaje recibido de chat/grupo no autorizado (${chatJid}). Ignorando.`);
      return NextResponse.json({ status: 'Unauthorized chat/group' }, { status: 200 });
    }

    // 4. Ignorar si es una respuesta del propio bot o un ACK de una respuesta del bot
    // Este es el filtro crucial para evitar el bucle infinito.
    // Si el mensaje es fromMe: true (viene de nuestra instancia)
    // Y el texto *comienza* con el prefijo del bot O su status es SERVER_ACK (lo que significa que es una confirmación de entrega de un mensaje saliente)
    // Entonces, es un mensaje que ya hemos procesado (o enviado nosotros) y lo ignoramos.
    if (message.key.fromMe && (userQuestion?.startsWith(BOT_RESPONSE_PREFIX) || message.status === 'SERVER_ACK')) {
      console.log(`Webhook: Ignorando mensaje de respuesta del propio bot o ACK. fromMe: ${message.key.fromMe}, status: ${message.status}, texto: "${userQuestion}"`);
      return NextResponse.json({ status: 'Ignored - bot self-reply or ACK' }, { status: 200 });
    }

    // 5. Asegurarse de que el mensaje tiene texto procesable para el agente
    if (!userQuestion || userQuestion.trim() === '') {
      console.log('Webhook: Mensaje del usuario sin texto procesable (vacío o solo espacios), ignorado.');
      return NextResponse.json({ status: 'No text message' }, { status: 200 });
    }

    // Si llegamos aquí, el mensaje es un mensaje de texto válido del usuario desde el grupo autorizado.
    console.log(`Mensaje de WhatsApp de grupo ${chatJid} (Pregunta del usuario): "${userQuestion}"`);

    // --- 1. Llamar al Agente Principal ---
    let agentResponseContent = "Lo siento, hubo un problema al procesar tu solicitud.";
    try {
      const agentApiUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/agente/chat`;
      console.log('Llamando al agente en:', agentApiUrl);

      const agentResponse = await axios.post(agentApiUrl, {
        question: userQuestion,
        sessionId: chatJid,
        userId: chatJid, // Usamos el JID del grupo como userId temporal
        accessToken: null, // Sin credenciales de Google
        refreshToken: null // Sin credenciales de Google
      });

      if (agentResponse.data && agentResponse.data.content) {
        agentResponseContent = agentResponse.data.content;
      } else if (agentResponse.data && agentResponse.data.error) {
        agentResponseContent = `El agente reportó un error: ${agentResponse.data.error}`;
        if (agentResponse.data.details) {
            agentResponseContent += ` Detalles: ${agentResponse.data.details}`;
        }
      } else {
        agentResponseContent = "El agente no devolvió una respuesta clara.";
      }
      console.log('Respuesta cruda del Agente:', agentResponseContent);

    } catch (agentError) {
      console.error('Error al llamar al agente principal:', agentError.response?.data?.error || agentError.message);
      agentResponseContent = `Lo siento, el sistema del agente experimentó un problema. Detalles: ${agentError.response?.data?.error || agentError.message}`;
    }

    // --- 2. Enviar respuesta de vuelta a WhatsApp vía Evolution API ---
    const sendApiUrl = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE_NAME}`;
    const headers = { 'Content-Type': 'application/json' };
    if (EVOLUTION_API_KEY) { headers['apiKey'] = EVOLUTION_API_KEY; }

    try {
      // Añadir el prefijo a la respuesta del bot antes de enviarla
      const finalBotResponse = BOT_RESPONSE_PREFIX + agentResponseContent;
      console.log('Respuesta final a WhatsApp:', finalBotResponse);

      await axios.post(sendApiUrl, {
        number: chatJid, // Enviar al JID del grupo
        options: {
          delay: 1200,
          presence: 'composing'
        },
        textMessage: {
          text: finalBotResponse
        }
      }, { headers });
      console.log(`Respuesta enviada al grupo ${chatJid}`);
    } catch (sendError) {
      console.error('Error al enviar mensaje de vuelta a WhatsApp:', sendError.response?.data?.error || sendError.message);
    }

    return NextResponse.json({ status: 'Processed' }, { status: 200 });

  } catch (error) {
    console.error('Error general en el webhook de WhatsApp:', error.message, error.stack);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  console.log('Webhook de Evolution API: Petición GET recibida (posible ping de verificación).');
  return NextResponse.json({ status: 'Webhook active' }, { status: 200 });
}