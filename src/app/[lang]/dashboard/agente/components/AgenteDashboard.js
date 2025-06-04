'use client';

// import { signOut, useSession } from 'next-auth/react';
import PdfManager from './PdfManager';
import ChatBox from './ChatBox';
import AgendaBox from './AgendaBox';
import TaskBox from './TaskBox';
import CollapsiblePanel from './CollapsiblePanel';
import EmailBox from './EmailBox';

export default function AgenteDashboard() {
  // const { data: session } = useSession();

  // ────────── Dashboard para usuario autenticado ──────────
  return (
    <div className="p-6 space-y-8 bg-gray-900 min-h-screen text-white">

      {/* Contenido en dos columnas, ahora con paneles colapsables */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <section className="space-y-6">
          <CollapsiblePanel title="Chat con el Agente" defaultOpen={true}>
            <ChatBox />
          </CollapsiblePanel>

          <CollapsiblePanel title="Gestión de Documentos" defaultOpen={false}> {/* Puedes decidir cuál quieres que esté abierto por defecto */}
            <PdfManager />
          </CollapsiblePanel>
        </section>

        {/* Columna derecha */}
        <section className="space-y-6">
          <CollapsiblePanel title="Agenda Semanal" defaultOpen={true}>
            <AgendaBox />
          </CollapsiblePanel>

          <CollapsiblePanel title="Tareas Personales" defaultOpen={true}>
            <TaskBox />
          </CollapsiblePanel>

          <CollapsiblePanel title="CEOE Emails" defaultOpen={true}>
            <EmailBox />
          </CollapsiblePanel>
        </section>
      </main>
    </div>
  );
}
