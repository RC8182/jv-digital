import { useState, useEffect, useCallback, useRef } from 'react';
import config from '../config';

function getTodayDateStr() {
  const today = new Date();
  return today.toISOString().slice(0, 10); // YYYY-MM-DD
}

export default function useWindData(mode) {
  const [live, setLive]       = useState(null);
  const [history, setHistory] = useState([]);
  const pollingRef = useRef(null);

  const fetchHistory = useCallback(async () => {
    try {
      if (mode === 'raw') {
        const res = await fetch(`${config.API_BASE_URL}/raw`, { cache: 'no-store' });
        if(res.ok) {
          const data = await res.json();
          setHistory(Array.isArray(data) ? data : []);
        } else {
          setHistory([]);
        }
      } else if (mode === '3min') {
        // Para 3min, usar la ruta directa para mantener la funcionalidad original
        const res = await fetch(`${config.API_BASE_URL}/3min`, { cache: 'no-store' });
        if(res.ok) {
          const data = await res.json();
          setHistory(Array.isArray(data) ? data : []);
          if (Array.isArray(data) && data.length > 0) {
            setLive(data[0]);
          }
        } else {
          setHistory([]);
        }
      } else {
        // Para otros modos (15min, hourly), usar la ruta history con filtros
        const date = getTodayDateStr();
        const res = await fetch(`${config.API_BASE_URL}/history?date=${date}&timeframe=${mode}`, { cache: 'no-store' });
        if(res.ok) {
          const data = await res.json();
          setHistory(Array.isArray(data.data) ? data.data : []);
          if (Array.isArray(data.data) && data.data.length > 0) {
            setLive(data.data[0]);
          }
        } else {
          setHistory([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
      setHistory([]);
    }
  }, [mode]);

  const fetchLatestData = useCallback(async () => {
    if (mode !== 'raw') return;
    try {
      const res = await fetch(`${config.API_BASE_URL}/raw`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const row = Array.isArray(data) && data.length > 0 ? data[0] : null;
        if (row) {
          setLive(row);
          setHistory(prevHistory => {
            const newHistory = [row, ...prevHistory.filter(item => item.id !== row.id)];
            return newHistory.slice(0, config.MAX_HISTORY_ITEMS);
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch latest data:", error);
    }
  }, [mode]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    // Polling para todos los modos
    let fetchFn;
    if (mode === 'raw') {
      fetchFn = fetchLatestData;
    } else {
      fetchFn = fetchHistory;
    }
    fetchFn(); // Fetch inicial
    pollingRef.current = setInterval(() => {
      fetchFn();
    }, config.POLLING_INTERVAL);
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [mode, fetchLatestData, fetchHistory]);

  return { live, history, wsConnected: false, wsError: null };
}
