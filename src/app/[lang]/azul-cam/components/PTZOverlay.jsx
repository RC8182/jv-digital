"use client";

import {
  FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight,
  FaPlus, FaMinus
} from "react-icons/fa";
import PTZButton from "./PTZButton";

export default function PTZOverlay({
  spd, setSpd, dirDown, dirUp, zoomDown, zoomUp, close
}) {
  return (
    <div className="absolute inset-0 pointer-events-none z-50">

      {/* Flechas */}
      <PTZButton Icon={FaArrowUp}
        onDown={() => dirDown(0, +spd)} onUp={dirUp}
        style="top-4 left-1/2 -translate-x-1/2" />

      <PTZButton Icon={FaArrowDown}
        onDown={() => dirDown(0, -spd)} onUp={dirUp}
        style="bottom-24 left-1/2 -translate-x-1/2" />

      <PTZButton Icon={FaArrowLeft}
        onDown={() => dirDown(-spd, 0)} onUp={dirUp}
        style="top-1/2 -translate-y-1/2 left-4" />

      <PTZButton Icon={FaArrowRight}
        onDown={() => dirDown(+spd, 0)} onUp={dirUp}
        style="top-1/2 -translate-y-1/2 right-4" />

      {/* Velocidad + zoom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 pointer-events-auto">
        <input
          type="range" min="1" max="8" value={spd}
          onChange={e => setSpd(+e.target.value)}
          className="accent-orange-500"
        />
        <FaMinus  onPointerDown={() => zoomDown(+spd)} onPointerUp={zoomUp}
                 className="w-7 h-7 text-white active:scale-95 pointer-events-auto" />
        <FaPlus onPointerDown={() => zoomDown(-spd)} onPointerUp={zoomUp}
                 className="w-7 h-7 text-white active:scale-95 pointer-events-auto" />
      </div>

      {/* Cerrar */}
      <button
        onClick={close}
        className="absolute bottom-4 right-4 text-xs text-white underline pointer-events-auto"
      >Cerrar</button>
    </div>
  );
}
