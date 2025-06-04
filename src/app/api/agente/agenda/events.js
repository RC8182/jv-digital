// src/app/api/agente/agenda/events.js

import {
  listEvents as _listEvents,
  createEvent as _createEvent,
  updateEvent as _updateEvent,
  deleteEvent as _deleteEvent
} from '../utils/googleCalendar.js';

/**
 * Wrapper sobre utils/googleCalendar para desacoplar en un módulo
 */
export async function listEvents(accessToken, refreshToken, timeMin, timeMax) {
  return _listEvents(accessToken, refreshToken, timeMin, timeMax);
}

export async function createEvent(accessToken, refreshToken, eventData) {
  return _createEvent(accessToken, refreshToken, eventData);
}

export async function updateEvent(accessToken, refreshToken, eventId, updates) {
  return _updateEvent(accessToken, refreshToken, eventId, updates);
}

export async function deleteEvent(accessToken, refreshToken, eventId) {
  return _deleteEvent(accessToken, refreshToken, eventId);
}
