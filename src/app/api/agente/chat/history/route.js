// src/app/api/dashboard/agente/chat/history/route.js
import { NextResponse } from 'next/server';
// Importa las funciones de memoria que ahora aceptan prismaClient
import { getAllMessages, deleteMessageById, clearSessionMemory } from '@/app/api/agente/utils/memory';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma'; // <-- IMPORTA LA INSTANCIA SINGLETON AQUI

export const runtime = 'nodejs';

// GET: Cargar todo el historial de una sesión
export async function GET(req) {
  const session = await getServerSession(authOptions);
  // Asumiendo que el sessionId se pasa como un query param 'sessionId'
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId es requerido.' }, { status: 400 });
  }

  // Opcional: Si quieres que solo usuarios autenticados puedan ver su historial
  // if (!session?.user?.id) {
  //   return NextResponse.json({ error: 'Acceso no autorizado al historial.' }, { status: 401 });
  // }
  // if (session.user.id !== sessionId) { // Si el sessionId no coincide con el userId, puede ser un problema
  //    // Aquí podrías validar que el sessionId sea el del usuario logueado o un UUID de sesión no-autenticada
  // }

  try {
    // Pasa la instancia de prisma a la función getAllMessages
    const messages = await getAllMessages(prisma, sessionId);
    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error('API Historial (GET): Error al cargar historial:', error);
    return NextResponse.json({ error: 'Error al cargar el historial.', details: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar mensajes (individual o toda la sesión)
export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  const { messageId, sessionId: reqSessionId } = await req.json(); // Puede venir messageId o sessionId

  // Opcional: Validar autenticación para eliminar
  // if (!session?.user?.id) {
  //   return NextResponse.json({ error: 'Acceso no autorizado para eliminar historial.' }, { status: 401 });
  // }

  try {
    if (messageId) {
      // Eliminar un mensaje específico, pasando la instancia de prisma
      await deleteMessageById(prisma, messageId);
      return NextResponse.json({ status: 'Mensaje eliminado', messageId }, { status: 200 });
    } else if (reqSessionId) {
      // Borrar toda la sesión, pasando la instancia de prisma
      await clearSessionMemory(prisma, reqSessionId);
      return NextResponse.json({ status: 'Historial de sesión borrado', sessionId: reqSessionId }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'messageId o sessionId son requeridos para la eliminación.' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Historial (DELETE): Error al eliminar mensajes:', error);
    return NextResponse.json({ error: 'Error al eliminar mensajes.', details: error.message }, { status: 500 });
  }
}