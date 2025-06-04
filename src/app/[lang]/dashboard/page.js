// src/app/[lang]/dashboard/page.js
'use client'; 

import AgendaBox from './agente/components/AgendaBox';
import ChatBox from './agente/components/ChatBox';
import EmailBox from './agente/components/EmailBox';
import PdfManager from './agente/components/PdfManager';
import TaskBox from './agente/components/TaskBox';
import CollapsiblePanel from './components/CollapsiblePanel';




export default function DashboardHomePage() {

  return (
    // Quitamos el padding global y el fondo si ya el layout los provee.
    // El layout ya se encarga de 'min-h-screen' y 'bg-gray-900 text-white'.
    <div className="space-y-8"> {/* Mantener el espacio entre secciones */}
      {/* 
        ELIMINADO: Encabezado principal del Dashboard 
        Ahora se renderiza en el layout.js para todas las páginas del dashboard.
      */}

      {/* Contenido en dos columnas, ahora con paneles colapsables */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <section className="space-y-6">
          <CollapsiblePanel title="Chat con el Agente" defaultOpen={true}>
            <ChatBox />
          </CollapsiblePanel>

          <CollapsiblePanel title="Gestión de Documentos" defaultOpen={false}>
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