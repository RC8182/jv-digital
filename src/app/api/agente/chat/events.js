// src/app/api/agente/chat/events.js

import {
  listEvents as _listCalendarEvents,
  createEvent as _createCalendarEvent,
  updateEvent as _updateCalendarEvent,
  deleteEvent as _deleteCalendarEvent,
  moveAllEventsToDate as _moveAllCalendarEventsToDate
} from '@/app/api/agente/utils/googleCalendar.js';

import {
  getGmailMessageContent as _getGmailMessageContent,
  listGmailMessages as _listGmailMessages,
  downloadGmailAttachment as _downloadGmailAttachment
} from '@/app/api/agente/utils/googleGmail.js';

import {
  uploadPdfToQdrant as _uploadPdfToQdrantToQdrantUtil, // Esta es la función original para 'pdfs' collection
  // No importamos searchDocs de qdrant.js aquí, sino la específica de gastos
} from '@/app/api/agente/utils/qdrant.js';

// Importar la función específica de búsqueda de gastos desde el nuevo módulo
import { searchExpensesDocs } from '@/app/api/agente/utils/qdrantExpenses.js'; // <-- CAMBIO CLAVE AQUÍ

import prisma from '@/lib/prisma';

// No necesitamos importar EXPENSES_COLLECTION_NAME aquí ya que searchExpensesDocs ya la usa internamente


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
  // --- Funciones de Gmail existentes ---
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
  },
  // --- Funciones de Facturación existentes ---
  {
    name: 'list_invoices',
    description: 'Obtiene una lista de facturas basándose en criterios como estado, cliente, rango de fechas, o si están vencidas. Devuelve un array de facturas.',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'],
          description: 'Filtra facturas por estado (PENDING, PAID, OVERDUE, CANCELLED). Opcional.'
        },
        clientId: {
          type: 'integer',
          description: 'Filtra facturas por ID de cliente. Opcional.'
        },
        clientName: {
          type: 'string',
          description: 'Filtra facturas por nombre parcial o completo del cliente. El sistema buscará el cliente por nombre. Opcional.'
        },
        startDate: {
          type: 'string',
          format: 'date',
          description: 'Fecha de inicio (YYYY-MM-DD) para filtrar facturas por fecha de emisión. Opcional.'
        },
        endDate: {
          type: 'string',
          format: 'date',
          description: 'Fecha de fin (YYYY-MM-DD) para filtrar facturas por fecha de emisión. Opcional.'
        },
        isOverdue: {
          type: 'boolean',
          description: 'Si es "true", filtra solo las facturas vencidas (status es PENDING u OVERDUE y dueDate es anterior a hoy). Opcional.'
        },
        limit: {
          type: 'integer',
          description: 'Número máximo de facturas a devolver. Por defecto 10. Opcional.'
        }
      },
    }
  },
  {
    name: 'get_invoice_summary',
    description: 'Proporciona un resumen cuantitativo de facturas, como el número total, el monto total, o el número y monto por estado.',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'],
          description: 'El estado de las facturas para el resumen. Opcional.'
        },
        year: {
          type: 'integer',
          description: 'Año para el resumen (ej. 2024). Opcional. Si no se especifica, usa el año actual.'
        },
        month: {
          type: 'integer',
          description: 'Mes para el resumen (1-12). Opcional. Requiere que se especifique el año.'
        }
      }
    }
  },
  {
    name: 'get_client_id_by_name',
    description: 'Busca un cliente por su nombre (parcial o completo) y devuelve su ID. Útil para obtener el clientId para otras funciones.',
    parameters: {
      type: 'object',
      properties: {
        clientName: {
          type: 'string',
          description: 'El nombre parcial o completo del cliente a buscar.'
        }
      },
      required: ['clientName']
    }
  },
  {
    name: 'update_invoice_status',
    description: 'Actualiza el estado de una factura (ej. de PENDING a PAID) y, opcionalmente, la fecha de pago.',
    parameters: {
      type: 'object',
      properties: {
        invoiceId: {
          type: 'integer',
          description: 'El ID de la factura a actualizar.'
        },
        newStatus: {
          type: 'string',
          enum: ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'],
          description: 'El nuevo estado de la factura.'
        },
        paidDate: {
          type: 'string',
          format: 'date',
          description: 'Fecha de pago de la factura (YYYY-MM-DD). Requerida si el estado es PAID.'
        }
      },
      required: ['invoiceId', 'newStatus']
    }
  },
  // NUEVA FUNCIÓN search_expenses CON FILTROS ESTRUCTURADOS (sin 'oneOf' en el top level)
  {
    name: 'search_expenses',
    description: 'Busca información relevante en los documentos de gastos (PDFs) indexados en Qdrant. Puede filtrar por fecha, proveedor y consulta de texto.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'La consulta de texto para búsqueda semántica en el contenido del documento (ej: "recibo de electricidad", "material de oficina").'
        },
        startDate: {
          type: 'string',
          format: 'date',
          description: 'Fecha de inicio (YYYY-MM-DD) para filtrar gastos por la fecha del documento.'
        },
        endDate: {
          type: 'string',
          format: 'date',
          description: 'Fecha de fin (YYYY-MM-DD) para filtrar gastos por la fecha del documento.'
        },
        supplier: {
          type: 'string',
          description: 'Nombre parcial o completo del proveedor para filtrar gastos.'
        },
        limit: {
          type: 'integer',
          description: 'Número máximo de resultados a devolver. Por defecto 3.'
        }
      },
      // Eliminamos 'oneOf' de aquí para cumplir con la validación de OpenAI
      // Los campos ahora son opcionales según el esquema,
      // pero la lógica de la función search_expenses validará que al menos uno se envíe.
    }
  }
];

