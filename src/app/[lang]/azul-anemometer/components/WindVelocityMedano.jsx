'use client';

import { useEffect, useRef, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';

function buildUniformField({ velocidad, direccion }) {
  const bbox = { lo1: -17.0, la1: 28.7, lo2: -16.0, la2: 27.8 };
  const nx = 61, ny = 49;
  const dx = (bbox.lo2 - bbox.lo1) / (nx - 1);
  const dy = (bbox.la1 - bbox.la2) / (ny - 1);
  const rad = direccion * Math.PI / 180;
  const u = -velocidad * Math.sin(rad);
  const v = -velocidad * Math.cos(rad);
  const makeHeader = (parameterNumber) => ({
    parameterCategory: 2,
    parameterNumber,
    nx, ny,
    lo1: bbox.lo1, la1: bbox.la1,
    lo2: bbox.lo2, la2: bbox.la2,
    dx: +dx.toFixed(4),
    dy: +dy.toFixed(4),
    refTime: Date.now(),
    forecastTime: 0
  });

  const size = nx * ny;
  return [
    { header: makeHeader(2), data: new Array(size).fill(u) },
    { header: makeHeader(3), data: new Array(size).fill(v) }
  ];
}

export default function WindVelocityMedano({ reading }) {
  const mapRef = useRef(null);
  const velocityRef = useRef(null);

  const windData = useMemo(() => {
    if (!reading) return null;
    return buildUniformField(reading);
  }, [reading?.velocidad, reading?.direccion]);

  useEffect(() => {
    let map;

    (async () => {
      const L = (await import('leaflet')).default;
      globalThis.L = L;
      await import('leaflet-velocity/dist/leaflet-velocity.min.js');

      const container = document.getElementById('wind-map');
      if (container._leaflet_id) container._leaflet_id = null;

      map = L.map(container, {
        center: [28.0410, -16.5345], // El Médano
        zoom: 15,
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: false,
        zoomControl: false,
        attributionControl: false
      });
      var TopPlusOpen_Color = L.tileLayer('http://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web/default/WEBMERCATOR/{z}/{y}/{x}.png', {
        maxZoom: 18,
        attribution: 'Map data: &copy; <a href="http://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>'
      });

      // Capa base estilo Windy (OpenTopoMap)
      // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      //   maxZoom: 19,
      //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      // }).addTo(map);
      TopPlusOpen_Color.addTo(map)

      // Pane para etiquetas (opcional)
      map.createPane('labels');
      map.getPane('labels').style.zIndex = 650;
      map.getPane('labels').style.pointerEvents = 'none';

      // Pane para partículas
      map.createPane('velocityPane');
      map.getPane('velocityPane').style.zIndex = 600;
      map.getPane('velocityPane').style.mixBlendMode = 'screen';

      map.invalidateSize();
      mapRef.current = map;

      // Añadir animación si ya hay datos
      if (windData) {
        velocityRef.current = L.velocityLayer({
          pane: 'velocityPane',
          data: windData,
          displayValues: false,
          displayOptions: { speedUnit: 'm/s' },
          minVelocity: 0,
          maxVelocity: 30,
          velocityScale: 0.001,
          colorScale: ['#000000', '#000000', '#FF0000'],
          particleAge: 60,
          lineWidth: 0.9,
          frameRate: 24
        }).addTo(map);
      }
    })();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [windData]);

  useEffect(() => {
    if (!mapRef.current || !windData) return;

    (async () => {
      const L = (await import('leaflet')).default;
      const map = mapRef.current;
      map.invalidateSize();

      if (velocityRef.current) {
        map.removeLayer(velocityRef.current);
      }

      velocityRef.current = L.velocityLayer({
        pane: 'velocityPane',
        data: windData,
        displayValues: false,
        displayOptions: { speedUnit: 'm/s' },
        minVelocity: 0,
        maxVelocity: 30,
        velocityScale: 0.02,
        colorScale: ['#00FF00', '#FFA500', '#FF0000'],
        particleAge: 60,
        lineWidth: 0.3,
        frameRate: 24
      }).addTo(map);
    })();
  }, [windData]);

  return (
    <div
      id="wind-map"
      style={{ width: '100%', height: '50vh' }}
    />
  );
}
