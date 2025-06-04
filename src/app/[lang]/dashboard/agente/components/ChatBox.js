// app/[lang]/dashboard/agente/components/ChatBox.js
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';

export default function ChatBox() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState([]); // { id: number, type: 'user' | 'agent', content: string, isAudioResponse?: boolean }
  const [inputMessage, setInputMessage] = useState('');
  
  const [isRecording, setIsRecording] = useState(false);
  const [voiceProcessing, setVoiceProcessing] = useState(false); // STT/TTS en curso
  const [textLoading, setTextLoading] = useState(false); // Carga de la respuesta de texto
  const loading = isRecording || voiceProcessing || textLoading; // Estado de carga general

  // Refs para el micrófono y audio
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null); // Referencia al MediaStream para detener la pista del micrófono
  const audioRef = useRef(null); // Para reproducir el audio del agente
  const audioObjectURLRef = useRef(null); // Para guardar la URL de objeto del audio TTS
  
  const lastInputWasVoice = useRef(false); // Flag para saber si la última entrada fue de voz
  
  const messagesEndRef = useRef(null);

  // Sesión y tokens
  const [sessionId, setSessionId] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentAccessToken, setCurrentAccessToken] = useState(null);
  const [currentRefreshToken, setCurrentRefreshToken] = useState(null);

  // Estado para controlar la visualización del historial
  const [displayingFullHistory, setDisplayingFullHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    let idToUse;
    let userIdToUse = null;
    let accessTokenToUse = null;
    let refreshTokenToUse = null;

    if (status === 'authenticated' && session?.user?.id) {
      idToUse = session.user.id;
      userIdToUse = session.user.id;
      accessTokenToUse = session.accessToken;
      refreshTokenToUse = session.refreshToken;
    } else {
      idToUse = localStorage.getItem('agenteChatSessionId');
      if (!idToUse) {
        idToUse = uuidv4();
        localStorage.setItem('agenteChatSessionId', idToUse);
      }
    }
    setSessionId(idToUse);
    setCurrentUserId(userIdToUse);
    setCurrentAccessToken(accessTokenToUse);
    setCurrentRefreshToken(refreshTokenToUse);

    // Cargar mensajes iniciales (solo los últimos X que usa el LLM)
    const loadInitialMessages = async () => {
      if (idToUse) {
        try {
          const res = await fetch(`/api/agente/chat/history?sessionId=${idToUse}`);
          if (res.ok) {
            const data = await res.json();
            // Mostrar solo los últimos 10 mensajes o un número razonable por defecto
            // Podrías ajustar esto para cargar un subconjunto o solo los que están en la memoria del LLM
            setMessages(data.messages.slice(-10)); // Mostrar los últimos 10 mensajes de la BD
          }
        } catch (error) {
          console.error('Error al cargar mensajes iniciales:', error);
        }
      }
    };
    loadInitialMessages();
  }, [session, status]);

  // Limpieza del ObjectURL al desmontar
  useEffect(() => {
    return () => {
      if (audioObjectURLRef.current) {
        URL.revokeObjectURL(audioObjectURLRef.current);
        audioObjectURLRef.current = null;
      }
      // Asegurarse de detener el micrófono si el componente se desmonta
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Scroll al final del chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Callback para añadir mensajes al historial en el frontend
  // Ahora usa `content` en lugar de `text`
  const addMessageToChat = useCallback((type, content, isAudioResponse = false, id = null) => {
    setMessages(prev => [...prev, { id: id || Date.now(), type, content, isAudioResponse }]);
  }, []);

  // --- Funciones de Grabación de Voz (Microphone) ---
  const startRecording = async () => {
    if (!sessionId) {
      alert("Error: ID de sesión no disponible. Por favor, recarga la página.");
      return;
    }
    try {
      // Solicitar acceso al micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream; // Guardar la referencia al stream para poder detenerlo

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      // Cuando la grabación se detiene, transcribir y procesar
      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        setVoiceProcessing(true); // Indica que el STT está en curso

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
          // Llama a la nueva ruta STT
          const response = await fetch('/api/agente/audio/stt', { 
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || 'Error al transcribir el audio.');
          }
          const data = await response.json();
          const transcribedText = data.text;
          
          setInputMessage(transcribedText); // Rellena el input con el texto transcrito
          lastInputWasVoice.current = true; // Marca que la última entrada fue de voz
          // No añadir el mensaje del usuario aquí, se añadirá al hacer click en "Enviar"
          // O podrías añadirlo aquí y luego solo procesar la respuesta del agente en handleSendMessage
          // Por simplicidad, el mensaje del usuario se añadirá cuando se haga click en "Enviar".

        } catch (err) {
          console.error('Error en STT:', err);
          alert(`Error de voz: ${err.message}. Por favor, intenta de nuevo.`);
        } finally {
          setVoiceProcessing(false); // Finaliza el STT
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error al acceder al micrófono:', err);
      alert('No se pudo acceder al micrófono. Asegúrate de dar permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop(); // Detener la grabación del MediaRecorder
    }
    if (audioStreamRef.current) { // Detener las pistas del micrófono
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    setIsRecording(false); // Asegurar que el estado de grabación se desactive
  };

  // --- Función de envío principal (para texto y voz) ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const messageToSend = inputMessage.trim();
    if (!messageToSend || loading) return;

    // Temporalmente añadir el mensaje del usuario al chat antes de guardarlo en BD
    // El ID real de la BD se actualizará después.
    const tempUserMessageId = Date.now(); 
    addMessageToChat('user', messageToSend, false, tempUserMessageId);
    
    setInputMessage('');
    setTextLoading(true); // Activar carga para el chat de texto

    try {
      // 1. Guardar el mensaje del usuario en la BD
      // Usamos una llamada directa aquí para evitar dependencia circular con saveMessage en la ruta de chat
      const savedUserMessageRes = await fetch('/api/agente/chat/save-message', { // Tendremos que crear esta ruta!
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId, role: 'user', content: messageToSend })
      });
      const savedUserMessageData = await savedUserMessageRes.json();
      // Actualizar el ID del mensaje del usuario en el estado del frontend
      setMessages(prevMessages => prevMessages.map(msg => 
        msg.id === tempUserMessageId ? { ...msg, id: savedUserMessageData.id, content: savedUserMessageData.content } : msg
      ));

      // 2. Enviar el mensaje al agente principal (SIEMPRE como TEXTO)
      const agentRes = await fetch('/api/agente/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: messageToSend,
          sessionId: sessionId,
          userId: currentUserId,
          accessToken: currentAccessToken,
          refreshToken: currentRefreshToken,
        }),
      });

      if (!agentRes.ok) {
        throw new Error(`Error al comunicarse con el agente: ${agentRes.statusText}`);
      }

      const agentData = await agentRes.json();
      const agentResponseText = agentData.content;

      // 3. Guardar la respuesta del agente en la BD (esto ya lo hace la ruta /api/agente/chat)
      // Ahora solo añadirlo al chat del frontend
      // La ruta /api/agente/chat ya guarda la respuesta del asistente en la BD, no necesitamos hacer otra llamada aquí.
      // Se asume que el ID del mensaje del agente ya se maneja internamente en la ruta /api/agente/chat.
      
      // 4. Decidir la modalidad de respuesta (audio o texto)
      if (lastInputWasVoice.current) {
        // Si la última entrada fue de voz, generar respuesta de voz (TTS)
        setVoiceProcessing(true); // Activar carga para TTS
        try {
          const ttsRes = await fetch('/api/agente/audio/tts', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: agentResponseText }),
          });

          if (!ttsRes.ok) {
            const errorData = await ttsRes.json();
            throw new Error(errorData.details || 'Error al generar la voz.');
          }

          const audioBuffer = await ttsRes.arrayBuffer();
          const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });

          // Revocar URL anterior si existe
          if (audioObjectURLRef.current) {
            URL.revokeObjectURL(audioObjectURLRef.current);
          }
          audioObjectURLRef.current = URL.createObjectURL(blob);
          
          if (audioRef.current) {
            audioRef.current.src = audioObjectURLRef.current;
            audioRef.current.play();
          }
          addMessageToChat('agent', agentResponseText, true); // Mostrar texto y marcar como respuesta de audio

        } catch (ttsError) {
          console.error('Error en TTS:', ttsError);
          addMessageToChat('agent', agentResponseText, true);
        } finally {
          setVoiceProcessing(false); // Finalizar TTS
        }
      } else {
        // Si la última entrada fue de texto, simplemente añadir la respuesta de texto
        addMessageToChat('agent', agentResponseText, true);
      }
    } catch (error) {
      console.error('Error enviando mensaje al agente:', error);
      addMessageToChat('agent', agentResponseText, true);
    } finally {
      setTextLoading(false); // Finalizar carga del chat de texto
      lastInputWasVoice.current = false; // Resetear el flag para la próxima interacción
    }
  };

  // Limpia el ObjectURL una vez que el audio ha terminado de reproducirse
  const handleAudioEnded = () => {
    if (audioRef.current) {
      audioRef.current.src = '';
    }
    if (audioObjectURLRef.current) {
      URL.revokeObjectURL(audioObjectURLRef.current);
      audioObjectURLRef.current = null;
    }
  };

  // --- Funciones de Gestión de Historial ---
  const handleLoadFullHistory = async () => {
    if (!sessionId) return;
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/agente/chat/history?sessionId=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages); // Cargar TODO el historial
        setDisplayingFullHistory(true);
      } else {
        throw new Error('Error al cargar el historial completo.');
      }
    } catch (error) {
      console.error('Error cargando historial completo:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!sessionId || !confirm('¿Estás seguro de que quieres borrar TODO el historial de esta conversación? Esta acción es irreversible.')) {
      return;
    }
    setTextLoading(true); // Usamos textLoading para indicar que se está borrando
    try {
      const res = await fetch('/api/agente/chat/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId }),
      });
      if (res.ok) {
        setMessages([]); // Limpiar mensajes en el frontend
        alert('Historial borrado exitosamente.');
      } else {
        throw new Error('Error al borrar el historial.');
      }
    } catch (error) {
      console.error('Error borrando historial:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setTextLoading(false);
      setDisplayingFullHistory(false); // Volver al modo normal después de borrar
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
      return;
    }
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId)); // Eliminación optimista en el frontend
    try {
      const res = await fetch('/api/agente/chat/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: messageId }),
      });
      if (!res.ok) {
        // Si falla, podrías considerar revertir el mensaje al estado o recargar para consistencia
        throw new Error('Error al eliminar el mensaje en el servidor.');
      }
    } catch (error) {
      console.error('Error eliminando mensaje:', error);
      alert(`Error al eliminar el mensaje: ${error.message}`);
    }
  };

  // Renderizar los controles solo cuando la sesión esté cargada y disponible
  const isSessionReady = status === 'authenticated' || (status === 'unauthenticated' && sessionId);

