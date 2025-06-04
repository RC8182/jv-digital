// src/app/api/dashboard/agente/gmail/list/route.js
// Esta es la versión que tu frontend usa y que ya funciona correctamente.

import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/route'; // Ajusta la ruta
import { NextResponse } from 'next/server';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    console.error('API /gmail/list: No autenticado con Google.');
    return NextResponse.json({ error: 'Not authenticated with Google' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const maxResults = parseInt(searchParams.get('maxResults') || '10', 10);
  const pageToken = searchParams.get('pageToken');

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session.accessToken });

  const gmail = google.gmail({ version: 'v1', auth });

  // Helper para extraer nombre y email del campo 'From'
  const extractFromNameAndEmail = (fromHeader) => {
    const nameMatch = fromHeader.match(/"(.*?)"\s*<(.+)>/);
    if (nameMatch) {
      return { name: nameMatch[1], email: nameMatch[2] };
    }
    const emailMatch = fromHeader.match(/<(.+)>/);
    if (emailMatch) {
      return { name: emailMatch[1], email: emailMatch[1] };
    }
    return { name: fromHeader, email: fromHeader };
  };

  // Helper para formatear fechas a un string legible
  const formatReadableDate = (rawDateString) => {
    if (!rawDateString) return 'No disponible';
    try {
      // El formato de Gmail para Date header es como "Tue, 27 May 2025 21:39:48 GMT"
      const date = new Date(rawDateString);
      if (isNaN(date.getTime())) {
          // Si no es un formato válido, intenta parsear como ISO si viene del util
          try {
              const isoDate = new Date(rawDateString);
              if (!isNaN(isoDate.getTime())) {
                  return isoDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              }
          } catch (e) { /* ignore */ }
          return rawDateString; // Fallback si no se puede parsear
      }
      return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return rawDateString;
    }
  };


  try {
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: maxResults,
      q: query,
      pageToken: pageToken,
    });

    const messages = listResponse.data.messages || [];
    const nextPageToken = listResponse.data.nextPageToken || null;

    if (messages.length === 0) {
      console.log('API /gmail/list: No se encontraron IDs de mensajes para la consulta.');
      return NextResponse.json({ emails: [], nextPageToken: null });
    }

    const detailedMessagesPromises = messages.map(async (msg) => {
      try {
        const msgResponse = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          headers: ['From', 'Subject', 'Date']
        });

        const payload = msgResponse.data.payload;
        const headers = payload?.headers || []; 

        const getHeader = (name) => {
            const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
            return header?.value || '';
        };
        
        const rawSubject = getHeader('Subject');
        const rawFrom = getHeader('From');
        const rawDate = getHeader('Date'); // Esto es el string de la fecha de Gmail

        // --- ¡TRANSFORMACIÓN PARA EL LLM Y EL FRONTEND AQUÍ! ---
        const formattedFrom = extractFromNameAndEmail(rawFrom);
        const readableDate = formatReadableDate(rawDate); 

        return {
          id: msg.id,
          threadId: msg.threadId,
          snippet: msgResponse.data.snippet || 'No hay fragmento',
          subject: rawSubject || 'Sin asunto', 
          from: formattedFrom.name || formattedFrom.email || 'Desconocido', // Asegura un nombre o email legible
          date: readableDate, // La fecha ya está formateada para ser legible
        };
      } catch (innerError) {
        console.error(`Error fetching metadata for email ${msg.id}:`, innerError);
        return {
            id: msg.id,
            subject: 'Error al cargar (Metadata)',
            from: 'Error',
            date: 'No disponible', // Fallback legible
            snippet: 'Este correo no pudo ser cargado.',
            error: true
        };
      }
    });

    const detailedEmails = (await Promise.all(detailedMessagesPromises)).filter(Boolean);

    console.log('API /gmail/list: Lista final de emails enviados al frontend y al Agente:', detailedEmails.map(e => ({ id: e.id, subject: e.subject, from: e.from, date: e.date })));

    return NextResponse.json({ emails: detailedEmails, nextPageToken: nextPageToken });

  } catch (error) {
    console.error('API /gmail/list: Error general al obtener la lista de correos de Gmail:', error);
    return NextResponse.json({ error: 'Fallo al obtener la lista de correos de Gmail.', details: error.message }, { status: 500 });
  }
}