// Wrappers para Google Calendar (mantener)
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

// Wrapper para listar emails (mantener)
export async function list_emails(accessToken, refreshToken, args) {
  return _listGmailMessages(accessToken, refreshToken, {
    q: args.q,
    maxResults: args.maxResults,
    pageToken: args.pageToken
  });
}

// Wrapper para leer contenido de email (mantener)
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
    attachments: email.attachments.map(att => ({
      filename: att.filename,
      mimeType: att.mimeType,
      attachmentId: att.attachmentId
    }))
  };
}

// Función para buscar email por asunto (mantener)
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

// Wrapper para procesar adjuntos PDF (mantener)
export async function process_pdf_attachment_to_qdrant(accessToken, refreshToken, args) {
  const { messageId, attachmentId, filename } = args;

  if (!filename) {
    return { success: false, message: 'Parámetro \"filename\" ausente o vacío.' };
  }

  if (!filename.toLowerCase().endsWith('.pdf')) {
    return { success: false, message: `El archivo '${filename}' no es un PDF. Solo se pueden procesar adjuntos PDF para Qdrant.` };
  }

  try {
    console.log(`Attempting to download attachment ${attachmentId} from message ${messageId}...`);
    const pdfBuffer = await _downloadGmailAttachment(accessToken, refreshToken, messageId, attachmentId);
    console.log(`Attachment ${filename} downloaded. Size: ${pdfBuffer.length} bytes.`);

    // NOTA: Esta función 'uploadPdfToQdrant' está diseñada para la colección 'pdfs'.
    // Si los adjuntos de Gmail de gastos deben ir a 'expenses-pdfs', esto se complicaría.
    // Asumimos que esta va a la colección genérica 'pdfs' como estaba.
    const success = await _uploadPdfToQdrantToQdrantUtil(pdfBuffer, filename); // Renombrado en la importación

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

// Wrappers para Facturación (mantener)
export async function list_invoices(args) {
  let whereClause = {};

  if (args.status) {
    whereClause.status = args.status;
  }

  if (args.clientId) {
    whereClause.clientId = args.clientId;
  }

  if (args.clientName) {
    const client = await prisma.client.findFirst({
      where: { name: { contains: args.clientName, mode: 'insensitive' } },
    });
    if (client) {
      whereClause.clientId = client.id;
    } else {
      return { error: `No se encontró ningún cliente con el nombre "${args.clientName}".` };
    }
  }

  if (args.startDate || args.endDate) {
    whereClause.date = {};
    if (args.startDate) {
      whereClause.date.gte = new Date(args.startDate);
    }
    if (args.endDate) {
      const endDate = new Date(args.endDate);
      endDate.setHours(23, 59, 59, 999);
      whereClause.date.lte = endDate;
    }
  }

  if (args.isOverdue === true) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    whereClause.dueDate = { lt: today };
    whereClause.status = { in: ['PENDING', 'OVERDUE'] };
  }

  try {
    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      take: args.limit || 10,
      include: { client: true },
      orderBy: { date: 'desc' }
    });

    if (invoices.length === 0) {
      return { message: "No se encontraron facturas con los criterios especificados." };
    }

    return invoices.map(inv => ({
      id: inv.id,
      number: inv.number,
      amount: inv.total,
      status: inv.status,
      issueDate: inv.date.toLocaleDateString('es-ES'),
      dueDate: inv.dueDate ? inv.dueDate.toLocaleDateString('es-ES') : 'N/A',
      paidDate: inv.paidDate ? inv.paidDate.toLocaleDateString('es-ES') : 'No pagada',
      clientName: inv.client.name,
    }));
  } catch (error) {
    console.error("Error al listar facturas:", error);
    return { error: `Error al listar facturas: ${error.message}` };
  }
}

