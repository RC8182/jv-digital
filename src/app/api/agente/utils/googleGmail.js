// src/app/api/agente/utils/googleGmail.js
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.NEXTAUTH_URL + '/api/auth/callback/google';

let cachedGmailOAuth2Client = null;

// Función para obtener y configurar el cliente OAuth2 para Gmail
async function getGmailClient(accessToken, refreshToken) {
  // Si ya tenemos un cliente cacheadoy el access token coincide, lo reutilizamos
  if (cachedGmailOAuth2Client && cachedGmailOAuth2Client.credentials.access_token === accessToken) {
    return cachedGmailOAuth2Client;
  }

  const oauth2Client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );

  // Establecer credenciales iniciales. El refreshToken es clave para obtener un nuevo accessToken.
  oauth2Client.setCredentials({
    access_token: accessToken,  // Intentar usar el access token actual
    refresh_token: refreshToken, // Necesario para refrescar
  });

  // Verificar si el access token está a punto de expirar y refrescarlo si es necesario
  const expiryDate = oauth2Client.credentials.expiry_date;
  // Refrescar si no hay fecha de expiración, o si expira en menos de 1 minuto
  if (!expiryDate || expiryDate - Date.now() < 60 * 1000) {
    console.log('Google Gmail OAuth2Client: Access token expiring soon or expired, refreshing...');
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      console.log('Google Gmail OAuth2Client: New access token obtained (for Gmail).');
      oauth2Client.setCredentials(credentials);
    } catch (refreshError) {
      console.error('Google Gmail OAuth2Client: Error refreshing access token:', refreshError.message);
      // Lanzar el error o manejarlo para que el cliente sepa que necesita re-autenticar
      throw new Error('Could not refresh Google access token for Gmail API.');
    }
  }

  cachedGmailOAuth2Client = oauth2Client;
  return oauth2Client;
}

// Función para listar correos (metadatos optimizados para la lista del frontend)
export async function listGmailMessages(accessToken, refreshToken, { q, maxResults = 10, pageToken }) {
  const { google } = await import('googleapis');

  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  const response = await gmail.users.messages.list({
    userId: 'me',
    q,
    maxResults,
    pageToken,
  });

  const messages = response.data.messages || [];

  const detailedMessages = await Promise.all(messages.map(async (msg) => {
    const fullMsg = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'metadata',
      metadataHeaders: ['From', 'Subject', 'Date'],
    });

    const headers = fullMsg.data.payload.headers;

    const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || 'Sin información';

    return {
      id: msg.id,
      from: getHeader('From') || 'Desconocido',
      subject: getHeader('Subject') || 'Sin Asunto',
      date: getHeader('Date') || 'Sin fecha',
    };
  }));

  return detailedMessages;
}

// Función para leer el contenido completo de un correo
export async function getGmailMessageContent(accessToken, refreshToken, messageId) {
  const client = await getGmailClient(accessToken, refreshToken);
  const gmail = google.gmail({ version: 'v1', auth: client });

  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full', // Necesario para obtener el cuerpo y adjuntos
    fields: 'id,payload,snippet,internalDate,labelIds' // Campos que queremos del mensaje completo
  });

  const payload = res.data.payload;
  const headers = payload?.headers || [];

  const subject = headers.find(h => h.name === 'Subject')?.value || 'Sin Asunto';
  const from = headers.find(h => h.name === 'From')?.value || 'Desconocido';
  const dateHeader = headers.find(h => h.name === 'Date')?.value;
  const date = dateHeader ? new Date(dateHeader).toISOString() : null;

  let bodyHtml = '';
  let bodyPlain = '';
  const attachments = [];

  // Función recursiva para buscar partes del cuerpo (HTML, texto plano, adjuntos)
  function getParts(parts) {
    if (!parts) return;
    for (const part of parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        bodyHtml += Buffer.from(part.body.data, 'base64').toString('utf8');
      } else if (part.mimeType === 'text/plain' && part.body?.data) {
        bodyPlain += Buffer.from(part.body.data, 'base64').toString('utf8');
      } else if (part.filename && part.body?.attachmentId) {
        // Adjuntos: solo guardamos metadatos. La descarga necesitaría otra API route.
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          attachmentId: part.body.attachmentId
        });
      }
      if (part.parts) {
        getParts(part.parts); // Recurrir si hay partes anidadas
      }
    }
  }

  getParts(payload.parts || [payload]); // Procesar partes o el payload principal si no tiene sub-partes

  return {
    id: res.data.id,
    subject: subject,
    from: from,
    date: date, // Incluir date a nivel superior
    bodyHtml: bodyHtml,
    bodyPlain: bodyPlain,
    snippet: res.data.snippet,
    labelIds: res.data.labelIds, // Incluir labelIds a nivel superior si es útil
    attachments: attachments, // Incluir attachments a nivel superior
  };
}

/**
 * Descarga un adjunto específico de un correo electrónico.
 * @param {string} accessToken - El token de acceso de Google.
 * @param {string} refreshToken - El token de refresco de Google.
 * @param {string} messageId - El ID del mensaje de correo electrónico.
 * @param {string} attachmentId - El ID del adjunto a descargar.
 * @returns {Buffer} El contenido del adjunto como un Buffer.
 */
export async function downloadGmailAttachment(accessToken, refreshToken, messageId, attachmentId) {
  const client = await getGmailClient(accessToken, refreshToken);
  const gmail = google.gmail({ version: 'v1', auth: client });

  try {
    const res = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId: messageId,
      id: attachmentId,
    });

    // La data viene en base64
    const data = res.data.data;
    if (!data) {
      throw new Error('Attachment data not found.');
    }

    // Decodificar el base64 a un Buffer
    return Buffer.from(data, 'base64');
  } catch (error) {
    console.error(`Error downloading attachment ${attachmentId} for message ${messageId}:`, error.message);
    throw new Error(`Failed to download attachment: ${error.message}`);
  }
}