import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getGmailMessageContent } from '../../utils/googleGmail.js';
import { process_pdf_attachment_to_qdrant } from '@/app/api/agente/chat/events.js';

export const runtime = 'nodejs';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken || !session?.refreshToken) {
      return NextResponse.json({
        error: 'No Google access tokens found for Gmail API.'
      }, { status: 401 });
    }

    const { accessToken, refreshToken } = session;
    const url = new URL(req.url);
    const messageId = url.searchParams.get('id');

    if (!messageId) {
      return NextResponse.json({ error: 'Falta el parámetro "id" del mensaje.' }, { status: 400 });
    }

    const messageContent = await getGmailMessageContent(accessToken, refreshToken, messageId);

    // Procesar cada adjunto PDF automáticamente
    for (const att of messageContent.attachments) {
      if (att.filename.toLowerCase().endsWith('.pdf')) {
        const result = await process_pdf_attachment_to_qdrant(
          accessToken,
          refreshToken,
          {
            messageId: messageContent.id,
            attachmentId: att.attachmentId,
            filename: att.filename
          }
        );
        if (result.success) {
          console.log(`El adjunto '${att.filename}' ha sido procesado y cargado a Qdrant correctamente.`);
        } else {
          console.error(`Error al procesar el adjunto '${att.filename}': ${result.message}`);
        }
      }
    }

    return NextResponse.json(messageContent);

  } catch (err) {
    console.error('GET /api/agente/gmail/read error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
