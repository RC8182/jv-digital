import React from 'react';
import Chart from 'react-apexcharts';
import PropTypes from 'prop-types';

// Mapea grados a cardinales
const getCardinal = deg => {
  if (deg == null) return 'N/A';
  const dirs = ['N','NE','E','SE','S','SW','W','NW','N'];
  return dirs[Math.round((deg % 360) / 45)];
};

export default function WindTimeSeries({ history, live }) {
  // history: [{ timestamp, velocidad, max_racha, direccion }, …]
  const categories = history.map(h => new Date(h.timestamp).getTime());

  const series = [
    { name: 'Wind Speed', data: history.map(h => h.velocidad) },
    { name: 'Wind Gust',  data: history.map(h => h.max_racha) },
  ];

  const options = {
    chart: {
      type: 'area',
      zoom: { enabled: true },
      toolbar: { show: false },
    },
    colors: ['#FFA500', '#008FFB'],  // naranja y azul
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1, stops: [0, 90, 100] }
    },
    xaxis: {
      type: 'datetime',
      categories,
      labels: { datetimeUTC: false, format: 'HH:mm' },
    },
    yaxis: {
      title: { text: 'mph' },
      min: 0,
    },
    tooltip: {
        shared: true,
        x: { format: 'HH:mm' },
        y: {
          formatter: (val) => `${val.toFixed(1)} mph`
        }
      },
      
    legend: { position: 'top' },
    grid: { borderColor: '#e7e7e7' },
  };

  return (
    <div>
      {/* Panel superior de valores en tiempo real */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        marginBottom: 12,
        fontSize: 14
      }}>
        <div>
          <div style={{ fontSize: 12 }}>Wind</div>
          <div style={{ fontWeight: 'bold', fontSize: 18 }}>{live?.velocidad ?? '0'} mph</div>
        </div>
        <div>
          <div style={{ fontSize: 12 }}>Gust</div>
          <div style={{ fontWeight: 'bold', fontSize: 18 }}>{live?.max_racha ?? '0'} mph</div>
        </div>
        <div>
          <div style={{ fontSize: 12 }}>Direction</div>
          <div style={{ fontWeight: 'bold', fontSize: 18 }}>
            {getCardinal(live?.direccion)}
          </div>
        </div>
      </div>

      {/* Gráfico de área */}
      <Chart
        options={options}
        series={series}
        type="area"
        height={300}
      />
    </div>
  );
}

WindTimeSeries.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      timestamp: PropTypes.string.isRequired,
      velocidad: PropTypes.number.isRequired,
      max_racha: PropTypes.number.isRequired,
      direccion: PropTypes.number,
    })
  ).isRequired,
  live: PropTypes.shape({
    velocidad: PropTypes.number,
    max_racha: PropTypes.number,
    direccion: PropTypes.number,
  }),
};
