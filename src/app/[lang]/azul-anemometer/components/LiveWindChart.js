'use client';                       // para Next.js App Router
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

/* ───── CONFIG ───── */
const API     = 'https://azul-kite.ddns.net/api/anemometro';
const WS_URL  = 'wss://azul-kite.ddns.net/ws';
const MAX_PT  = 288;                // máx. puntos mantenidos en pantalla

export default function LiveWindChart({ mode = 'live' }) {
  const [rows, setRows] = useState([]);
  const wsRef   = useRef(null);
  const timerId = useRef(null);

  /* ────────── gestión de datos según modo ────────── */
  useEffect(() => {
    async function start() {
      // limpia recursos anteriores
      if (wsRef.current)   { wsRef.current.close(); wsRef.current = null; }
      if (timerId.current) { clearInterval(timerId.current); timerId.current = null; }

      /* --- MODO LIVE: WS + pre‑carga -------------------------------- */
      if (mode === 'live') {
        // 1. pre‑carga (~6 min)
        const initial = await fetch(`${API}/raw?limit=72&order=timestamp&nonull=1`)
                              .then(r => r.json());
        setRows(initial);

        // 2. abre WebSocket para nuevas muestras
        const sok = new WebSocket(WS_URL);
        wsRef.current = sok;

        sok.onmessage = (msg) => {
          const { data: d } = JSON.parse(msg.data);
          if (!d?.velocidad) return;                    // descarta LWT/etc.
          setRows(prev => {
            const upd = [...prev, d];
            return upd.length > MAX_PT ? upd.slice(-MAX_PT) : upd;
          });
        };
      }

      /* --- MODOS AGREGADOS: fetch periódico ------------------------- */
      else {
        const endpoint = `${API}/${mode}`;              // 3min | 15min | hourly
        const periodMs = mode === '3min'  ? 180_000 :
                         mode === '15min' ? 900_000 :    // 15 min
                                            3_600_000;   // hourly

        const fetchAgg = async () => {
          const data = await fetch(endpoint).then(r => r.json());
          setRows(data.reverse());   // backend devuelve DESC → revertimos a ASC
        };

        await fetchAgg();                        // primera carga
        timerId.current = setInterval(fetchAgg, periodMs);
      }
    }

    start();
    return () => {
      if (wsRef.current)   wsRef.current.close();
      if (timerId.current) clearInterval(timerId.current);
    };
  }, [mode]);

  /* ────────── preparar series para ApexCharts ────────── */
  const labels = rows.map(r => new Date(r.timestamp).toLocaleTimeString());
  const speed  = rows.map(r => r.velocidad);
  const gust   = rows.map(r => r.max_racha ?? null);
  const dir    = rows.map(r => r.direccion);

  const series = [
    { name: 'Velocidad', type: 'line', data: speed },
    { name: 'Racha',     type: 'line', data: gust,  dashArray: 4 },
    { name: 'Dirección', type: 'line', data: dir,   yAxisIndex: 1 }
  ];

  const options = {
    chart: { animations:{enabled:true,easing:'linear'}, toolbar:{show:false}, zoom:{enabled:false} },
    stroke:{ curve:'smooth', width:[2,2,2], dashArray:[0,4,0] },
    xaxis: { categories: labels },
    yaxis: [
      { title:{text:'Velocidad (kt)'}, min:0 },
      { opposite:true, title:{text:'Dirección (°)'}, min:0, max:360 }
    ],
    tooltip:{ shared:true, intersect:false }
  };

  /* ────────── render ────────── */
  const title = {
    live:'Live', '3min':'3 min', '15min':'15 min', hourly:'1 h'
  }[mode] || mode;

  return (
    <div className="p-4 bg-black text-white rounded-xl shadow-xl w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-2 text-center">Viento – {title}</h2>
      <ApexChart options={options} series={series} type="line" height={400} />
    </div>
  );
}
