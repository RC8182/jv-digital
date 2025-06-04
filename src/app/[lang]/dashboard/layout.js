// src/app/[lang]/dashboard/layout.js
'use client';

import { useSession, SessionProvider, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardSidebar from './DashboardSidebar';

function DashboardLayoutContent({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        Cargando dashboard...
      </div>
    );
  }

  const getDynamicTitle = (currentPath) => {
    const langMatch = currentPath.match(/^\/([^/]+)/);
    const langPrefix = langMatch ? `/${langMatch[1]}` : '';

    if (currentPath === `${langPrefix}/dashboard`) return 'Dashboard Principal';
    if (currentPath.startsWith(`${langPrefix}/dashboard/clients`)) return 'Gestión de Clientes';
    if (currentPath.startsWith(`${langPrefix}/dashboard/invoices`)) return 'Gestión de Facturas';
    if (currentPath.startsWith(`${langPrefix}/dashboard/users`)) return 'Gestión de Usuarios';
    if (currentPath.startsWith(`${langPrefix}/dashboard/agente/chat`)) return 'Agente IA - Chat';
    if (currentPath.startsWith(`${langPrefix}/dashboard/agente/agenda`)) return 'Agente IA - Agenda';
    if (currentPath.startsWith(`${langPrefix}/dashboard/agente/tareas`)) return 'Agente IA - Tareas';
    if (currentPath.startsWith(`${langPrefix}/dashboard/agente/documentos`)) return 'Agente IA - Documentos';
    if (currentPath.startsWith(`${langPrefix}/dashboard/agente`)) return 'Agente IA';
    return 'Dashboard';
  };

  const currentSectionTitle = getDynamicTitle(pathname);

  if (status === 'authenticated') {
// Después:
return (
  <div className="flex min-h-screen bg-gray-900 text-white overflow-x-hidden">
    {/* Sidebar siempre a la izquierda */}
    <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

    {/* Contenedor principal: header + main */}
    <div className="flex-1 flex flex-col w-full">
      <header className="relative flex justify-between items-center gap-4 p-6 bg-gray-800 text-white shadow-md border-b border-gray-700">
        {/* Botón hamburguesa en móvil */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-400 hover:text-white lg:hidden"
          aria-label="Abrir menú"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-3xl font-bold text-teal-400">{currentSectionTitle}</h1>
          {session?.user?.name && (
            <p className="text-lg text-gray-300 mt-1">¡Hola, {session.user.name}!</p>
          )}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="bg-red-600 text-white hover:bg-red-700 px-5 py-2 rounded-lg font-semibold text-base shadow-md transition-colors"
        >
          Cerrar sesión
        </button>
      </header>

      {/* 
        Aquí forzamos `w-full` y `overflow-hidden` de ser necesario. 
        `overflow-auto` controla el scroll vertical, pero no el horizontal 
        (que ya está bloqueado por overflow-x-hidden en el padre).
      */}
      <main className="flex-1 overflow-auto bg-gray-900 p-6 w-full">
        {children}
      </main>
    </div>
  </div>
);

  }

  return null;
}

// El layout envuelve con SessionProvider
export default function Layout({ children }) {
  return (
    <SessionProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SessionProvider>
  );
}
