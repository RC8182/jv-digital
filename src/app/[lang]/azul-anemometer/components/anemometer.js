import { useState } from 'react';
import useWindData      from '../hooks/useWindData';
import WindCard         from './WindCardMap';
import HistoryTable     from '../components/HistoryTable';
import WindTimeSeries from './directionGauge';

export default function AnemometroPage({idioma}) {
  const [mode,setMode]   = useState('raw');       // raw | 3min | 15min | hourly
  const { live, history, state } = useWindData(mode);

  const buttons = [
    {m:'raw', txt:{en:'Live',es:'Vivo'}},
    {m:'3min',txt:{en:'3 Min',es:'3 Min'}},
    {m:'15min',txt:{en:'15 Min',es:'15 Min'}},
    {m:'hourly',txt:{en:'Hourly',es:'1 Hora'}}
  ];

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-800 p-4">

      {/* live card */}
      <WindCard live={live} idioma={idioma} />
      {/* mode buttons */}
      <div className="flex space-x-2 mb-4">
        {buttons.map(b=>(
          <button key={b.m}
            onClick={()=>setMode(b.m)}
            className={`px-4 py-2 rounded-md shadow
                        ${mode===b.m?'bg-black text-white':'bg-white text-black'}`}>
            {b.txt[idioma]}
          </button>
        ))}
      </div>
      {/* <LiveWindChart  mode={mode} /> */}

      {/* estado estación */}
      {/* {state && (
        <div className="text-white mb-4">
          🔋 {state.bateria_pct ?? '-'} % ‑ {state.volt_mV/1000} V · RSSI {state.rssi_dBm} dBm
        </div>
      )} */}

      {/* history */}
      <HistoryTable mode={mode} history={history} idioma={idioma} />
    </div>
  );
}
