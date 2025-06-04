// src/app/api/agente/chat/tasks.js
const BASE = `${process.env.NEXTAUTH_URL}/api/dashboard/agente/agenda`;

export const functions = [
  {
    name: 'list_tasks',
    description: 'Obtiene todas las tareas del usuario',
    parameters: { type: 'object', properties: {} }
  },
  {
    name: 'create_task',
    description: 'Registra una nueva tarea',
    parameters: {
      type: 'object',
      properties: {
        title:          { type: 'string', description: 'Título breve de la tarea' },
        description:    { type: 'string', description: 'Descripción detallada de la tarea' },
        dueDate:        { type: 'string', format: 'date', description: 'Fecha límite de la tarea en formato YYYY-MM-DD' },
        estimatedHours: { type: 'number', description: 'Horas estimadas para completar la tarea' },
        priority:       { type: 'string', enum: ['low','med','high'], description: 'Prioridad de la tarea (low, med, high)' },
        category:       { type: 'string', description: 'Categoría de la tarea (ej. Fiscal, Contable, Desarrollo Web, Marketing, Reunión, Administrativo)' },
        project:        { type: 'string', description: 'Nombre del proyecto al que pertenece la tarea' },
        clientName:     { type: 'string', description: 'Nombre del cliente asociado a la tarea' },
        recurrent:      { type: 'string', enum: ['daily','weekly','monthly','quarterly','annual'], description: 'Indica si la tarea es recurrente y su frecuencia (daily, weekly, monthly, quarterly, annual)' },
        requiredTools:  { type: 'array', items: { type: 'string' }, description: 'Lista de herramientas o softwares necesarios para la tarea (ej. ["Contasol", "Excel"])' },
        relatedDocumentIds: { type: 'array', items: { type: 'string' }, description: 'Lista de IDs de documentos relevantes en Qdrant' },
        // Nuevos parámetros para el LLM
        progress:       { type: 'number', description: 'Porcentaje de progreso de la tarea (0-100).' },
        actualHours:    { type: 'number', description: 'Horas reales invertidas en la tarea hasta el momento.' }
      },
      required: ['title']
    }
  },
  {
    name: 'update_task',
    description: 'Actualiza una tarea existente',
    parameters: {
      type: 'object',
      properties: {
        taskId:         { type: 'number', description: 'ID numérico de la tarea a actualizar' },
        title:          { type: 'string' },
        description:    { type: 'string' },
        dueDate:        { type: 'string', format: 'date' },
        estimatedHours: { type: 'number' },
        priority:       { type: 'string', enum: ['low','med','high'] },
        status:         { type: 'string', enum: ['todo','in_progress','done'] },
        category:       { type: 'string' },
        project:        { type: 'string' },
        clientName:     { type: 'string' },
        recurrent:      { type: 'string', enum: ['daily','weekly','monthly','quarterly','annual'] },
        requiredTools:  { type: 'array', items: { type: 'string' } },
        relatedDocumentIds: { type: 'array', items: { type: 'string' } },
        // Nuevos parámetros para el LLM
        progress:       { type: 'number' },
        actualHours:    { type: 'number' }
      },
      required: ['taskId']
    }
  },
  {
    name: 'delete_task',
    description: 'Elimina una tarea',
    parameters: {
      type: 'object',
      properties: {
        taskId: { type: 'number' }
      },
      required: ['taskId']
    }
  },
  {
    name: 'find_task_by_title',
    description: 'Busca tareas del usuario por una parte de su título o por el título completo.',
    parameters: {
      type: 'object',
      properties: {
        titleQuery: { type: 'string', description: 'Parte o título completo de la tarea a buscar.' }
      },
      required: ['titleQuery']
    }
  }
];

async function callAPI(action, llmArgs, userId) {
  console.log('CHAT/TASKS: Llamando a PUT /api/dashboard/agente/agenda con action:', action, 'llmArgs:', llmArgs, 'userId:', userId);
  const res = await fetch(BASE, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...llmArgs, userId })
  });
  return res.json();
}

export async function list_tasks(_, llmArgs, userId) {
  return callAPI('list_tasks', llmArgs, userId);
}

export async function create_task(_, llmArgs, userId) {
  return callAPI('create_task', llmArgs, userId);
}

export async function update_task(_, llmArgs, userId) {
  return callAPI('update_task', llmArgs, userId);
}

export async function delete_task(_, llmArgs, userId) {
  return callAPI('delete_task', llmArgs, userId);
}

export async function find_task_by_title(_, llmArgs, userId) {
  return callAPI('find_task_by_title', llmArgs, userId);
}