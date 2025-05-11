import { getCardinalDirection } from '../utils/windUtils';

export default function HistoryTable({ mode, history, idioma }) {
  const isRaw = mode === 'raw';

  /* agrupa por día */
  const groups = history.reduce((acc,row) => {
    const day = row.timestamp.split('T')[0];
    (acc[day] ||= []).push(row);
    return acc;
  }, {});

  const days = Object.keys(groups).sort((a,b)=> a<b?1:-1);

  const t = { // traducciones rápidas
    time:{en:'Time',es:'Hora'}, wind:{en:'Wind',es:'Viento'},
    min:{en:'Min Gust',es:'Racha Mín'}, max:{en:'Max Gust',es:'Racha Máx'},
    dir:{en:'Direction',es:'Dirección'}, kt:{en:'knots',es:'nudos'}
  };

  const fmtDay = d => {
    // Separar fecha de hora
    const [fecha] = d.split(' '); // Extrae solo la parte de la fecha antes del espacio
    const [y, m, dy] = fecha.split('-'); // Divide correctamente el año, mes y día
    return idioma === 'en' ? `${m}/${dy}/${y}` : `${dy}/${m}/${y}`;
  };
  

  const timeHHMM = ts => {
    const d = new Date(ts); const h=d.getHours().toString().padStart(2,'0');
    const m=d.getMinutes().toString().padStart(2,'0'); return `${h}:${m}`;
  };

  return days.map(day=>(
    <div key={day} className="p-6 shadow-xl rounded-2xl bg-black text-white w-full max-w-xl m-2">
      <h4 className="text-base font-bold mb-2">{fmtDay(day)} {timeHHMM(day)}</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full text-white">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="py-2 px-4">{t.wind[idioma]} ({t.kt[idioma]})</th>
              {!isRaw && <>
                <th className="py-2 px-4">{t.min[idioma]} ({t.kt[idioma]})</th>
                <th className="py-2 px-4">{t.max[idioma]} ({t.kt[idioma]})</th>
              </>}
              <th className="py-2 px-4">{t.dir[idioma]}</th>
            </tr>
          </thead>
          <tbody>
            {groups[day].map(r=>{
              const dir = parseFloat(r.direccion);
              return (
                <tr key={r.id} className="border-b border-gray-700 last:border-b-0">
                  <td className="py-2 px-4">{(+r.velocidad).toFixed(1)}</td>
                  {!isRaw && <>
                    <td className="py-2 px-4">{r.min_racha?.toFixed(1) || '-'}</td>
                    <td className="py-2 px-4">{r.max_racha?.toFixed(1) || '-'}</td>
                  </>}
                  <td className="py-2 px-4">
                    {`${getCardinalDirection(dir,idioma)} (${dir.toFixed(0)}°)`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  ));
}
