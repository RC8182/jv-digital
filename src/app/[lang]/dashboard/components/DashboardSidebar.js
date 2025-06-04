// src/app/[lang]/dashboard/components/DashboardSidebar.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
// Si quieres iconos, puedes instalar react-icons (npm install react-icons)
// import { FaTimes } from 'react-icons/fa'; 

// Recibe `isOpen` y `onClose` como props para el control externo
export default function DashboardSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const langMatch = pathname.match(/^\/([^/]+)/);
  const lang = langMatch ? langMatch[1] : 'es';

  const navItems = [
    { name: 'Inicio', href: `/${lang}/dashboard` },
    { name: 'Clientes', href: `/${lang}/dashboard/clients` },
    { name: 'Facturas', href: `/${lang}/dashboard/invoices` },
    { name: 'Usuarios', href: `/${lang}/dashboard/users` },
    { name: 'Chat', href: `/${lang}/dashboard/agente/chat` },
    { name: 'Agenda', href: `/${lang}/dashboard/agente/agenda` },
    { name: 'Tareas', href: `/${lang}/dashboard/agente/tareas` }, 
    { name: 'Gestión de Documentos', href: `/${lang}/dashboard/agente/documentos` }, 
  ];

  return (
    // La visibilidad y posición (fixed, transform) se gestionan en DashboardLayoutContent
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white p-6 flex flex-col shadow-lg
      lg:relative lg:translate-x-0 lg:w-64 lg:flex lg:shadow-none
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex items-center justify-between mb-8">
        <span className="text-2xl font-bold text-teal-400">Dashboard</span>
        {/* Botón para cerrar el sidebar en móviles */}
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-white lg:hidden" // Oculto en pantallas grandes
          aria-label="Cerrar menú"
        >
          {/* <FaTimes size={24} /> */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <nav className="flex-1">
        <ul className="space-y-3">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link href={item.href} onClick={onClose}> {/* Cierra el sidebar al navegar en móvil */}
                <span className={`
                  flex items-center p-3 rounded-lg text-lg font-medium transition-colors
                  ${pathname.startsWith(item.href) && item.href !== `/${lang}/dashboard` && item.href !== `/${lang}/dashboard/agente` // Match sub-routes
                    ? 'bg-teal-600 text-white shadow-md' 
                    : pathname === item.href // Exact match for root and agent pages
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}>
                  {item.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {session?.user && (
        <div className="mt-auto pt-6 border-t border-gray-700">
          <p className="text-gray-400 text-sm">Conectado como:</p>
          <p className="font-semibold text-white">{session.user.name || session.user.email}</p>
        </div>
      )}
    </div>
  );
}