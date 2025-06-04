// src/app/api/agente/agenda/tasks.js

import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route.js';
import { listEvents as _listEvents } from '../utils/googleCalendar.js';

const prisma = new PrismaClient();

async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error('No autorizado: Email de usuario no disponible en la sesión.');
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });
  if (!user) {
    throw new Error('Usuario no encontrado en la base de datos para el email de la sesión.');
  }
  return user;
}

export async function listTasks(data, userIdFromCaller = null) {
  const user = userIdFromCaller ? { id: userIdFromCaller } : await getAuthenticatedUser();
  return prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { dueDate: 'asc' }
  });
}

export async function createTask(data, userIdFromCaller = null) {
  const user = userIdFromCaller ? { id: userIdFromCaller } : await getAuthenticatedUser();
  const {
    title,
    description,
    dueDate,
    estimatedHours,
    priority,
    category,
    project,
    clientName,
    recurrent,
    requiredTools,
    relatedDocumentIds,
    progress, // Recibido del frontend/agente
    actualHours // Recibido del frontend/agente
  } = data;

  // Lógica para el progreso inicial al crear una tarea
  let initialProgress = progress;
  let initialActualHours = actualHours;

  if (estimatedHours != null && actualHours != null && actualHours > 0) {
      // Si se proporcionan horas estimadas y trabajadas, calcular el progreso si no se dio explícitamente.
      // O solo usar el progreso si se dio explícitamente.
      if (initialProgress == null) { // Si el progreso no se dio, lo calculamos
          initialProgress = Math.min(100, Math.round((actualHours / estimatedHours) * 100));
      }
  } else if (actualHours == null) { // Si no se dieron actualHours, el progreso y horas trabajadas empiezan en 0
      initialActualHours = 0;
      initialProgress = 0;
  }
  if (initialProgress == null) initialProgress = 0;


  return prisma.task.create({
    data: {
      title,
      description: description || undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      estimatedHours: estimatedHours != null ? Number(estimatedHours) : undefined,
      priority,
      status: 'todo',
      user: { connect: { id: user.id } },
      category: category || undefined,
      project: project || undefined,
      clientName: clientName || undefined,
      recurrent: recurrent || undefined,
      requiredTools: requiredTools || undefined,
      relatedDocumentIds: relatedDocumentIds || undefined,
      progress: initialProgress,
      actualHours: initialActualHours,
    }
  });
}

