// src/app/api/agente/agenda/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route.js';

import {
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from './events.js';

import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  planWeek,
  findTaskByTitle // ¡Importar la nueva función!
} from './tasks.js';

export const runtime = 'nodejs';

async function getGoogleAuthTokens(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken || !session.refreshToken) {
    throw new Error(
      'No authenticated Google session found. Please sign in with Google Calendar permissions.'
    );
  }
  return { accessToken: session.accessToken, refreshToken: session.refreshToken };
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({
        events: [],
        message: 'No Google Calendar access token found.'
      });
    }
    const { accessToken, refreshToken } = session;
    const url    = new URL(req.url);
    const from   = url.searchParams.get('from');
    const to     = url.searchParams.get('to');

    const timeMin = from
      ? new Date(`${from}T00:00:00`).toISOString()
      : new Date().toISOString();
    const timeMax = to
      ? new Date(`${to}T23:59:59`).toISOString()
      : undefined;

    const eventsRaw = await listEvents(accessToken, refreshToken, timeMin, timeMax);
    const events = eventsRaw.map(ev => ({
      id:          ev.id,
      summary:     ev.summary,
      description: ev.description ?? '',
      start:       ev.start.dateTime ?? ev.start.date,
      end:         ev.end.dateTime   ?? ev.end.date,
      htmlLink:    ev.htmlLink,
    }));
    return NextResponse.json({ events });
  } catch (err) {
    console.error('GET /api/agente/agenda error:', err);
    return NextResponse.json({ events: [], error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { accessToken, refreshToken } = await getGoogleAuthTokens(req);
    const body = await req.json(); // { summary, description, start, end }
    const created = await createEvent(accessToken, refreshToken, body);
    return NextResponse.json({ created });
  } catch (err) {
    console.error('POST /api/agente/agenda Error:', err.message);
    const status = err.message.includes('No authenticated Google session') ? 401 : 500;
    return NextResponse.json({ error: 'internal', details: err.message }, { status });
  }
}

export async function PATCH(req) {
  try {
      const { accessToken, refreshToken } = await getGoogleAuthTokens(req);
      const body = await req.json(); // { eventId, ...updates }
      const updated = await updateEvent(
          accessToken,
          refreshToken,
          body.eventId,
          body
      );
      return NextResponse.json({ updated });
  } catch (err) {
      console.error('PATCH /api/agente/agenda Error:', err.message);
      const status = err.message.includes('No authenticated Google session') ? 401 : 500;
      return NextResponse.json({ error: 'internal', details: err.message }, { status });
  }
}

export async function DELETE(req) {
  try {
      const { accessToken, refreshToken } = await getGoogleAuthTokens(req);
      const url     = new URL(req.url);
      const eventId = url.searchParams.get('id');
      if (!eventId) {
          return NextResponse.json({ error: 'Falta el parámetro "id" del evento.' }, { status: 400 });
      }
      await deleteEvent(accessToken, refreshToken, eventId);
      return NextResponse.json({ ok: true });
  } catch (err) {
      console.error('DELETE /api/agente/agenda Error:', err.message);
      const status = err.message.includes('No authenticated Google session') ? 401 : 500;
      return NextResponse.json({ error: 'internal', details: err.message }, { status });
  }
}

export async function PUT(req) {
  const body = await req.json();
  const { action, userId, ...args } = body; 

  console.log('AGENDA/ROUTE PUT: Datos recibidos. action:', action, 'userId:', userId, 'args:', args);

  try {
    switch (action) {
      case 'list_tasks':
        return NextResponse.json(await listTasks(args, userId)); 
      case 'create_task':
        return NextResponse.json(await createTask(args, userId)); 
      case 'update_task':
        return NextResponse.json(await updateTask(args.taskId, args, userId)); 
      case 'delete_task':
        return NextResponse.json(await deleteTask(args.taskId, userId)); 
      // --- NUEVA ACCIÓN PARA LA RUTA PUT ---
      case 'find_task_by_title':
        return NextResponse.json(await findTaskByTitle(args.titleQuery, userId));
      case 'plan_week':
        console.warn(`AGENDA/ROUTE PUT: Acción 'plan_week' no esperada aquí. La ruta correcta para el agente es /api/agente/agenda/plan-week (POST).`);
        return NextResponse.json({ error: "La acción 'plan_week' debe llamarse a través de /api/agente/agenda/plan-week (POST) con userId y tokens." }, { status: 400 });
      default:
        console.warn(`AGENDA/ROUTE PUT: Acción no reconocida: ${action}`);
        return NextResponse.json({ error: 'Acción no reconocida.' }, { status: 400 });
    }
  } catch (err) {
    console.error('PUT /api/agente/agenda error:', err.message);
    if (err.message.includes('No autorizado: Email de usuario no disponible en la sesión.')) {
      return NextResponse.json(
        { error: 'No autorizado para acceder a tareas/agenda. Por favor, inicia sesión.' },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}