export async function get_invoice_summary(args) {
  let whereClause = {};
  let dateFilter = {};

  if (args.status) {
    whereClause.status = args.status;
  }

  const currentYear = new Date().getFullYear();
  if (args.year) {
    dateFilter.gte = new Date(`${args.year}-01-01T00:00:00.000Z`);
    dateFilter.lt = new Date(`${args.year + 1}-01-01T00:00:00.000Z`);
  } else {
    dateFilter.gte = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    dateFilter.lt = new Date(`${currentYear + 1}-01-01T00:00:00.000Z`);
  }

  if (args.month) {
    const month = parseInt(args.month);
    if (isNaN(month) || month < 1 || month > 12) {
      return { error: "El mes debe ser un número entre 1 y 12." };
    }
    const yearToFilter = args.year || currentYear;
    dateFilter.gte = new Date(yearToFilter, month - 1, 1);
    dateFilter.lt = new Date(yearToFilter, month, 1);
  }

  whereClause.date = dateFilter;


  try {
    const summary = await prisma.invoice.aggregate({
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
      where: whereClause,
    });

    const statusText = args.status ? `en estado '${args.status.toLowerCase()}'` : '';
    const dateText = args.month && args.year ? `en ${new Date(args.year, args.month - 1).toLocaleString('es-ES', { month: 'long', year: 'numeric' })}` :
                     args.year ? `en el año ${args.year}` : `en el año actual (${currentYear})`;

    const totalCount = summary._count.id;
    const totalAmount = summary._sum.total?.toFixed(2) || '0.00';

    if (totalCount === 0) {
      return `No se encontraron facturas ${statusText} ${dateText}.`;
    }

    return `Hay un total de ${totalCount} facturas ${statusText} ${dateText} con un monto total de ${totalAmount} €.`;

  } catch (error) {
    console.error("Error al obtener resumen de facturas:", error);
    return { error: `Error al obtener resumen de facturas: ${error.message}` };
  }
}

export async function get_client_id_by_name(args) {
  try {
    const client = await prisma.client.findFirst({
      where: { name: { contains: args.clientName, mode: 'insensitive' } },
      select: { id: true, name: true }
    });

    if (client) {
      return { id: client.id, name: client.name };
    } else {
      return { message: `No se encontró ningún cliente con el nombre "${args.clientName}".` };
    }
  } catch (error) {
    console.error("Error al buscar cliente por nombre:", error);
    return { error: `Error al buscar cliente por nombre: ${error.message}` };
  }
}