export async function updateTask(taskId, updates, userIdFromCaller = null) {
  const user = userIdFromCaller ? { id: userIdFromCaller } : await getAuthenticatedUser();
  const data = {};
  
  // Mapear updates a 'data' para Prisma
  if (updates.title)          data.title = updates.title;
  if (updates.description)    data.description = updates.description;
  if (updates.dueDate)        data.dueDate = new Date(updates.dueDate);
  if (updates.estimatedHours != null) data.estimatedHours = Number(updates.estimatedHours);
  if (updates.priority)       data.priority = updates.priority;
  if (updates.status)         data.status = updates.status;

  if (updates.category !== undefined) data.category = updates.category;
  if (updates.project !== undefined) data.project = updates.project;
  if (updates.clientName !== undefined) data.clientName = updates.clientName;
  if (updates.recurrent !== undefined) data.recurrent = updates.recurrent;
  if (updates.requiredTools !== undefined) data.requiredTools = updates.requiredTools;
  if (updates.relatedDocumentIds !== undefined) data.relatedDocumentIds = updates.relatedDocumentIds;
  
  // --- LÓGICA DE PROGRESO Y HORAS EN EL BACKEND ---
  // Obtener la tarea actual para sus valores existentes (estimatedHours, actualHours, status)
  const existingTask = await prisma.task.findUnique({
      where: { id: Number(taskId), userId: user.id },
      select: { estimatedHours: true, actualHours: true, progress: true, status: true }
  });

  const finalEstimatedHours = data.estimatedHours ?? existingTask?.estimatedHours;
  const finalActualHours = data.actualHours ?? existingTask?.actualHours;

  // 1. Manejo del status: Si se marca como 'done', progreso = 100, horas = estimadas.
  if (data.status === 'done') {
      data.progress = 100;
      data.actualHours = finalEstimatedHours ?? finalActualHours ?? 0; // Prioriza estimadas si existen
  } else if (data.status === 'todo' || data.status === 'in_progress') {
      // Si la tarea se reabre o está en progreso:
      // a) Si el usuario/LLM especificó un 'progress' o 'actualHours' al reabrir, se usa.
      // b) Si no se especificó 'progress', lo calculamos si tenemos horas válidas.
      // c) Si no se especificó nada y no hay horas válidas, el progreso puede ser 0 o el último valor conocido.

      // Si se proporciona un progreso manual explícito (y no es 'done')
      if (updates.progress != null && updates.status !== 'done') {
          data.progress = Math.min(100, Math.max(0, Number(updates.progress)));
      } else if (finalEstimatedHours != null && finalEstimatedHours > 0 && finalActualHours != null) {
          // Si no hay progreso manual o status no es 'done', calcular por horas
          data.progress = Math.min(100, Math.round((finalActualHours / finalEstimatedHours) * 100));
      } else {
          // Si no hay estimadas o actuales válidas para calcular, y no hay progreso manual, lo dejamos en 0.
          data.progress = 0;
      }

      // Siempre actualizar actualHours si se proporciona, de lo contrario mantener el existente
      if (updates.actualHours != null) data.actualHours = Number(updates.actualHours);
      else if (existingTask) data.actualHours = existingTask.actualHours; // Mantiene el valor existente si no se actualiza
      else data.actualHours = 0;

  } else {
    // Si no se está actualizando el status a 'done'/'todo'/'in_progress', simplemente pasamos los valores tal cual si se proporcionaron
    if (updates.progress != null) data.progress = Number(updates.progress);
    if (updates.actualHours != null) data.actualHours = Number(updates.actualHours);
  }
  // --- FIN LÓGICA DE PROGRESO Y HORAS EN EL BACKEND ---


  return prisma.task.updateMany({
    where: { id: Number(taskId), userId: user.id },
    data
  });
}

export async function deleteTask(taskId, userIdFromCaller = null) {
  const user = userIdFromCaller ? { id: userIdFromCaller } : await getAuthenticatedUser();
  return prisma.task.deleteMany({
    where: { id: Number(taskId), userId: user.id }
  });
}

export async function planWeek(weekStart, userId, accessToken, refreshToken) {
  if (!userId) {
    throw new Error('userId es requerido para planWeek cuando se llama internamente.');
  }

  const tasks = await prisma.task.findMany({
    where: { userId: userId },
    orderBy: { dueDate: 'asc' }
  });

  let events = [];
  if (accessToken && refreshToken) {
    const from = new Date(`${weekStart}T00:00:00`);
    const to   = new Date(from);
    to.setDate(from.getDate() + 7);

    const eventsRaw = await _listEvents(
      accessToken,
      refreshToken,
      from.toISOString(),
      to.toISOString()
    );

    events = eventsRaw.map(ev => ({
      id:          ev.id,
      summary:     ev.summary,
      description: ev.description || '',
      start:       ev.start.dateTime ?? ev.start.date,
      end:         ev.end.dateTime   ?? ev.end.date
    }));
  }

  return { tasks, events };
}

export async function findTaskByTitle(titleQuery, userIdFromCaller = null) {
  const user = userIdFromCaller ? { id: userIdFromCaller } : await getAuthenticatedUser();
  
  const tasks = await prisma.task.findMany({
    where: {
      userId: user.id,
      title: { contains: titleQuery, mode: 'insensitive' }
    },
    select: { 
      id: true,
      title: true,
      description: true,
      dueDate: true,
      status: true,
      priority: true,
      progress: true,
      estimatedHours: true,
      actualHours: true,
    },
    take: 5,
  });

  if (tasks.length === 0) {
    return { found: false, matches: [] };
  } else if (tasks.length === 1) {
    return { found: true, exactMatch: true, taskId: tasks[0].id, task: tasks[0] };
  } else {
    return { found: true, exactMatch: false, matches: tasks };
  }
}