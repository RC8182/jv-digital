// src/app/api/agente/chat/events.js
import {
  listEvents as _listCalendarEvents,
  createEvent as _createCalendarEvent,
  updateEvent as _updateCalendarEvent,
  deleteEvent as _deleteCalendarEvent,
  moveAllEventsToDate as _moveAllCalendarEventsToDate
} from '@/app/api/dashboard/agente/utils/googleCalendar.js';

import {
  getGmailMessageContent as _getGmailMessageContent,
  listGmailMessages as _listGmailMessages,
  downloadGmailAttachment as _downloadGmailAttachment // Importa la nueva función
} from '@/app/api/dashboard/agente/utils/googleGmail.js';

import {
  uploadPdfToQdrant as _uploadPdfToQdrant // Importa la nueva función
} from '@/app/api/dashboard/agente/utils/qdrant.js';

export const functions = [
  // --- Funciones de Google Calendar (existentes) ---
  {
    name: 'list_events',
    description: 'Obtener eventos entre dos fechas y horas ISO (Google Calendar).',
    parameters: {
      type: 'object',
      properties: {
        timeMin: { type: 'string', format: 'date-time' },
        timeMax: { type: 'string', format: 'date-time' }
      }
    }
  },
  {
    name: 'create_event',
    description: 'Crear un nuevo evento en Google Calendar.',
    parameters: {
      type: 'object',
      properties: {
        summary:     { type: 'string' },
        description: { type: 'string' },
        start:       { type: 'string', format: 'date-time' },
        end:         { type: 'string', format: 'date-time' }
      },
      required: ['summary','start']
    }
  },
  {
    name: 'update_event',
    description: 'Actualizar un evento existente en Google Calendar.',
    parameters: {
      type: 'object',
      properties: {
        eventId:     { type: 'string' },
        summary:     { type: 'string' },
        description: { type: 'string' },
        start:       { type: 'string', format: 'date-time' },
        end:         { type: 'string', format: 'date-time' }
      },
      required: ['eventId']
    }
  },
  {
    name: 'delete_event',
    description: 'Eliminar un evento de Google Calendar por ID.',
    parameters: {
      type: 'object',
      properties: {
        eventId: { type: 'string' }
      },
      required: ['eventId']
    }
  },
  {
    name: 'move_all_events_to_date',
    description: 'Mueve todos los eventos encontrados en un rango de fechas de Google Calendar a una nueva fecha de inicio, manteniendo su hora y duración originales.',
    parameters: {
      type: 'object',
      properties: {
        timeMin: { type: 'string', format: 'date-time', description: 'Fecha y hora de inicio (ISO 8601) del rango original donde buscar eventos a mover.' },
        timeMax: { type: 'string', format: 'date-time', description: 'Fecha y hora de fin (ISO 8601) del rango original donde buscar eventos a mover.' },
        newStartDate: { type: 'string', format: 'date', description: 'Nueva fecha (YYYY-MM-DD) a la que se moverán todos los eventos.' }
      },
      required: ['timeMin', 'timeMax', 'newStartDate']
    }
  },
  // --- Funciones de Gmail ---
  {
    name: 'list_emails',
    description: 'Lista correos electrónicos con filtros de búsqueda.',
    parameters: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Consulta de búsqueda de Gmail (ej. "from:noticias@ceoe.es subject:novedades").' },
        maxResults: { type: 'number', description: 'Número máximo de correos a devolver (por defecto 10).' },
        pageToken: { type: 'string', description: 'Token de paginación para obtener la siguiente página de resultados.' }
      }
    }
  },
  {
    name: 'read_email_content',
    // Descripción actualizada para incluir adjuntos
    description: 'Lee el contenido completo (HTML y texto plano) de un correo electrónico específico por su ID. También devuelve metadatos de los adjuntos si existen (filename, mimeType, attachmentId).',
    parameters: {
      type: 'object',
      properties: {
        messageId: { type: 'string', description: 'ID del correo a leer.' }
      },
      required: ['messageId']
    }
  },
  {
    name: 'find_email_by_subject',
    description: 'Busca el primer correo cuyo asunto contenga el texto dado.',
    parameters: {
      type: 'object',
      properties: {
        subjectQuery: { type: 'string', description: 'Texto a buscar dentro del asunto.' }
      },
      required: ['subjectQuery']
    }
  },
  // --- NUEVA FUNCIÓN PARA PROCESAR ADJUNTOS PDF ---
  {
    name: 'process_pdf_attachment_to_qdrant',
    description: 'Descarga un adjunto de correo electrónico (solo PDFs) y lo carga a la base de datos Qdrant para su consulta futura. Se requiere el messageId y el attachmentId, que se obtienen de `read_email_content`.',
    parameters: {
      type: 'object',
      properties: {
        messageId:    { type: 'string', description: 'ID del correo electrónico del que se descargará el adjunto.' },
        attachmentId: { type: 'string', description: 'ID del adjunto dentro del correo electrónico.' },
        filename:     { type: 'string', description: 'Nombre del archivo adjunto (ej. "documento.pdf"). Necesario para identificar el tipo de archivo.' }
      },
      required: ['messageId', 'attachmentId', 'filename']
    }
  }
];

