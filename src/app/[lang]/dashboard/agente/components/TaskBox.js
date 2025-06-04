// src/app/[lang]/agente/components/TaskBox.js
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export default function TaskBox() {
  const { data: session } = useSession();
  const userId = session?.user?.id; // Obtener el userId de la sesión

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [showForm, setShowForm] = useState(false);

  const initialFormState = {
    id: null,
    title: '',
    description: '',
    dueDate: '',
    estimatedHours: '',
    priority: 'med',
    workedHours: '', // Campo para input del usuario (se mapea a actualHours en saveTask)
    progress: '',    // Campo para input del usuario (se mapea a progress en saveTask)
  };
  const [form, setForm] = useState(initialFormState);

  // Función para calcular el progreso en porcentaje (para la UI y para enviar al backend)
  const calculateProgress = useCallback((estimated, actual) => {
    const numEstimated = parseFloat(estimated);
    const numActual = parseFloat(actual);

    if (isNaN(numEstimated) || isNaN(numActual) || numEstimated <= 0) {
      return 0; // Si no hay horas estimadas válidas o no son números, el progreso es 0
    }
    const progress = (numActual / numEstimated) * 100;
    return Math.min(100, Math.round(progress)); // Limitar a 100% y redondear
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!userId) {
      setMessage('Inicia sesión para ver tus tareas.');
      setTasks([]);
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/dashboard/agente/agenda', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list_tasks', userId: userId })
      });
      if (!res.ok) throw new Error(`Error al cargar tareas: ${res.statusText}`);
      const result = await res.json();
      setTasks(result || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setMessage(`Error al cargar tareas: ${error.message}`);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const saveTask = async e => {
    e.preventDefault();
    if (!userId) {
      setMessage('Inicia sesión para gestionar tareas.');
      return;
    }

    setLoading(true);
    setMessage('');

    const parseNumberOrNull = (value) => {
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    };

    const parsedEstimatedHours = parseNumberOrNull(form.estimatedHours);
    const parsedWorkedHours = parseNumberOrNull(form.workedHours);
    const parsedProgress = parseNumberOrNull(form.progress);

    // Lógica para determinar el progreso a enviar al backend
    let progressToSend;
    if (parsedProgress != null) {
      // Si el usuario puso un progreso manual, ese tiene prioridad
      progressToSend = parsedProgress;
    } else if (parsedEstimatedHours != null && parsedWorkedHours != null) {
      // Si no hay progreso manual, pero sí horas estimadas y trabajadas, lo calculamos
      progressToSend = calculateProgress(parsedEstimatedHours, parsedWorkedHours);
    } else {
      // Si no hay suficiente información, el progreso es null o 0
      progressToSend = null; 
    }

    const dataToSend = {
      title: form.title,
      description: form.description,
      dueDate: form.dueDate || null,
      estimatedHours: parsedEstimatedHours,
      priority: form.priority,
      progress: progressToSend, // Enviamos el progreso determinado
      actualHours: parsedWorkedHours, // Enviamos las horas trabajadas
    };

    const methodAction = form.id ? 'update_task' : 'create_task';
    const body = {
      action: methodAction,
      userId: userId,
      ...(form.id ? { taskId: form.id, ...dataToSend } : { ...dataToSend })
    };

    try {
      const res = await fetch('/api/dashboard/agente/agenda', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error al guardar tarea: ${errorData.error || res.statusText}`);
      }

      setMessage(`Tarea ${form.id ? 'actualizada' : 'añadida'} correctamente.`);
      setForm(initialFormState);
      setShowForm(false);
      await fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      setMessage(`Error al guardar tarea: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const editTask = task => {
    setForm({
      id: task.id,
      title: task.title,
      description: task.description ?? '',
      dueDate: task.dueDate?.split('T')[0] || '',
      estimatedHours: task.estimatedHours ?? '',
      workedHours: task.actualHours ?? '', 
      priority: task.priority ?? 'med',
      progress: task.progress ?? '', 
    });
    setShowForm(true);
  };

  const toggleTaskCompletion = async (task) => {
    if (!userId) return;
    setMessage('');
    setLoading(true);

    const newStatus = task.status === 'done' ? 'todo' : 'done';
    const dataToUpdate = { status: newStatus };

    if (newStatus === 'done') {
      dataToUpdate.progress = 100;
      dataToUpdate.actualHours = task.estimatedHours ?? task.actualHours ?? 0;
    } else {
      // --- CAMBIO AQUÍ: Resetear progreso y horas al reabrir ---
      dataToUpdate.progress = 0; 
      dataToUpdate.actualHours = 0; 
    }

    try {
      const res = await fetch('/api/dashboard/agente/agenda', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_task',
          userId: userId,
          taskId: task.id,
          ...dataToUpdate
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error al ${newStatus === 'done' ? 'completar' : 'reabrir'} tarea: ${errorData.error || res.statusText}`);
      }

      setMessage(`Tarea marcada como ${newStatus === 'done' ? 'completada' : 'pendiente'}.`);
      await fetchTasks();
    } catch (error) {
      console.error(`Error al ${newStatus === 'done' ? 'completar' : 'reabrir'} tarea:`, error);
      setMessage(`Error al ${newStatus === 'done' ? 'completar' : 'reabrir'} tarea: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  const deleteTask = async id => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    if (!userId) return;
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/agente/agenda', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_task', userId: userId, taskId: id })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error al eliminar tarea: ${errorData.error || res.statusText}`);
      }
      setMessage('Tarea eliminada correctamente.');
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      setMessage(`Error al eliminar tarea: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [userId, fetchTasks]);

  const handleAddTaskClick = () => {
    setForm(initialFormState);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setForm(initialFormState);
    setShowForm(false);
  };

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-semibold">Tus Tareas Personales</h3>
        <button
          onClick={handleAddTaskClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md font-bold text-sm flex items-center gap-1"
          disabled={loading}
        >
          <span className="text-xl">+</span> Añadir Tarea
        </button>
      </div>

      {message && <p className="mb-3 text-yellow-300">{message}</p>}

      {showForm && (
        <div className="mb-6 p-4 rounded-lg bg-gray-600 shadow-inner">
          <h4 className="text-lg font-bold mb-3">{form.id ? 'Editar Tarea' : 'Nueva Tarea'}</h4>
          <form onSubmit={saveTask} className="space-y-2">
            <input
              type="text"
              placeholder="Título de la tarea"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full border p-2 rounded text-black bg-gray-200"
              required
            />
            <textarea
              placeholder="Descripción (opcional)"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border p-2 rounded text-black bg-gray-200"
            />
            <label className="block text-gray-300 text-sm pt-1">Fecha límite (opcional):</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })}
              className="w-full border p-2 rounded text-black bg-gray-200"
            />
            <label className="block text-gray-300 text-sm pt-1">Horas estimadas (opcional):</label>
            <input
              type="number"
              placeholder="Horas estimadas"
              value={form.estimatedHours}
              onChange={e => setForm({ ...form, estimatedHours: e.target.value })}
              className="w-full border p-2 rounded text-black bg-gray-200"
              min="0"
              step="0.5"
            />
            <label className="block text-gray-300 text-sm pt-1">Horas trabajadas (opcional):</label>
            <input
              type="number"
              placeholder="Horas trabajadas"
              value={form.workedHours}
              onChange={e => setForm({ ...form, workedHours: e.target.value })}
              className="w-full border p-2 rounded text-black bg-gray-200"
              min="0"
              step="0.1"
            />
            <label className="block text-gray-300 text-sm pt-1">Progreso % (opcional):</label>
            <input
              type="number"
              placeholder="Progreso (0-100)"
              value={form.progress}
              onChange={e => setForm({ ...form, progress: e.target.value })}
              className="w-full border p-2 rounded text-black bg-gray-200"
              min="0"
              max="100"
              step="1"
            />
            <label className="block text-gray-300 text-sm pt-1">Prioridad:</label>
            <select
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
              className="w-full border p-2 rounded text-black bg-gray-200"
            >
              <option value="low">Baja</option>
              <option value="med">Media</option>
              <option value="high">Alta</option>
            </select>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full disabled:opacity-50"
              disabled={loading}
            >
              {form.id ? 'Actualizar tarea' : 'Añadir tarea'}
            </button>
            <button
              type="button"
              onClick={handleCancelForm}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded w-full mt-2"
              disabled={loading}
            >
              Cancelar
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p>Cargando tareas…</p>
      ) : (
        <ul className="space-y-2 mb-6 max-h-80 overflow-y-auto pr-1">
          {tasks.length ? (
            tasks.map(t => {
              // --- LÓGICA DE PROGRESO CORREGIDA Y MEJORADA ---
              // La lógica para la visualización siempre prevalece la del cálculo si no está completada
              let currentProgress;
              if (t.status === 'done') {
                currentProgress = 100; // Si está completada, siempre 100%
              } else {
                // Si la tarea NO está completada, calculamos el progreso basado en horas
                // Si no hay horas estimadas o actuales, se asume 0 para el cálculo visual.
                currentProgress = calculateProgress(t.estimatedHours, t.actualHours);
              }
              // --------------------------------------------------

              const displayWorkedHours = t.actualHours ?? 0;

              return (
                <li key={t.id} className="border border-gray-600 p-3 rounded-lg bg-gray-700 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className={`font-bold text-lg ${t.status === 'done' ? 'line-through text-gray-400' : 'text-white'}`}>{t.title}</p>

                      {t.description && (
                        <p className="text-sm text-gray-300 mt-1">{t.description}</p>
                      )}
                      {t.dueDate && (
                        <p className="text-sm text-gray-300">Fecha límite: {new Date(t.dueDate).toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Horas estimadas: {t.estimatedHours ?? 'N/A'}h · Horas trabajadas: {displayWorkedHours}h
                        <br />
                        Prioridad: {t.priority} · Estado: {t.status}
                      </p>

                      {/* Barra de progreso: Muestra si hay horas estimadas o si el progreso es > 0 o si está completada */}
                      {((t.estimatedHours > 0 && t.actualHours != null) || currentProgress > 0 || t.status === 'done') && (
                        <div className="w-full bg-gray-600 rounded-full h-2.5 mt-2">
                          <div
                            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${currentProgress}%` }}
                            title={`Progreso: ${currentProgress}%`}
                          ></div>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Progreso: {currentProgress}%
                      </p>

                    </div>
                    <div className="flex gap-2 text-sm mt-1 ml-4 flex-shrink-0">
                      <button onClick={() => editTask(t)} className="text-blue-400" title="Editar">✏️</button>
                      <button
                        onClick={() => toggleTaskCompletion(t)}
                        className={`px-3 py-1 rounded-md font-bold text-sm flex items-center gap-1 ${
                          t.status === 'done' ? 'bg-gray-500 hover:bg-gray-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                        title={t.status === 'done' ? 'Marcar como pendiente' : 'Marcar como completada'}
                      >
                        {t.status === 'done' ? (
                          <>✅ Reabrir</>
                        ) : (
                          <>⬜ Completar</>
                        )}
                      </button>
                      <button onClick={() => deleteTask(t.id)} className="text-red-400" title="Eliminar">🗑️</button>
                    </div>
                  </div>
                </li>
              );
            })
          ) : (
            <p className="text-center py-4 text-gray-400">No hay tareas.</p>
          )}
        </ul>
      )}
    </div>
  );
}