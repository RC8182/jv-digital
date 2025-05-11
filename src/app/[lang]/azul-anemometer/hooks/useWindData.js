import { useState, useEffect, useCallback, useRef } from 'react';

const API = 'https://azul-kite.ddns.net/api/anemometro';

export default function useWindData(mode) {
  const [live, setLive]       = useState(null);
  const [history, setHistory] = useState([]);
  const [state, setState]     = useState(null);
  const wsRef = useRef(null);

  const fetchHistory = useCallback(async () => {
    const url = mode === 'live'
      ? `${API}/raw?limit=500&order=timestamp&nonull=1`
      : `${API}/${mode}`;
    const res = await fetch(url);
    setHistory(await res.json());
  }, [mode]);

  const fetchState = useCallback(async () => {
    const res = await fetch(`${API}/state`);
    setState(await res.json());
  }, []);

  // Inicializar WebSocket solo si estamos en modo "live"
  useEffect(() => {
    if (mode !== 'live') return;

    const socket = new WebSocket('wss://azul-kite.ddns.net/ws');
    wsRef.current = socket;

    socket.onmessage = (msg) => {
      const { data: d } = JSON.parse(msg.data);
      if (d?.velocidad !== undefined) setLive(d);
    };

    return () => socket.close();
  }, [mode]);

  // Si no es "live", seguimos usando fetch tradicional
  useEffect(() => {
    if (mode !== 'live') {
      const fetchLive = async () => {
        const res = await fetch(`${API}/raw?limit=1&order=id&nonull=1`);
        const [row] = await res.json();
        if (row) setLive(row);
      };
      fetchLive();
      const id = setInterval(fetchLive, 5000);
      return () => clearInterval(id);
    }
  }, [mode]);

  useEffect(() => { fetchHistory(); fetchState(); }, [fetchHistory]);

  return { live, history, state };
}
