// src/app/api/agente/chat/save-message/route.js
import { NextResponse } from 'next/server';
import { saveMessage } from '@/app/api/agente/utils/memory';
import prisma from '@/lib/prisma'; // <-- IMPORTA LA INSTANCIA SINGLETON AQUI

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { sessionId, role, content } = await req.json();

    if (!sessionId || !role || !content) {
      return NextResponse.json({ error: 'Faltan parámetros: sessionId, role o content.' }, { status: 400 });
    }

    // Pasa la instancia de prisma a la función saveMessage
    const savedMessage = await saveMessage(prisma, sessionId, role, content);
    return NextResponse.json(savedMessage, { status: 200 });
  } catch (error) {
    console.error('Error al guardar mensaje manualmente:', error);
    return NextResponse.json({ error: 'Error al guardar mensaje.', details: error.message }, { status: 500 });
  }
}