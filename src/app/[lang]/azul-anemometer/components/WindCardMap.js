import { FaArrowUp } from 'react-icons/fa';
import { formatTimestamp, getCardinalDirection }  from '../utils/windUtils';
import WindVelocityMedano from './WindVelocityMedano';
import WindTimeSeries from './directionGauge';

export default function WindCardMap({ live, idioma }) {

  const label = (idioma==='es')?'Viento Actuál':'Actual Wind';
  const fakeHistory = [
    { timestamp: '2025-05-08 08:00:00', velocidad: 1.8, max_racha: 2.4, direccion: 30 },
    { timestamp: '2025-05-08 08:10:00', velocidad: 2.2, max_racha: 3.0, direccion: 45 },
    { timestamp: '2025-05-08 08:20:00', velocidad: 2.7, max_racha: 3.2, direccion: 60 },
    { timestamp: '2025-05-08 08:30:00', velocidad: 3.1, max_racha: 4.5, direccion: 75 },
    { timestamp: '2025-05-08 08:40:00', velocidad: 2.9, max_racha: 3.8, direccion: 90 },
    { timestamp: '2025-05-08 08:50:00', velocidad: 3.5, max_racha: 5.1, direccion: 105 },
    { timestamp: '2025-05-08 09:00:00', velocidad: 4.0, max_racha: 5.8, direccion: 120 },
    { timestamp: '2025-05-08 09:10:00', velocidad: 3.7, max_racha: 5.0, direccion: 135 },
    { timestamp: '2025-05-08 09:20:00', velocidad: 3.2, max_racha: 4.2, direccion: 150 },
    { timestamp: '2025-05-08 09:30:00', velocidad: 2.8, max_racha: 3.6, direccion: 165 },
    { timestamp: '2025-05-08 09:40:00', velocidad: 2.5, max_racha: 3.1, direccion: 180 },
    { timestamp: '2025-05-08 09:50:00', velocidad: 2.1, max_racha: 2.8, direccion: 195 },
  ];
  
  // Lectura en tiempo real
  const fakeLive = {
    velocidad: 2.1,    // m/s o mph según tu unidad
    max_racha: 2.8,    // ráfaga actual
    direccion: 195     // en grados
  };


  return (
    <div className="p-6 shadow-xl rounded-2xl bg-black text-white w-full max-w-xl m-2">
      <h2 className="text-xl mb-2 font-bold text-center">
        {formatTimestamp(live?.timestamp)}<br />{label}
      </h2>
      <div className='flex gap-2 justify-center'>
        <h3>
         Dirección: {live?.direccion}º {getCardinalDirection(live?.direccion,idioma)}
        </h3>
        <h3>
        <FaArrowUp
          className="text-white text-2xl"
          style={{ transform: `rotate(${live?.direccion + 180}deg)` }}
        />
        </h3>
        <h3>
          Velocidad: {live?.velocidad} KT
        </h3>

      </div>

      <div className="flex justify-center m-2">
        <WindVelocityMedano reading={{
          velocidad: live?.velocidad,    // m/s
          direccion: live?.direccion     // grados meteorológicos
          }} />
      </div>
      <WindTimeSeries history={fakeHistory} live={fakeLive} />
    </div>
  );
}
