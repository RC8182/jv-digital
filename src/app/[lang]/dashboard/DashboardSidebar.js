'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
// Importamos el componente CollapsiblePanel
import CollapsiblePanel from './CollapsiblePanel'; 
// Si quieres iconos, puedes instalar react-icons (npm install react-icons)
// import { FaTimes, FaHome, FaUsers, FaFileInvoice, FaDollarSign, FaCalendarAlt, FaRobot, FaTasks, FaFilePdf, FaEnvelope } from 'react-icons/fa'; 

export default function DashboardSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const langMatch = pathname.match(/^\/([^/]+)/);
  const lang = langMatch ? langMatch[1] : 'es';

  // Función auxiliar para determinar si un enlace está activo o si uno de sus sub-enlaces lo está
  const isActive = (href, currentPath) => {
    // Para el enlace raíz, solo es activo si la ruta es exactamente igual
    if (href === `/${lang}/dashboard`) {
      return currentPath === href;
    }
    // Para enlaces de categoría o sub-enlaces, comprueba si la ruta actual empieza con el href
    return currentPath.startsWith(href);
  };

  const navStructure = [
    { 
      name: 'Inicio', 
      href: `/${lang}/dashboard`, 
      // Icon: FaHome 
    },
    {
      name: 'Contabilidad',
      // Icon: FaDollarSign,
      children: [
        { name: 'Gastos', href: `/${lang}/dashboard/agente/contabilidad/gastos` },
        { name: 'Facturas', href: `/${lang}/dashboard/invoices` },
        { name: 'Resumen Trimestral', href: `/${lang}/dashboard/agente/contabilidad/trimestral` },
        { name: 'Clientes', href: `/${lang}/dashboard/clients` }, // Clientes relacionados con facturación
      ]
    },
    {
      name: 'Herramientas del Agente',
      // Icon: FaRobot,
      children: [
        { name: 'Chat del Agente', href: `/${lang}/dashboard/agente/chat` },
        { name: 'Agenda', href: `/${lang}/dashboard/agente/agenda` },
        { name: 'Tareas', href: `/${lang}/dashboard/agente/tareas` }, // pathname: src/app/[lang]/dashboard/tareas/page.js
        { name: 'Gestión de PDFs', href: `/${lang}/dashboard/agente/rag-pdf` }, // pathname: src/app/[lang]/dashboard/rag-pdf/page.js
        { name: 'Gmail', href: `/${lang}/dashboard/agente/gmail` }, // pathname: src/app/[lang]/dashboard/gmail/page.js
      ]
    },
    {
      name: 'Administración',
      // Icon: FaUsers,
      children: [
        { name: 'Usuarios', href: `/${lang}/dashboard/users` },
      ]
    },
  ];

  return (
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

      <nav className="flex-1 overflow-y-auto"> {/* Añadido overflow-y-auto para scroll si muchos ítems */}
        <ul className="space-y-2"> {/* Espaciado entre elementos principales */}
          {navStructure.map((item) => (
            <li key={item.name}>
              {item.children ? (
                // Si tiene hijos, es un CollapsiblePanel
                <CollapsiblePanel 
                  title={item.name} 
                  isOpen={item.children.some(child => isActive(child.href, pathname))} // Abre si algún hijo está activo
                  // Icono opcional para el título del panel: {item.Icon && <item.Icon className="mr-2" />}
                >
                  <ul className="space-y-1 pl-4 mt-2"> {/* Espaciado y padding para sub-ítems */}
                    {item.children.map((child) => (
                      <li key={child.name}>
                        <Link href={child.href} onClick={onClose}>
                          <span className={`
                            flex items-center p-2 rounded-lg text-sm font-medium transition-colors
                            ${isActive(child.href, pathname)
                              ? 'bg-teal-700 text-white shadow-sm' 
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }
                          `}>
                            {/* Icono opcional para el sub-ítem: {child.Icon && <child.Icon className="mr-2" />} */}
                            {child.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CollapsiblePanel>
              ) : (
                // Si no tiene hijos, es un enlace directo
                <Link href={item.href} onClick={onClose}>
                  <span className={`
                    flex items-center p-3 rounded-lg text-lg font-medium transition-colors
                    ${isActive(item.href, pathname)
                      ? 'bg-teal-600 text-white shadow-md' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}>
                    {/* Icono opcional para el ítem directo: {item.Icon && <item.Icon className="mr-2" />} */}
                    {item.name}
                  </span>
                </Link>
              )}
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