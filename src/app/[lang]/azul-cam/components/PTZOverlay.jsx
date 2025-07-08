"use client";

import {
  FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight,
  FaPlus, FaMinus
} from "react-icons/fa";
import PTZButton from "./PTZButton";
import VerticalSlider from "./VerticalSlider";

export default function PTZOverlay({
  panSpeed, setPanSpeed, zoomSpeed, setZoomSpeed,
  dirDown, dirUp, zoomDown, zoomUp, close, presetsDisabled, isRicardoPage
}) {
  // Detectar si es móvil
  const isMobile = typeof window !== 'undefined' && window.matchMedia("(pointer: coarse)").matches;

  // Función para manejar zoom con dirección correcta (corregida)
  const handleZoomIn = () => {
    // + siempre acerca (zoom in) en todos los dispositivos
    zoomDown(zoomSpeed); // zoom in
  };

  const handleZoomOut = () => {
    // - siempre aleja (zoom out) en todos los dispositivos
    zoomDown(-zoomSpeed); // zoom out
  };

  if (presetsDisabled) {
    return (
      <div className="absolute inset-0 pointer-events-none z-50">
        <div className="absolute bottom-4 right-4 bg-red-500 text-white px-3 py-2 rounded text-sm pointer-events-auto">
          PTZ Deshabilitado
        </div>
        <button
          onClick={close}
          className="absolute bottom-4 left-4 text-xs text-white underline pointer-events-auto"
        >
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Indicador de admin para Ricardo */}
      {isRicardoPage && (
        <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded text-xs pointer-events-auto">
          🔑 Admin Mode
        </div>
      )}

      {/* Flechas de movimiento */}
      <PTZButton Icon={FaArrowUp}
        onDown={() => dirDown(0, +panSpeed)} onUp={dirUp}
        style="top-4 left-1/2 -translate-x-1/2" />

      <PTZButton Icon={FaArrowDown}
        onDown={() => dirDown(0, -panSpeed)} onUp={dirUp}
        style="bottom-24 left-1/2 -translate-x-1/2" />

      <PTZButton Icon={FaArrowLeft}
        onDown={() => dirDown(-panSpeed, 0)} onUp={dirUp}
        style="top-1/2 -translate-y-1/2 left-4" />

      <PTZButton Icon={FaArrowRight}
        onDown={() => dirDown(+panSpeed, 0)} onUp={dirUp}
        style="top-1/2 -translate-y-1/2 right-4" />

      {/* Slider vertical para velocidad de movimiento (esquina inferior izquierda) */}
      <div className="absolute left-4 bottom-20 pointer-events-auto">
        <VerticalSlider
          value={panSpeed}
          onChange={setPanSpeed}
          min={1}
          max={8}
          label="Movimiento"
        />
      </div>

      {/* Slider vertical para velocidad de zoom (esquina inferior derecha) */}
      <div className="absolute right-4 bottom-20 pointer-events-auto">
        <VerticalSlider
          value={zoomSpeed}
          onChange={setZoomSpeed}
          min={1}
          max={8}
          label="Zoom"
        />
      </div>

      {/* Botones de zoom (centro inferior) */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-4 pointer-events-auto">
        <FaMinus  
          onPointerDown={handleZoomOut} 
          onPointerUp={zoomUp}
          className="w-7 h-7 text-white active:scale-95 pointer-events-auto" 
        />
        <FaPlus 
          onPointerDown={handleZoomIn} 
          onPointerUp={zoomUp}
          className="w-7 h-7 text-white active:scale-95 pointer-events-auto" 
        />
      </div>

      {/* Cerrar */}
      <button
        onClick={close}
        className="absolute bottom-4 left-4 text-xs text-white underline pointer-events-auto"
      >
        Cerrar
      </button>
    </div>
  );
}
