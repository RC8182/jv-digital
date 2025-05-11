import { FaArrowUp } from 'react-icons/fa';
import { getCardinalDirection } from '../utils/windUtils';

export default function WindDirectionDisplay({ data, showGust, idioma }) {
  const PHOTO_BEARING = 100;

  const arrowAngle = data
    ? (data.averageDirection - PHOTO_BEARING + 360) % 360
    : 0;

  const labels = {
    viento: { en: 'Wind', es: 'Viento' },
    racha:  { en: 'Gust', es: 'Racha' }
  };

  if (!data) {
    return (
      <div className="w-64 h-64 flex items-center justify-center bg-black text-white rounded-xl">
        <p>{idioma === 'en' ? 'No data' : 'Sin datos'}</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-64 h-64 bg-cover bg-center border rounded-xl"
      style={{ backgroundImage: "url('/photos/medano1.png')" }}
    >
      {/* Velocidad y racha */}
      <div className="flex justify-center mt-2 space-x-4 text-white font-bold text-xl">
        <div className="flex flex-col items-center">
          <span>{labels.viento[idioma]}</span>
          <span>{data.averageSpeedKnots?.toFixed(1)} Kts</span>
        </div>

        {showGust === true && typeof data.gustKnots === 'number' && (
          <div className="flex flex-col items-center">
            <span>{labels.racha[idioma]}</span>
            <span>{data.gustKnots.toFixed(1)} Kts</span>
          </div>
        )}
      </div>

      {/* Dirección */}
      <div className="mt-16 absolute inset-0 flex justify-center text-white text-5xl font-bold">
        <div className="flex flex-col items-center">
          <span>{getCardinalDirection(data.averageDirection, idioma)}</span>
          <span className="text-xl">
            {data.averageDirection.toFixed(0)}°
          </span>
        </div>
      </div>

      {/* Flecha direccional */}
      <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2">
        <FaArrowUp
          className="text-white text-5xl"
          style={{ transform: `rotate(${arrowAngle + 180}deg)` }}
        />
      </div>
    </div>
  );
}
