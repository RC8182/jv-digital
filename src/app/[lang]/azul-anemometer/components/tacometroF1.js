"use client";

import React, { useMemo } from "react";
import { 
  getCardinalDirection, 
  generateColorScale, 
  windColorStops,
  convertWindSpeed,
  getUnitLabel
} from '../utils/windUtils';
import { useUnit } from '../context/unitContext';

const F1WindGauge = ({ 
  value,
  title = "WIND",
  direction,
  maxValue = 50,
  width = 300,
  inactiveColor = "#555555",
  barHeight = 22
}) => {
  const { unit } = useUnit();
  const colorScale = useMemo(() => generateColorScale(maxValue, windColorStops), [maxValue]);
  
  const safeValue = value === null || value === undefined ? 0 : value;
  const activeColor = colorScale[Math.min(Math.round(safeValue), maxValue)]?.color || inactiveColor;
  
  const displayValue = convertWindSpeed(safeValue, unit);
  const displayUnit = getUnitLabel(unit);

  // Margen horizontal para asegurar que los extremos se vean completos
  const horizontalMargin = 20;
  const effectiveWidth = width - horizontalMargin * 2;

  // Offset vertical para dejar espacio a la barra
  const barMargin = 6;
  const yOffset = barHeight + barMargin * -3;

  // Segmentos del indicador con margen
  const segments = colorScale.map((segment, index) => (
    <rect
      key={index}
      x={horizontalMargin + (index * effectiveWidth) / colorScale.length}
      y={yOffset}
      width={effectiveWidth / colorScale.length + 0.5}
      height={barHeight}
      fill={index <= safeValue ? segment.color : inactiveColor}
    />
  ));

  // Marcadores y etiquetas con margen
  const markers = [];
  for (let i = 0; i <= maxValue; i += 10) {
    const x = horizontalMargin + (i / maxValue) * effectiveWidth;
    markers.push(
      <React.Fragment key={i}>
        <line
          x1={x}
          y1={yOffset + barHeight + 10}
          x2={x}
          y2={yOffset + barHeight}
          stroke="white"
          strokeWidth={1}
        />
        <text
          x={x}
          y={yOffset + barHeight + 18}
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontFamily="Arial"
        >
          {i}
        </text>
      </React.Fragment>
    );
  }

  return (
    <div className="bg-black p-2 rounded-lg flex flex-col items-center justify-center" style={{ width: 'fit-content', margin: '0 auto' }}>
      <div className="flex justify-between items-center w-full">
        <h2 className="text-white text-xl font-bold">{title}</h2>
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold" style={{ color: activeColor }}>
            {displayValue.toFixed(unit === 'beaufort' ? 0 : 1)} {displayUnit}
          </div>
          {direction !== null && direction !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-white text-xl font-bold">
                {Math.round(direction)}°
              </span>
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ transform: `rotate(${direction}deg)` }}
              >
                <path d="M12 22v-20M12 22l4-4M12 22l-4-4"/>
              </svg>
              <span className="text-white text-xl">
                ({getCardinalDirection(direction)})
              </span>
            </div>
          )}
        </div>
      </div>
      <svg width={width} height={barHeight + 30} className="block mx-auto" overflow="visible">
        {segments}
        {markers}
        <line
          x1={horizontalMargin}
          y1={yOffset + barHeight}
          x2={horizontalMargin + effectiveWidth}
          y2={yOffset + barHeight}
          stroke="white"
          strokeWidth={2}
        />
        <line
          x1={horizontalMargin + (safeValue / maxValue) * effectiveWidth}
          y1={yOffset}
          x2={horizontalMargin + (safeValue / maxValue) * effectiveWidth}
          y2={yOffset + barHeight}
          stroke={activeColor}
          strokeWidth={4}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default F1WindGauge;