export async function update_invoice_status(args) {
  const { invoiceId, newStatus, paidDate } = args;

  if (newStatus === 'PAID' && !paidDate) {
    return { error: 'La fecha de pago (paidDate) es requerida cuando el estado se actualiza a PAID.' };
  }
  if (paidDate && newStatus !== 'PAID') {
    return { error: 'La fecha de pago (paidDate) solo es relevante cuando el estado se actualiza a PAID.' };
  }

  try {
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: newStatus,
        paidDate: newStatus === 'PAID' ? new Date(paidDate) : null,
      },
      include: { client: true }
    });

    return {
      success: true,
      message: `La factura #${updatedInvoice.number} del cliente ${updatedInvoice.client.name} ha sido actualizada a estado '${updatedInvoice.status}'.`,
      invoice: {
        id: updatedInvoice.id,
        number: updatedInvoice.number,
        status: updatedInvoice.status,
        paidDate: updatedInvoice.paidDate ? updatedInvoice.paidDate.toLocaleDateString('es-ES') : 'N/A'
      }
    };
  } catch (error) {
    console.error(`Error al actualizar el estado de la factura ${invoiceId}:`, error);
    return { error: `Error al actualizar el estado de la factura: ${error.message}` };
  }
}

// Wrapper para la nueva función de búsqueda de gastos
export async function search_expenses(args) {
  const { query, startDate, endDate, supplier, limit = 3 } = args;

  // Validación: Al menos uno de los parámetros de búsqueda debe estar presente
  if (!query && !startDate && !endDate && !supplier) {
    return { error: "Debes proporcionar al menos una consulta de texto, un rango de fechas o un proveedor para buscar en los gastos." };
  }

  let qdrantFilters = {};
  qdrantFilters.must = []; // Inicializar must para aplicar filtros combinados

  // Filtro por rango de fechas
  if (startDate || endDate) {
    const dateFilter = { key: 'date', range: {} }; // Asumo que el campo de fecha en Qdrant es 'date'
    if (startDate) {
      dateFilter.range.gte = new Date(startDate).toISOString();
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Incluir todo el día
      dateFilter.range.lte = end.toISOString();
    }
    qdrantFilters.must.push(dateFilter);
  }

  // Filtro por proveedor
  if (supplier) {
    qdrantFilters.must.push({
      key: 'supplier', // Asumo que el campo de proveedor en Qdrant es 'supplier'
      match: { value: supplier.toLowerCase() } // Convertir a minúsculas para búsqueda insensible
    });
  }

  try {
    // La función searchExpensesDocs ahora acepta filters
    const results = await searchExpensesDocs(query, limit, qdrantFilters); // <-- CAMBIO: Usar searchExpensesDocs

    if (results.length === 0) {
      return { message: "No se encontraron documentos de gastos relevantes con los criterios especificados." };
    }

    // Mapeamos los resultados para una respuesta más amigable
    return results.map(r => ({
      page_content: r.page_content,
      filename: r.filename,
      score: r.score,
      supplier: r.supplier || 'N/A',
      date: r.date ? new Date(r.date).toLocaleDateString('es-ES') : 'N/A',
      totalAmount: r.totalAmount != null ? r.totalAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) : 'N/A'
    }));
  } catch (error) {
    console.error("Error en search_expenses:", error);
    return { error: `Hubo un error al buscar en los documentos de gastos: ${error.message}` };
  }
}

/* ------------------------------------------------------------------
   NUEVA FUNCIÓN: get_quarter_summary
-------------------------------------------------------------------*/
functions.push({
  name: 'get_quarter_summary',
  description:
    'Devuelve un resumen fiscal-contable de un trimestre: ingresos, gastos, modelos 130 y 303, etc.',
  parameters: {
    type: 'object',
    properties: {
      trimestre: {
        type: 'integer',
        enum: [1, 2, 3, 4],
        description: 'Trimestre del año (1-4)'
      },
      year: {
        type: 'integer',
        description: 'Año (ej. 2025)'
      },
      epigrafe: {
        type: 'string',
        description:
          'Código de epígrafe IAE a filtrar (opcional). Usa "all" para incluir todos.',
        default: 'all'
      }
    },
    required: ['trimestre', 'year']
  }
});

/* Wrapper ― NO necesita tokens de Google ----------------------------------*/
export async function get_quarter_summary(args) {
  const { trimestre, year, epigrafe = 'all' } = args;

  const url = `${
    process.env.NEXT_PUBLIC_SITE_URL
  }/api/agente/contabilidad/trimestral?trimestre=${trimestre}&year=${year}&epigrafe=${encodeURIComponent(
    epigrafe
  )}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} al obtener resumen trimestral`);
  return res.json();
}
