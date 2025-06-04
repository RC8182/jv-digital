// src/app/[lang]/agente/components/EmailBox.js
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';

export default function EmailBox() {
  const { data: session } = useSession();
  const userId = session?.user?.id; // Obtener el userId de la sesión

  // Definir los filtros deseados
  const YEAR_FILTER = 'after:2025/01/01'; // Ejemplo de filtro de fecha
  const ALLOWED_DOMAINS = ['ceoe-tenerife.com', 'granadilladeabona.org']; // Lista de dominios que queremos filtrar
  // Si necesitas más dominios, añádelos aquí. Ej: ['ceoe.es', 'domain2.com']

  // Construir la parte de la consulta de dominios dinámicamente
  const getDomainQueryPart = useCallback((domains) => {
    if (!domains || domains.length === 0) return '';
    if (domains.length === 1) return `from:${domains[0]}`;
    // Si hay múltiples dominios, se usa `from:(domain1 OR domain2)`
    return `from:(${domains.map(d => d).join(' OR ')})`;
  }, []);

  // La consulta de Gmail final se construye automáticamente usando useMemo
  // Esta será la `q` (query) enviada a la API de Gmail.
  const emailQuery = useMemo(() => {
    const domainPart = getDomainQueryPart(ALLOWED_DOMAINS);
    return `${YEAR_FILTER}${domainPart ? ` ${domainPart}` : ''}`;
  }, [getDomainQueryPart, ALLOWED_DOMAINS, YEAR_FILTER]); // Añadir YEAR_FILTER como dependencia


  // --- Estados del componente ---
  const [emails, setEmails] = useState([]); // Lista de metadatos de correos
  const [selectedEmail, setSelectedEmail] = useState(null); // Correo seleccionado para ver contenido completo
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showEmailDetail, setShowEmailDetail] = useState(false); // Para mostrar/ocultar el detalle del correo
  const [nextPageToken, setNextPageToken] = useState(null); // Para paginación

  // Función para obtener la lista de correos (metadatos)
  const fetchEmails = useCallback(async (pageTokenToUse = null) => {
    if (!userId) {
      setMessage('Inicia sesión para ver tus correos.');
      setEmails([]);
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      const params = new URLSearchParams();
      // Usamos la query generada automáticamente para `q`
      if (emailQuery) params.append('q', emailQuery); 
      if (pageTokenToUse) params.append('pageToken', pageTokenToUse);
      params.append('maxResults', '10'); // Número de correos por página

      const url = `/api/dashboard/agente/gmail/list?${params.toString()}`;
      
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        let errorData = {};
        try { errorData = await res.json(); } catch (e) { /* ignore JSON parse error */ }
        throw new Error(`Error al cargar correos: ${errorData.error || res.statusText}`);
      }

      const result = await res.json();
      
      // Si hay un pageToken, añadir a la lista existente; de lo contrario, reemplazar
      if (pageTokenToUse) {
        setEmails(prevEmails => [...prevEmails, ...(result.emails || [])]);
      } else {
        setEmails(result.emails || []);
      }
      setNextPageToken(result.nextPageToken || null);

      if (!result.emails || result.emails.length === 0) {
        setMessage('No se encontraron correos con los filtros actuales.');
      } else {
        setMessage(''); // Limpiar mensaje si se encontraron correos
      }

    } catch (error) {
      console.error('Error fetching emails:', error);
      setMessage(`Error al cargar correos: ${error.message}`);
      setEmails([]);
      setNextPageToken(null);
    } finally {
      setLoading(false);
    }
  }, [userId, emailQuery]); // emailQuery es una dependencia

  // Función para leer el contenido completo de un correo
  const handleReadEmail = useCallback(async (emailId) => {
    if (!userId) {
      setMessage('Inicia sesión para leer correos.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      // Usamos GET para la ruta /api/agente/gmail/read
      const res = await fetch(`/api/dashboard/agente/gmail/read?id=${emailId}`, {
        method: 'GET', // Método GET
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        let errorData = {};
        try { errorData = await res.json(); } catch (e) { /* ignore JSON parse error */ }
        throw new Error(`Error al leer correo: ${errorData.error || res.statusText}`);
      }

      const result = await res.json();
      setSelectedEmail(result); // Guardar el correo completo
      setShowEmailDetail(true); // Mostrar la vista de detalle
    } catch (error) {
      console.error('Error reading email content:', error);
      setMessage(`Error al leer el contenido del correo: ${error.message}`);
      setSelectedEmail(null);
      setShowEmailDetail(false);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Manejador para el envío del formulario de búsqueda (si tuvieras un input de búsqueda manual)
  // En esta versión, la query se genera automáticamente por emailQuery, no por un input del usuario.
  const handleSearchSubmit = (e) => {
    e.preventDefault(); 
    setNextPageToken(null); // Resetear paginación al hacer una nueva búsqueda
    fetchEmails(); // Iniciar la búsqueda con la query actual (generada automáticamente)
  };

  // Manejador para cargar más correos (botón "Cargar más")
  const handleLoadMore = () => {
    if (nextPageToken && !loading) {
      fetchEmails(nextPageToken); // Pasar el token de la siguiente página
    }
  };

  // Helper para formatear fechas
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString); // Date constructor acepta ISO strings
      if (isNaN(date.getTime())) return 'Fecha inválida';

      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  // Carga inicial de correos cuando el userId está disponible o la consulta generada cambia
  useEffect(() => {
    if (userId) {
      fetchEmails();
    }
  }, [userId, fetchEmails]);

  // Manejador para cerrar la vista de detalle del correo
  const handleCloseEmailDetail = () => {
    setShowEmailDetail(false);
    setSelectedEmail(null);
    setMessage('');
  };

  return (
    <div className="p-4 bg-gray-800 rounded-xl shadow h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">Gestión de Correos</h2>

      {message && <p className="mb-3 text-yellow-300 text-center">{message}</p>}

      {/* Estado de carga */}
      {loading && emails.length === 0 && ( // Mostrar cargando solo si no hay correos previos
        <p className="text-center py-4 text-gray-400">Cargando correos filtrados...</p>
      )}

      {/* Lista de correos (mostrar solo si no estamos en la vista de detalle) */}
      {!showEmailDetail && (
        <>
          {emails.length > 0 ? (
            <ul className="space-y-2 mb-6 max-h-80 overflow-y-auto pr-1">
              {emails.map(email => (
                <li 
                  key={email.id} 
                  className="border border-gray-600 p-3 rounded-lg bg-gray-700 shadow-sm cursor-pointer hover:bg-gray-600" 
                  onClick={() => handleReadEmail(email.id)}
                >
                  <p className="font-bold text-white">{email.subject || 'Sin Asunto'}</p>
                  <p className="text-sm text-gray-300">De: {email.from}</p>
                  <p className="text-xs text-gray-400">Fecha: {formatDate(email.date)}</p>
                  {email.snippet && <p className="text-sm text-gray-300 mt-1 truncate">{email.snippet}</p>}
                </li>
              ))}
            </ul>
          ) : (
            // Mostrar mensaje si no hay correos y no está cargando
            !loading && <p className="text-center py-4 text-gray-400">{message || 'No se encontraron correos con los filtros actuales.'}</p>
          )}
          
          {nextPageToken && (
            <button
              onClick={handleLoadMore}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md w-full disabled:opacity-50 mt-4"
              disabled={loading}
            >
              {loading ? 'Cargando más...' : 'Cargar más correos'}
            </button>
          )}
        </>
      )}

      {/* Vista de detalle de un correo */}
      {showEmailDetail && selectedEmail && (
        <div className="mb-6 p-4 rounded-lg bg-gray-600 shadow-inner flex flex-col flex-1">
          <button 
            onClick={handleCloseEmailDetail} 
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm mb-3 self-start"
          >
            ← Volver a la lista
          </button>
          <h4 className="text-lg font-bold text-white mb-2">{selectedEmail.subject || 'Sin Asunto'}</h4>
          <p className="text-sm text-gray-300">De: {selectedEmail.from}</p>
          <p className="text-xs text-gray-400 mb-3">Fecha: {formatDate(selectedEmail.date)}</p>
          
          {/* Renderizar el cuerpo del correo. Usar dangerouslySetInnerHTML para HTML. */}
          {selectedEmail.bodyHtml ? (
            <div 
              className="bg-gray-800 p-3 rounded text-gray-200 text-sm overflow-auto max-h-[calc(100vh-350px)] email-content" 
              dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }} 
            />
          ) : (selectedEmail.bodyPlain ? (
            <pre className="bg-gray-800 p-3 rounded text-gray-200 text-sm overflow-auto max-h-[calc(100vh-350px)] whitespace-pre-wrap">
              {selectedEmail.bodyPlain}
            </pre>
          ) : (
            <p className="text-gray-400">No hay contenido de cuerpo disponible.</p>
          ))}

          {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-300 font-bold mb-2">Adjuntos:</p>
              <ul className="list-disc list-inside text-sm text-blue-300">
                {selectedEmail.attachments.map(att => (
                  <li key={att.attachmentId || att.filename}>
                    {att.filename} ({att.mimeType})
                    {/* Para descargar el adjunto, necesitarías una API route como /api/agente/gmail/attachment?id={att.attachmentId}&messageId={selectedEmail.id} */}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}