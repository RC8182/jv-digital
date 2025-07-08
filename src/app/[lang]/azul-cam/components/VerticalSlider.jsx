"use client";

import { useState, useRef, useEffect } from "react";

export default function VerticalSlider({ 
  value, 
  onChange, 
  min = 1, 
  max = 8, 
  className = "", 
  label = "" 
}) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleMouseMove(e);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const height = rect.height;
    const y = e.clientY - rect.top;
    
    // Invertir el valor (0 en la parte superior = max, height en la parte inferior = min)
    const percentage = Math.max(0, Math.min(1, 1 - (y / height)));
    const newValue = Math.round(min + (max - min) * percentage);
    
    onChange(newValue);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const percentage = ((value - min) / (max - min)) * 100;
  const thumbPosition = 100 - percentage; // Invertir para que el thumb esté en la posición correcta

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {label && <span className="text-white text-xs">{label}</span>}
      
      <div 
        ref={sliderRef}
        className="relative w-4 h-32 bg-gray-600 rounded-full cursor-pointer"
        onMouseDown={handleMouseDown}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          const rect = sliderRef.current.getBoundingClientRect();
          const height = rect.height;
          const y = touch.clientY - rect.top;
          const percentage = Math.max(0, Math.min(1, 1 - (y / height)));
          const newValue = Math.round(min + (max - min) * percentage);
          onChange(newValue);
        }}
      >
        {/* Track de fondo */}
        <div className="absolute inset-0 bg-gray-600 rounded-full"></div>
        
        {/* Track activo */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-orange-500 rounded-full transition-all duration-150"
          style={{ height: `${percentage}%` }}
        ></div>
        
        {/* Thumb */}
        <div 
          className="absolute w-6 h-6 bg-white rounded-full shadow-lg border-2 border-orange-500 transform -translate-x-1 -translate-y-1/2 transition-all duration-150"
          style={{ 
            top: `${thumbPosition}%`,
            left: '50%'
          }}
        ></div>
      </div>
      
      <span className="text-white text-xs font-bold">{value}</span>
    </div>
  );
} 