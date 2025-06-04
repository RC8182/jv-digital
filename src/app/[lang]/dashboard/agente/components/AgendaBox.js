// src/app/[lang]/dashboard/agente/components/AgendaBox.js
'use client';
import { useState, useEffect } from 'react';

export default function AgendaBox() {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(false);

  /** Descarga los eventos de los próximos 7 días */
  const fetchEvents = async () => {
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);            // YYYY-MM-DD
    const seven = new Date(Date.now() + 7*864e5).toISOString().slice(0, 10);
    const res   = await fetch(`/api/agente/agenda?from=${today}&to=${seven}`);
    const { events = [] } = await res.json();
    setEvents([...new Map(events.map(e => [e.id, e])).values()]);   // sin duplicados
    setLoading(false);
  };

  /* carga inicial */
  useEffect(() => { fetchEvents(); }, []);

  return (
    <div className="bg-gray-800 text-white p-4 rounded-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Agenda (próx. 7 días)</h2>
        <button
          onClick={fetchEvents}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded font-bold"
          disabled={loading}
        >
          {loading ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>

      {loading ? (
        <p>Cargando…</p>
      ) : (
        <ul className="space-y-2 overflow-y-auto flex-1">
          {events.length ? (
            events.map(ev => (
              <li key={ev.id} className="border p-2 rounded">
                <p className="font-bold">{ev.summary}</p>
                <p className="text-sm">
                  {new Date(ev.start).toLocaleString()} —{' '}
                  {new Date(ev.end).toLocaleString()}
                </p>
              </li>
            ))
          ) : (
            <p>No hay eventos.</p>
          )}
        </ul>
      )}
    </div>
  );
}
