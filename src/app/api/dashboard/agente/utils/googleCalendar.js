// src/app/api/agente/utils/googleCalendar.js

import { google } from 'googleapis';

// Redirect URI para OAuth2 (debe coincidir con Google Cloud Console)
const GOOGLE_REDIRECT_URI = process.env.NEXTAUTH_URL + '/api/auth/callback/google';
// Zona horaria IANA por defecto
const TIMEZONE = process.env.DEFAULT_TIMEZONE || 'Atlantic/Canary';

/**
 * Construye un cliente autenticado de Google Calendar.
 */
async function _getAuthenticatedCalendarClient(accessToken, refreshToken) {
  if (!accessToken || !refreshToken) {
    throw new Error('Access and refresh tokens are required for Google Calendar operations.');
  }

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );

  oAuth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

  oAuth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      console.log('Google OAuth2Client: New refresh token obtained:', tokens.refresh_token);
    }
    if (tokens.access_token) {
      console.log('Google OAuth2Client: New access token obtained:', tokens.access_token);
    }
  });

  return google.calendar({ version: 'v3', auth: oAuth2Client });
}

/**
 * Lista eventos del calendario.
 */
export async function listEvents(accessToken, refreshToken, timeMin, timeMax) {
  const calendar = await _getAuthenticatedCalendarClient(accessToken, refreshToken);
  const res = await calendar.events.list({
    calendarId:   'primary',
    timeMin:      timeMin ? new Date(timeMin).toISOString() : new Date().toISOString(),
    timeMax:      timeMax ? new Date(timeMax).toISOString() : undefined,
    maxResults:   10,
    singleEvents: true,
    orderBy:      'startTime',
    timeZone:     TIMEZONE,
  });
  return res.data.items;
}

/**
 * Crea un evento en el calendario.
 * Si no se pasa `end`, por defecto dura 1 hora.
 */
export async function createEvent(accessToken, refreshToken, eventData) {
  const { summary, description, start } = eventData;
  if (!summary || !start) {
    throw new Error('createEvent requires at least summary and start.');
  }

  // Fecha de inicio
  const startDt = new Date(start);
  // Fecha fin: o la que venga, o +1h
  const endDt = eventData.end
    ? new Date(eventData.end)
    : new Date(startDt.getTime() + 60 * 60 * 1000);

  const calendar = await _getAuthenticatedCalendarClient(accessToken, refreshToken);
  const res = await calendar.events.insert({
    calendarId: 'primary',
    resource: {
      summary,
      description,
      start: { dateTime: startDt.toISOString(), timeZone: TIMEZONE },
      end:   { dateTime: endDt.toISOString(),   timeZone: TIMEZONE },
    },
  });
  return res.data;
}

/**
 * Actualiza un evento existente.
 * Si se pasan `start` o `end`, los ajustamos al formato correcto.
 */
export async function updateEvent(accessToken, refreshToken, eventId, updatedFields) {
  const calendar = await _getAuthenticatedCalendarClient(accessToken, refreshToken);

  const resource = {};
  if (updatedFields.summary)     resource.summary     = updatedFields.summary;
  if (updatedFields.description) resource.description = updatedFields.description;
  if (updatedFields.start) {
    const dt = new Date(updatedFields.start);
    resource.start = { dateTime: dt.toISOString(), timeZone: TIMEZONE };
  }
  if (updatedFields.end) {
    const dt = new Date(updatedFields.end);
    resource.end = { dateTime: dt.toISOString(), timeZone: TIMEZONE };
  }

  const res = await calendar.events.patch({
    calendarId: 'primary',
    eventId,
    resource,
  });
  return res.data;
}

/**
 * Elimina un evento.
 */
export async function deleteEvent(accessToken, refreshToken, eventId) {
  const calendar = await _getAuthenticatedCalendarClient(accessToken, refreshToken);
  await calendar.events.delete({
    calendarId: 'primary',
    eventId,
  });
  return { success: true };
}

// --- NUEVA FUNCIÓN: Mover múltiples eventos ---
export async function moveAllEventsToDate(accessToken, refreshToken, timeMin, timeMax, newStartDate) {
  const client = await getClient(accessToken, refreshToken);
  const calendar = google.calendar({ version: 'v3', auth: client });

  // 1. Listar los eventos en el rango original
  const eventsToMove = await calendar.events.list({
    calendarId: 'primary',
    timeMin: timeMin,
    timeMax: timeMax,
    singleEvents: true, // Esto es importante para eventos que pueden ser parte de una recurrencia
    orderBy: 'startTime',
  });

  const movedEvents = [];
  const errors = [];

  // 2. Iterar sobre cada evento y moverlo
  for (const event of eventsToMove.data.items) {
    if (!event.start || !event.end) {
      console.warn(`Evento ${event.id} no tiene fechas válidas. Saltando.`);
      continue;
    }

    // Calcular las nuevas fechas de inicio y fin manteniendo la duración y hora original
    const originalStartTime = event.start.dateTime ? new Date(event.start.dateTime) : new Date(`${event.start.date}T00:00:00`);
    const originalEndTime = event.end.dateTime ? new Date(event.end.dateTime) : new Date(`${event.end.date}T23:59:59`); // Handle all-day events

    const durationMs = originalEndTime.getTime() - originalStartTime.getTime();

    // newStartDate es 'YYYY-MM-DD'. Extraer la hora del original.
    const originalTimePart = originalStartTime.toISOString().slice(11, 19); // "HH:mm:ss"
    const newStart = new Date(`${newStartDate}T${originalTimePart}`); // Construir nueva fecha con hora original

    const newEnd = new Date(newStart.getTime() + durationMs);

    try {
      // Si el evento era de día completo, mantenerlo de día completo
      if (event.start.date && !event.start.dateTime) {
          const newAllDayDate = new Date(newStartDate);
          await calendar.events.update({
              calendarId: 'primary',
              eventId: event.id,
              resource: {
                  summary: event.summary,
                  description: event.description,
                  start: { date: newAllDayDate.toISOString().slice(0, 10) },
                  end:   { date: newAllDayDate.toISOString().slice(0, 10) }
              }
          });
      } else {
          // Si era un evento con hora, moverlo con hora
          await calendar.events.update({
              calendarId: 'primary',
              eventId: event.id,
              resource: {
                  summary: event.summary,
                  description: event.description,
                  start: { dateTime: newStart.toISOString(), timeZone: event.start.timeZone || 'UTC' },
                  end:   { dateTime: newEnd.toISOString(), timeZone: event.end.timeZone || 'UTC' }
              }
          });
      }
      movedEvents.push({ id: event.id, summary: event.summary, oldStart: originalStartTime.toISOString(), newStart: newStart.toISOString() });
    } catch (error) {
      console.error(`Error al mover evento ${event.id} (${event.summary}):`, error.message);
      errors.push({ id: event.id, summary: event.summary, error: error.message });
    }
  }
  
  return { 
    success: errors.length === 0, 
    movedCount: movedEvents.length,
    errorCount: errors.length,
    movedEvents: movedEvents, 
    errors: errors,
    message: `Intentos de mover ${eventsToMove.data.items.length} eventos. Movidos: ${movedEvents.length}, Errores: ${errors.length}.` 
  };
}