// Wrappers para Google Calendar
export async function list_events(accessToken, refreshToken, args) {
  return _listCalendarEvents(accessToken, refreshToken, args.timeMin, args.timeMax);
}
export async function create_event(accessToken, refreshToken, args) {
  return _createCalendarEvent(accessToken, refreshToken, args);
}
export async function update_event(accessToken, refreshToken, args) {
  return _updateCalendarEvent(accessToken, refreshToken, args.eventId, args);
}
export async function delete_event(accessToken, refreshToken, args) {
  return _deleteCalendarEvent(accessToken, refreshToken, args.eventId);
}
export async function move_all_events_to_date(accessToken, refreshToken, args) {
  return _moveAllCalendarEventsToDate(accessToken, refreshToken, args.timeMin, args.timeMax, args.newStartDate);
}

// Wrapper para listar emails
export async function list_emails(accessToken, refreshToken, args) {
  return _listGmailMessages(accessToken, refreshToken, {
    q: args.q,
    maxResults: args.maxResults,
    pageToken: args.pageToken
  });
}

// Wrapper para leer contenido de email
export async function read_email_content(accessToken, refreshToken, args) {
  const id = args.messageId;
  const email = await _getGmailMessageContent(accessToken, refreshToken, id);

  return {
    id:      email.id,
    from:    email.from,
    subject: email.subject,
    date:    email.date,
    bodyPlain: email.bodyPlain,
    bodyHtml:  email.bodyHtml,
    attachments: email.attachments.map(att => ({ // Aseguramos que la estructura de adjuntos se pase bien
      filename: att.filename,
      mimeType: att.mimeType,
      attachmentId: att.attachmentId
    }))
  };
}

// Función para buscar email por asunto
export async function find_email_by_subject(accessToken, refreshToken, args) {
  const emails = await _listGmailMessages(accessToken, refreshToken, { q: '', maxResults: 20 });
  const match = emails.find(e =>
    e.subject.toLowerCase().includes(args.subjectQuery.toLowerCase())
  );
  if (!match) {
    return { found: false };
  }
  return { found: true, email: match };
}

// NUEVO Wrapper para procesar adjuntos PDF
export async function process_pdf_attachment_to_qdrant(accessToken, refreshToken, args) {
  const { messageId, attachmentId, filename } = args;

  // Validar que sea un PDF antes de intentar descargar
    if (!filename) {
      return { success: false, message: 'Parámetro \"filename\" ausente o vacío.' };
    }

    // Validar que sea un PDF antes de intentar descargar
    if (!filename.toLowerCase().endsWith('.pdf')) {
      return { success: false, message: `El archivo '${filename}' no es un PDF. Solo se pueden procesar adjuntos PDF para Qdrant.` };
    }

  try {
    console.log(`Attempting to download attachment ${attachmentId} from message ${messageId}...`);
    const pdfBuffer = await _downloadGmailAttachment(accessToken, refreshToken, messageId, attachmentId);
    console.log(`Attachment ${filename} downloaded. Size: ${pdfBuffer.length} bytes.`);

    console.log(`Uploading ${filename} to Qdrant...`);
    const success = await _uploadPdfToQdrant(pdfBuffer, filename);

    if (success) {
      return { success: true, message: `El adjunto '${filename}' ha sido procesado y cargado exitosamente a Qdrant.` };
    } else {
      return { success: false, message: `Hubo un error al procesar o cargar el adjunto '${filename}' a Qdrant.` };
    }
  } catch (error) {
    console.error(`Error in process_pdf_attachment_to_qdrant for ${filename}:`, error);
    return { success: false, message: `Error al procesar el adjunto '${filename}': ${error.message}` };
  }
}