return (
  <div className="flex flex-col h-full w-full bg-gray-700 rounded-lg p-3 sm:p-4 relative overflow-hidden">
    {/* ======================================================================
      Botones de gestión de historial (si la sesión está lista)
    ======================================================================= */}
    {isSessionReady && (
      <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex gap-1 sm:gap-2 z-10">
        <button
          onClick={
            displayingFullHistory
              ? () => setDisplayingFullHistory(false)
              : handleLoadFullHistory
          }
          disabled={loading || historyLoading}
          className="bg-gray-600 hover:bg-gray-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md disabled:opacity-50"
          title={
            displayingFullHistory
              ? "Ocultar Historial Completo"
              : "Mostrar Historial Completo"
          }
        >
          {historyLoading
            ? "Cargando..."
            : displayingFullHistory
            ? "Ocultar"
            : "Historial"}
        </button>
        {displayingFullHistory && (
          <button
            onClick={handleClearHistory}
            disabled={loading || historyLoading}
            className="bg-red-600 hover:bg-red-700 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md disabled:opacity-50"
            title="Borrar Todo el Historial"
          >
            Borrar Todo
          </button>
        )}
      </div>
    )}

    {/* ======================================================================
      Área de mensajes (flex-1 para ocupar todo el espacio y overflow-y-auto 
      para scroll vertical). No necesitamos overflow-x, está bloqueado por overflow-hidden del padre.
    ======================================================================= */}
    <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 mb-3 sm:mb-4 pr-1 sm:pr-2 pt-8 sm:pt-10">
      {messages.length === 0 ? (
        <p className="text-gray-400 text-center mt-8 sm:mt-10 text-sm sm:text-base">
          ¡Hola! ¿En qué puedo ayudarte hoy?
        </p>
      ) : (
        messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`
              p-2 sm:p-2.5 rounded-lg relative group
              ${msg.type === "user"
                ? "bg-blue-600 self-end ml-auto"
                : "bg-gray-600 self-start mr-auto"}
              w-auto max-w-[90%] sm:max-w-[80%]
            `}
          >
            {/* 
              break-words y whitespace-pre-wrap evitan desbordamiento en eje X. 
              En conjunto con overflow-hidden del padre, garantizan que no aparezca scroll horizontal.
            */}
            <p className="text-[13px] sm:text-sm break-words whitespace-pre-wrap">
              {msg.content}
            </p>

            {msg.isAudioResponse && (
              <span className="block text-[10px] sm:text-xs text-gray-400 italic">
                (Respuesta de voz)
              </span>
            )}
            {/* Botón de eliminar mensaje */}
            <button
              onClick={() => handleDeleteMessage(msg.id)}
              className="absolute top-0 right-0 -mt-1 -mr-1 bg-gray-800 text-white rounded-full p-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
              title="Eliminar mensaje"
            >
              ✖
            </button>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>

    {/* ======================================================================
      Formulario de entrada de mensaje
    ======================================================================= */}
    {isSessionReady ? (
      <form onSubmit={handleSendMessage} className="flex gap-1 sm:gap-2 items-center">
        {/* Botón de micrófono */}
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            title="Iniciar Grabación de Voz"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-5 5.93V14a1 1 0 102 0v-.07A7.002 7.002 0 0010 18a1 1 0 100-2 5 5 0 01-3.93-2H7a1 1 0 100 2h.07A7.002 7.002 0 0010 18a1 1 0 100-2V8a3 3 0 01-3-3V4a1 1 0 100-2z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            disabled={voiceProcessing || textLoading}
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed animate-pulse"
            title="Detener Grabación"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 9a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        <input
          type="text"
          value={inputMessage}
          onChange={(e) => {
            setInputMessage(e.target.value);
            lastInputWasVoice.current = false;
          }}
          placeholder={loading ? "Procesando..." : "Escribe o habla con el agente..."}
          className="flex-1 p-2 rounded-lg bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          disabled={loading}
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.000 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            "Enviar"
          )}
        </button>
      </form>
    ) : (
      <p className="text-gray-400 text-center mt-4 text-sm sm:text-base">
        {status === "loading"
          ? "Cargando sesión..."
          : "Inicia sesión o recarga la página para empezar a usar el chat."}
      </p>
    )}

    {/* Reproductor de audio (oculto) */}
    <audio
      ref={audioRef}
      style={{ display: "none" }}
      onEnded={handleAudioEnded}
    ></audio>
  </div>
);

}