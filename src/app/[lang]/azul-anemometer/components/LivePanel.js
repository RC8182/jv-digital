import React from 'react';
import F1WindGauge from './tacometroF1';
import LiveHistoryTable from './LiveHistoryTable';
import UnitSelector from './UnitSelector';

export default function LivePanel({ displayValuesRaw, displayValues3min, history, translations, idioma, liveRaw }) {
  const lastUpdateTime = liveRaw?.timestamp
    ? new Date(liveRaw.timestamp).toLocaleTimeString(idioma === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    : null;
  const lastUpdateLabel = translations.last_update || 'Última actualización:';

  const validHistory = React.useMemo(() => {
    if (!history || history.length === 0) {
      return [];
    }
    const sortedHistory = [...history];
    sortedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return sortedHistory;
  }, [history]);

  return (
    <>
      <div className="w-full mb-2">
        <h2 className="text-xl font-extrabold text-green-400 drop-shadow-lg text-left">
          Muelle El Médano
          {lastUpdateTime && (
            <span className="text-xxs font-normal text-white ml-2">
              - {lastUpdateLabel} {lastUpdateTime}
            </span>
          )}
        </h2>
      </div>
      <div className="flex flex-wrap justify-center gap-2 items-center relative">
        <F1WindGauge
          value={displayValuesRaw.speed}
          direction={displayValuesRaw.direction}
          title={translations.avg_wind}
          maxValue={50}
          width={300}
          height={120}
        />
        <F1WindGauge
          value={displayValues3min.gust}
          direction={displayValues3min.direction}
          title={translations.max_gust}
          maxValue={50}
          width={300}
          height={120}
        />
      </div>
      <UnitSelector />
      <LiveHistoryTable history={validHistory} translations={translations} idioma={idioma} />
    </>
  );
} 