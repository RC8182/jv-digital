// app/[lang]/dashboard/agente/components/ChatBox.js
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';

export default function ChatBox() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState([]); // { id, type: 'user' | 'agent', content, isAudioResponse? }
  const [inputMessage, setInputMessage] = useState('');

  /* ────────────────────────────────
     🔹 Textarea auto-resize helpers
  ──────────────────────────────── */
  const textareaRef = useRef(null);
  const autoResize = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };

  /* ────────────────────────────────
     Estado de voz / carga
  ──────────────────────────────── */
  const [isRecording, setIsRecording] = useState(false);
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [textLoading, setTextLoading] = useState(false);
  const loading = isRecording || voiceProcessing || textLoading;

  /* ────────────────────────────────
     Refs de audio
  ──────────────────────────────── */
  const mediaRecorderRef   = useRef(null);
  const audioChunksRef     = useRef([]);
  const audioStreamRef     = useRef(null);
  const audioRef           = useRef(null);
  const audioObjectURLRef  = useRef(null);
  const lastInputWasVoice  = useRef(false);
  const messagesEndRef     = useRef(null);

  /* ────────────────────────────────
     Sesión y tokens
  ──────────────────────────────── */
  const [sessionId,         setSessionId]         = useState('');
  const [currentUserId,     setCurrentUserId]     = useState(null);
  const [currentAccessToken,setCurrentAccessToken]= useState(null);
  const [currentRefreshToken,setCurrentRefreshToken]=useState(null);
  const [isReadyToChat,     setIsReadyToChat]     = useState(false);

  /* ────────────────────────────────
     Historial
  ──────────────────────────────── */
  const [displayingFullHistory, setDisplayingFullHistory] = useState(false);
  const [historyLoading,        setHistoryLoading]        = useState(false);

  /* ────────────────────────────────
     Inicialización de sesión + historial
  ──────────────────────────────── */
  useEffect(() => {
    let idToUse, userIdToUse = null,
        accessTokenToUse = null, refreshTokenToUse = null;

    if (status === 'authenticated' && session?.user?.id) {
      idToUse          = session.user.id;
      userIdToUse      = session.user.id;
      accessTokenToUse = session.accessToken;
      refreshTokenToUse= session.refreshToken;
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

    const loadInitialMessages = async (sid) => {
      if (!sid) { setIsReadyToChat(true); return; }
      try {
        const res = await fetch(`/api/agente/chat/history?sessionId=${sid}`);
        if (res.ok) {
          const data = await res.json();
          const chatMessages = data.messages
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .map(m => ({
              id: m.id,
              type: m.role === 'user' ? 'user' : 'agent',
              content: m.content,
              isAudioResponse: false,
            }));
          setMessages(chatMessages);
        }
      } catch (err) {
        console.error('Error al cargar mensajes iniciales:', err);
      } finally {
        setIsReadyToChat(true);
      }
    };

    if (idToUse) loadInitialMessages(idToUse);
  }, [session, status]);

  /* ────────────────────────────────
     Limpieza de URL + pistas de audio
  ──────────────────────────────── */
  useEffect(() => () => {
    if (audioObjectURLRef.current) {
      URL.revokeObjectURL(audioObjectURLRef.current);
      audioObjectURLRef.current = null;
    }
    audioStreamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  /* ────────────────────────────────
     Scroll & auto-resize
  ──────────────────────────────── */
  useEffect(() => { messagesEndRef.current?.scrollIntoView({behavior:'smooth'}); }, [messages]);
  useEffect(autoResize, [inputMessage]); // recalcula alto

  const addMessageToChat = useCallback(
    (type, content, isAudioResponse=false, id=null) =>
      setMessages(prev => [...prev, { id: id || Date.now(), type, content, isAudioResponse }]),
    []
  );

  /* ────────────────────────────────
     Grabación de voz
  ──────────────────────────────── */
  const startRecording = async () => {
    if (!sessionId) { alert('ID de sesión no disponible'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      audioStreamRef.current = stream;

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current   = [];

      mediaRecorderRef.current.ondataavailable = e => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false); setVoiceProcessing(true);
        try {
          const blob = new Blob(audioChunksRef.current,{type:'audio/webm'});
          const fd   = new FormData(); fd.append('audio', blob);
          const res  = await fetch('/api/agente/audio/stt',{method:'POST',body:fd});
          if (!res.ok) throw new Error((await res.json()).details || 'Error STT');
          const { text } = await res.json();
          setInputMessage(text); lastInputWasVoice.current = true;
        } catch (err) {
          console.error('STT error:', err); alert(`Error de voz: ${err.message}`);
        } finally { setVoiceProcessing(false); }
      };

      mediaRecorderRef.current.start(); setIsRecording(true);
    } catch (err) {
      console.error('Micrófono:', err); alert('No se pudo acceder al micrófono');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.state === 'recording' && mediaRecorderRef.current.stop();
    audioStreamRef.current?.getTracks().forEach(t => t.stop());
    audioStreamRef.current = null; setIsRecording(false);
  };

  /* ────────────────────────────────
     Envío de mensajes (texto/voz)
  ──────────────────────────────── */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const messageToSend = inputMessage.trim();
    if (!messageToSend || loading || !isReadyToChat) return;
    if (!sessionId) { alert('ID de sesión no disponible'); return; }

    const tempId = Date.now();
    addMessageToChat('user', messageToSend, false, tempId);
    setInputMessage(''); setTextLoading(true);

    let agentResponseContent = 'Lo siento, hubo un error.';
    try {
      /* 1) Guardar mensaje usuario */
      const saveRes = await fetch('/api/agente/chat/save-message',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ sessionId, role:'user', content:messageToSend })
      });
      if (!saveRes.ok) throw new Error('No se pudo guardar el mensaje');
      const saved = await saveRes.json();
      setMessages(prev => prev.map(m => m.id===tempId ? {...m,id:saved.id}:m));

      /* 2) Pedir respuesta al agente */
      const agentRes = await fetch('/api/agente/chat',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ query:messageToSend, sessionId, userId:currentUserId,
                              accessToken:currentAccessToken, refreshToken:currentRefreshToken })
      });
      if (!agentRes.ok) {
        const err = await agentRes.json().catch(()=>({error:`HTTP ${agentRes.status}`}));
        throw new Error(err.error);
      }
      const agentData = await agentRes.json();
      agentResponseContent = agentData.content;

      /* 3) TTS si veníamos de voz */
      if (lastInputWasVoice.current) {
        setVoiceProcessing(true);
        try {
          const ttsRes = await fetch('/api/agente/audio/tts',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({ text: agentResponseContent })
          });
          if (!ttsRes.ok) throw new Error('Error TTS');
          const audioBuf = await ttsRes.arrayBuffer();
          const blob = new Blob([audioBuf],{type:'audio/mpeg'});
          audioObjectURLRef.current && URL.revokeObjectURL(audioObjectURLRef.current);
          audioObjectURLRef.current = URL.createObjectURL(blob);
          audioRef.current.src = audioObjectURLRef.current;
          audioRef.current.play();
          addMessageToChat('agent', agentResponseContent, true);
        } catch (err) {
          console.error('TTS:', err);
          addMessageToChat('agent', `${agentResponseContent} (sin voz)`, true);
        } finally { setVoiceProcessing(false); }
      } else {
        addMessageToChat('agent', agentResponseContent, false);
      }
    } catch (err) {
      console.error('Error agente:', err);
      addMessageToChat('agent', `Error: ${err.message}`, false);
    } finally {
      setTextLoading(false); lastInputWasVoice.current = false;
    }
  };

  const handleAudioEnded = () => {
    audioRef.current.src = '';
    if (audioObjectURLRef.current) {
      URL.revokeObjectURL(audioObjectURLRef.current);
      audioObjectURLRef.current = null;
    }
  };

  /* ────────────────────────────────
     Historial: cargar, borrar, eliminar mensaje
  ──────────────────────────────── */
  const handleLoadFullHistory = async () => {
    if (!sessionId) return alert('ID de sesión no disponible');
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/agente/chat/history?sessionId=${sessionId}`);
      if (!res.ok) throw new Error('Error al cargar historial');
      const { messages: msgs } = await res.json();
      setMessages(msgs.map(m=>({
        id:m.id,
        type:(m.role==='user'||m.role==='assistant')?m.role:'agent',
        content:m.content,
        isAudioResponse:false
      })));
      setDisplayingFullHistory(true);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally { setHistoryLoading(false); }
  };

  const handleClearHistory = async () => {
    if (!sessionId || !confirm('¿Borrar TODO el historial?')) return;
    setTextLoading(true);
    try {
      const res = await fetch('/api/agente/chat/history',{
        method:'DELETE',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ sessionId })
      });
      if (!res.ok) throw new Error('Error al borrar historial');
      setMessages([]); alert('Historial borrado');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally { setTextLoading(false); setDisplayingFullHistory(false); }
  };

  const handleDeleteMessage = async (id) => {
    if (!confirm('¿Eliminar este mensaje?')) return;
    setMessages(prev => prev.filter(m => m.id !== id));
    try {
      const res = await fetch('/api/agente/chat/history',{
        method:'DELETE',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ messageId: id })
      });
      if (!res.ok) throw new Error('Error al eliminar mensaje');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const isSessionReady =
    status === 'authenticated' ||
    (status === 'unauthenticated' && sessionId && isReadyToChat);

  /* ────────────────────────────────
     JSX
  ──────────────────────────────── */
  return (
    <div className="flex flex-col h-full w-full bg-gray-700 rounded-lg p-3 sm:p-4 relative overflow-hidden">
      {/* ░░ Botones historial ░░ */}
      {isSessionReady && (
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex gap-1 sm:gap-2 z-10">
          <button
            onClick={displayingFullHistory ? () => setDisplayingFullHistory(false) : handleLoadFullHistory}
            disabled={loading || historyLoading}
            className="bg-gray-600 hover:bg-gray-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md disabled:opacity-50"
            title={displayingFullHistory ? 'Ocultar Historial Completo' : 'Mostrar Historial Completo'}
          >
            {historyLoading ? 'Cargando...' : displayingFullHistory ? 'Ocultar' : 'Historial'}
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

      {/* ░░ Mensajes ░░ */}
      <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 mb-3 sm:mb-4 pr-1 sm:pr-2 pt-8 sm:pt-10">
        {messages.length === 0 && !isReadyToChat ? (
          <p className="text-gray-400 text-center mt-8 sm:mt-10 text-sm sm:text-base">Cargando chat...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-400 text-center mt-8 sm:mt-10 text-sm sm:text-base">
            ¡Hola! ¿En qué puedo ayudarte hoy?
          </p>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`
                p-2 sm:p-2.5 rounded-lg relative group
                ${msg.type === 'user' ? 'bg-blue-600 self-end ml-auto' : 'bg-gray-600 self-start mr-auto'}
                w-auto max-w-[90%] sm:max-w-[80%]
              `}
            >
              <p className="text-[13px] sm:text-sm break-words whitespace-pre-wrap">{msg.content}</p>
              {msg.isAudioResponse && (
                <span className="block text-[10px] sm:text-xs text-gray-400 italic">(Respuesta de voz)</span>
              )}
              <button
                onClick={() => handleDeleteMessage(msg.id)}
                className="absolute top-0 right-0 -mt-1 -mr-1 bg-gray-800 text-white rounded-full p-1 text-[10px]
                           opacity-0 group-hover:opacity-100 transition-opacity"
                title="Eliminar mensaje"
              >
                ✖
              </button>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ░░ Formulario entrada ░░ */}
      {isSessionReady ? (
        <form onSubmit={handleSendMessage} className="flex gap-1 sm:gap-2 items-end">
          {/* Micrófono */}
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg font-semibold disabled:opacity-50"
              title="Iniciar Grabación"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-5 5.93V14a1 1 0 102 0v-.07A7.002 7.002 0 0010 18a1 1 0 100-2 5 5 0 01-3.93-2H7a1 1 0 100 2h.07A7.002 7.002 0 0010 18a1 1 0 100-2V8a3 3 0 01-3-3V4a1 1 0 100-2z" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              disabled={voiceProcessing || textLoading}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg font-semibold disabled:opacity-50 animate-pulse"
              title="Detener Grabación"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 9a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" />
              </svg>
            </button>
          )}

          {/* 🔸 Textarea auto-expandible */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              lastInputWasVoice.current = false;
            }}
            onInput={autoResize}
            placeholder={loading ? 'Procesando...' : 'Escribe o habla con el agente...'}
            className="flex-1 p-2 rounded-lg bg-gray-600 text-white placeholder-gray-400 focus:outline-none
                       focus:ring-2 focus:ring-blue-500 text-sm sm:text-base resize-none
                       overflow-y-auto overflow-x-hidden max-h-40"
            disabled={loading || !isReadyToChat}
          />

          {/* Botón Enviar con margen */}
          <button
            type="submit"
            disabled={loading || !isReadyToChat}
            className="ml-1 sm:ml-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg
                       font-semibold disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              'Enviar'
            )}
          </button>
        </form>
      ) : (
        <p className="text-gray-400 text-center mt-4 text-sm sm:text-base">
          {status === 'loading' ? 'Cargando sesión...' : 'Inicia sesión o recarga la página para empezar a usar el chat.'}
        </p>
      )}

      {/* ░░ Reproductor de audio oculto ░░ */}
      <audio ref={audioRef} style={{ display: 'none' }} onEnded={handleAudioEnded} />
    </div>
  );
}
