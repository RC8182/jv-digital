import { useState, useEffect, useMemo } from 'react';
import useWindData from '../hooks/useWindData';
import config from '../config';
import { filterAndGroupByDate, windTranslations } from '../utils/windUtils';
import LivePanel from './LivePanel';
import StatsPanel from './StatsPanel';
import { UnitProvider } from '../context/unitContext';
import AdMarquee from './AdMarquee';

export default function AnemometroPage({idioma}) {
  const [mode, setMode] = useState('raw'); // 'raw' = vivo, 'stats' = estadísticas
  const [minutes, setMinutes] = useState(config.DEFAULT_STATS_MINUTES);
  const [stats, setStats] = useState(null);

  // Data para modo vivo
  const { live: liveRaw } = useWindData('raw'); // Para tacómetro Viento Prom.
  const { live: live3min, history: history3min } = useWindData('3min'); // Para tacómetro Racha y acordeón

  const translations = windTranslations[idioma] || windTranslations.en;

  // Agrupar historial para acordeón
  const groupedHistoryVivo = filterAndGroupByDate(history3min, idioma, true);

  // Valores para tacómetros en vivo
  const displayValuesRaw = useMemo(() => {
    if (!liveRaw) return { speed: 0, direction: 0 };
    return {
      speed: liveRaw.velocidad || 0,
      direction: liveRaw.direccion || 0,
    };
  }, [liveRaw]);
  const displayValues3min = useMemo(() => {
    if (!live3min) return { gust: 0, direction: 0 };
    return {
      gust: live3min.gust_speed_kt || 0,
      direction: live3min.avg_dir_deg || 0,
    };
  }, [live3min]);

  // Botones de tf
  const buttons = [
    {m:'3min',txt:{en:'3 Min',es:'3 Min'}},
    {m:'15min',txt:{en:'15 Min',es:'15 Min'}},
    {m:'hourly',txt:{en:'Hourly',es:'1 Hora'}}
  ];

  // Fetch de estadísticas según minutos (NO depende de tf)
  useEffect(() => {
    if (mode !== 'stats') return;
    const fetchStats = async () => {
      try {
        const url = `${config.API_BASE_URL}/stats?minutes=${minutes}`;
        const res = await fetch(url);
        if (res.ok) {
          setStats(await res.json());
        } else {
          setStats(null);
        }
      } catch {
        setStats(null);
      }
    };
    fetchStats();
  }, [mode, minutes]);


  return (
    <UnitProvider>
      <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-4 pb-28">
        <div className="w-full max-w-3xl">
          {/* Panel principal según modo */}
          {mode === 'stats' ? (
            <StatsPanel
              stats={stats}
              idioma={idioma}
              minutes={minutes}
              setMinutes={setMinutes}
              buttons={buttons}
              translations={translations}
              liveRaw={liveRaw}
            />
          ) : (
            <LivePanel
              displayValuesRaw={displayValuesRaw}
              displayValues3min={displayValues3min}
              history={history3min}
              translations={translations}
              idioma={idioma}
              liveRaw={liveRaw}
            />
          )}
        </div>

        {/* Barra fija inferior con publicidad y botón */}
        <div className="fixed bottom-0 left-0 right-0 z-[1000]">
          <AdMarquee lang={idioma} />
          <div className="bg-gray-900 bg-opacity-90 backdrop-blur-sm p-2 flex justify-center">
            <button
              className="px-4 py-2 rounded-md shadow transition-colors duration-300 bg-green-500 text-black"
              onClick={() => setMode(mode === 'stats' ? 'raw' : 'stats')}
            >
              {mode === 'stats' ? (idioma === 'es' ? 'Vivo' : 'Live') : (idioma === 'es' ? 'Estadísticas' : 'Stats')}
            </button>
          </div>
        </div>
      </div>
    </UnitProvider>
  );
}