// components/PTZControls.jsx
"use client";

import { useRef, useState, useEffect } from "react";

export default function PTZControls() {
  const pad  = useRef(null);
  const knob = useRef(null);

  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [spd , setSpd]  = useState(4);          // 1–8
  const R = 40;
  let last = 0;                                 // throttle 200 ms

  // Carga inicial del nivel de zoom real
  useEffect(() => {
    fetch("/api/azul-cam/zoom/status")
      .then(r => r.json())
      .then(j => setZoom(j.zoom))
      .catch(console.error);
  }, []);

  /* ─── Envía comando PTZ Continuously ─── */
  async function send(vx, vy) {
    const q = new URLSearchParams({
      action : "start",
      channel: "1",
      code   : "Continuously",
      arg1   : vx.toString(),   // + derecha / – izquierda
      arg2   : vy.toString(),   // + abajo   / – arriba
      arg3   : "0",
      arg4   : "1"
    });
    await fetch(`/api/azul-cam/cameraControl?${q}`);
  }

  /* ─── Cambia al nivel de zoom 1–5 ─── */
  async function zoomTo(level) {
    if (level < 1 || level > 5) return;
    const res = await fetch(`/api/azul-cam/zoom/${level}`);
    const json = await res.json();
    if (json.success) {
      setZoom(json.level);
    } else {
      console.error("Zoom error:", json.error);
    }
  }

  /* ─── Handlers del joystick ─── */
  function down(e) {
    e.preventDefault();
    pad.current.setPointerCapture(e.pointerId);
    knob.current.style.transition = "none";
    pad.current.addEventListener("pointermove", move);
  }

  async function move(e) {
    const now = Date.now();
    if (now - last < 200) return;        // máx. 5 envíos/s
    last = now;

    const r  = pad.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width  / 2);
    const dy = e.clientY - (r.top  + r.height / 2);
    const d  = Math.min(R, Math.hypot(dx, dy));
    const a  = Math.atan2(dy, dx);
    const lx = Math.cos(a) * d;
    const ly = Math.sin(a) * d;

    knob.current.style.transform =
      `translate(calc(-50% + ${lx}px), calc(-50% + ${ly}px))`;

    const vx =  Math.round(( lx / R) * spd);
    const vy = -Math.round(( ly / R) * spd);
    await send(vx, vy);
  }

  async function up(e) {
    pad.current.releasePointerCapture(e.pointerId);
    pad.current.removeEventListener("pointermove", move);
    await send(0, 0);                    // freno
    knob.current.style.transition = "transform .25s ease-out";
    knob.current.style.transform  = "translate(-50%, -50%)";
  }

  /* ─── Render ─── */
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-black/60 text-white text-2xl z-50"
      >
        +
      </button>
    );
  }

  return (
    <div className="absolute bottom-4 right-4 bg-black/70 p-4 rounded-xl flex flex-col items-center gap-3 z-50">
      {/* Joystick */}
      <div
        ref={pad}
        onPointerDown={down}
        onPointerUp={up}
        className="relative w-24 h-24 bg-gray-300 rounded-full touch-none"
        style={{ touchAction: "none" }}
      >
        <div
          ref={knob}
          className="absolute w-10 h-10 bg-gray-700 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      {/* Control de velocidad */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-white">Velocidad {spd}</span>
        <input
          type="range"
          min="1"
          max="8"
          value={spd}
          onChange={e => setSpd(Number(e.target.value))}
          className="w-32 accent-orange-500"
        />
      </div>

      {/* Control de zoom 1–5 */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-white">Zoom {zoom}×</span>
        <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}       /* actualiza UI */
            onPointerUp={e => zoomTo(Number(e.target.value))}     /* una sola petición */
            className="w-32 accent-blue-600"
            />

      </div>

      <button
        onClick={() => setOpen(false)}
        className="text-xs text-white underline"
      >
        Cerrar
      </button>
    </div>
  );
}
