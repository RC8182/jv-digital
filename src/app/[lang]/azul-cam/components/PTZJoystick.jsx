// components/PTZControls.jsx
"use client";

import { useRef, useState, useEffect } from "react";
import {
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaPlus,
  FaMinus
} from "react-icons/fa";

export default function PTZControls() {
  const [open, setOpen] = useState(false);
  const [spd , setSpd ] = useState(4);        // 1–8 (escala Dahua)
  const SEND_MS = 400;                        // intervalo de refresco

  const panLoop  = useRef(null);
  const zoomLoop = useRef(null);
  const isMobile = useRef(false);

  // Detectar móvil vs escritorio
  useEffect(() => {
    isMobile.current = matchMedia("(pointer: coarse)").matches;
  }, []);

  /* ─── Helpers Dahua ─── */
  async function sendPTZ(x=0,y=0,z=0){
    const q = new URLSearchParams({
      action:"start", channel:"1", code:"Continuously",
      arg1:x, arg2:y, arg3:z, arg4:"1"
    });
    await fetch(`/api/azul-cam/cameraControl?${q}`);
  }
  async function stopPTZ(){
    await sendPTZ(0,0,0);
  }

  /* ─── Movimiento direccional ─── */
  function dirDown(vx, vy){
    sendPTZ(vx,vy,0);
    if(!panLoop.current){
      panLoop.current = setInterval(()=>sendPTZ(vx,vy,0), SEND_MS);
    }
  }
  function dirUp(){
    clearInterval(panLoop.current);
    panLoop.current = null;
    stopPTZ();
  }

  /* ─── Zoom ─── */
  function zoomDown(vz){
    sendPTZ(0,0,vz);
    if(!zoomLoop.current){
      zoomLoop.current = setInterval(()=>sendPTZ(0,0,vz), SEND_MS);
    }
  }
  function zoomUp(){
    clearInterval(zoomLoop.current);
    zoomLoop.current = null;
    stopPTZ();
  }

  /* ─── Teclado 4-8-6-2 + / - (sólo desktop) ─── */
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches) return;
    const held = new Set();
    let keyTmr = null;

    const vel = () => {
      let vx=0, vy=0, vz=0;
      held.forEach(k => {
        switch (k) {
          case "4": case "Numpad4": vx = -spd; break;
          case "6": case "Numpad6": vx =  spd; break;
          case "8": case "Numpad8": vy =  spd; break; // arriba
          case "2": case "Numpad2": vy = -spd; break; // abajo
          case "+": case "=": case "NumpadAdd":    vz = spd; break; // zoom in
          case "-": case "NumpadSubtract":         vz = -spd; break; // zoom out
        }
      });
      return { vx, vy, vz };
    };

    const ok = /^[4682]$|^Numpad[2468]$|^[\+\=\-]$|^Numpad(Add|Subtract)$/;

    const kd = e => {
      if (!open || e.repeat || !ok.test(e.key)) return;
      e.preventDefault();
      held.add(e.key);
      const { vx, vy, vz } = vel();
      sendPTZ(vx, vy, vz);
      if (!keyTmr) {
        keyTmr = setInterval(() => {
          const v = vel();
          sendPTZ(v.vx, v.vy, v.vz);
        }, SEND_MS);
      }
    };

    const ku = e => {
      if (!held.delete(e.key)) return;
      e.preventDefault();
      if (held.size === 0) {
        clearInterval(keyTmr);
        keyTmr = null;
        stopPTZ();
      } else {
        const { vx, vy, vz } = vel();
        sendPTZ(vx, vy, vz);
      }
    };

    window.addEventListener("keydown", kd, { passive: false });
    window.addEventListener("keyup",   ku, { passive: false });
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup",   ku);
      clearInterval(keyTmr);
    };
  }, [open, spd]);

  /* ─── Detener si sueltas fuera ─── */
  useEffect(() => {
    const stopAll = () => { dirUp(); zoomUp(); };
    window.addEventListener("pointerup",    stopAll);
    window.addEventListener("pointercancel", stopAll);
    return () => {
      window.removeEventListener("pointerup",    stopAll);
      window.removeEventListener("pointercancel", stopAll);
    };
  }, []);

  /* ─── UI ─── */
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-black/60 text-white text-2xl z-50"
      >＋</button>
    );
  }

  // Estilo base botones
  const btn = "absolute bg-black/50 p-2 rounded-full active:bg-black/70 text-white pointer-events-auto";

  return (
    <>
      {isMobile.current ? (
        /* ─── MÓVIL: flechas absolutas ─── */
        <div className="absolute inset-0 pointer-events-none z-50">
          {/* Arriba */}
          <FaArrowUp
            onPointerDown={() => dirDown(0, +spd)}
            onPointerUp={dirUp}
            className={`${btn} top-4 left-1/2 transform -translate-x-1/2 w-8 h-8`}
          />
          {/* Abajo */}
          <FaArrowDown
            onPointerDown={() => dirDown(0, -spd)}
            onPointerUp={dirUp}
            className={`${btn} bottom-20 left-1/2 transform -translate-x-1/2 w-8 h-8`}
          />
          {/* Izquierda */}
          <FaArrowLeft
            onPointerDown={() => dirDown(-spd, 0)}
            onPointerUp={dirUp}
            className={`${btn} top-1/2 left-4 transform -translate-y-1/2 w-8 h-8`}
          />
          {/* Derecha */}
          <FaArrowRight
            onPointerDown={() => dirDown(+spd, 0)}
            onPointerUp={dirUp}
            className={`${btn} top-1/2 right-4 transform -translate-y-1/2 w-8 h-8`}
          />

          {/* Centro abajo: velocidad + zoom */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 pointer-events-auto">
            <input
              type="range"
              min="1"
              max="8"
              value={spd}
              onChange={e => setSpd(+e.target.value)}
              className="accent-orange-500"
            />
            <FaPlus
              onPointerDown={() => zoomDown(-spd)}
              onPointerUp={zoomUp}
              className="w-6 h-6 text-white active:scale-95"
            />
            <FaMinus
              onPointerDown={() => zoomDown(+spd)}
              onPointerUp={zoomUp}
              className="w-6 h-6 text-white active:scale-95"
            />
          </div>

          {/* Cerrar */}
          <button
            onClick={() => setOpen(false)}
            className="absolute bottom-4 right-4 text-xs text-white underline pointer-events-auto"
          >Cerrar</button>
        </div>
      ) : (
        /* ─── DESKTOP: grid de botones ─── */
        <div className="absolute bottom-4 right-4 bg-black/70 p-4 rounded-xl flex flex-col items-center gap-4 z-50 pointer-events-auto">
          <div className="grid grid-cols-3 gap-2">
            <div />
            <button
              className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center active:bg-gray-400"
              onPointerDown={() => dirDown(0, +spd)}
              onPointerUp={dirUp}
            ><FaArrowUp className="w-6 h-6 text-black" /></button>
            <div />
            <button
              className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center active:bg-gray-400"
              onPointerDown={() => dirDown(-spd, 0)}
              onPointerUp={dirUp}
            ><FaArrowLeft className="w-6 h-6 text-black" /></button>
            <div />
            <button
              className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center active:bg-gray-400"
              onPointerDown={() => dirDown(+spd, 0)}
              onPointerUp={dirUp}
            ><FaArrowRight className="w-6 h-6 text-black" /></button>
            <div />
            <button
              className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center active:bg-gray-400"
              onPointerDown={() => dirDown(0, -spd)}
              onPointerUp={dirUp}
            ><FaArrowDown className="w-6 h-6 text-black" /></button>
            <div />
          </div>

          <div className="flex gap-4">
            <button
              className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center active:bg-gray-400"
              onPointerDown={() => zoomDown(+spd)}
              onPointerUp={zoomUp}
            ><FaPlus className="w-6 h-6 text-black" /></button>
            <button
              className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center active:bg-gray-400"
              onPointerDown={() => zoomDown(-spd)}
              onPointerUp={zoomUp}
            ><FaMinus className="w-6 h-6 text-black" /></button>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-white">Velocidad {spd}</span>
            <input
              type="range"
              min="1"
              max="8"
              value={spd}
              onChange={e => setSpd(+e.target.value)}
              className="w-32 accent-orange-500"
            />
          </div>

          <button
            onClick={() => setOpen(false)}
            className="text-xs text-white underline"
          >Cerrar</button>
        </div>
      )}
    </>
  );
}
