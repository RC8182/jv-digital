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
import usePresetStore from "@/store/presetStore";
import VerticalSlider from "./VerticalSlider";

export default function PTZControls() {
  const [open, setOpen] = useState(false);
  const [panSpeed, setPanSpeed] = useState(4);        // Velocidad de movimiento 1–8
  const [zoomSpeed, setZoomSpeed] = useState(4);      // Velocidad de zoom 1–8
  const SEND_MS = 400;                                // intervalo de refresco

  const panLoop  = useRef(null);
  const zoomLoop = useRef(null);
  const isMobile = useRef(false);

  // Estado global de presets
  const { presetsDisabled } = usePresetStore();

  // Detectar si estamos en la página de Ricardo
  const [isRicardoPage, setIsRicardoPage] = useState(false);

  // Detectar móvil vs escritorio
  useEffect(() => {
    isMobile.current = matchMedia("(pointer: coarse)").matches;
  }, []);

  // Detectar si estamos en la página de Ricardo
  useEffect(() => {
    const pathname = window.location.pathname;
    setIsRicardoPage(pathname.includes('/ricardo'));
  }, []);

  /* ─── Helpers Dahua ─── */
  async function sendPTZ(x=0,y=0,z=0){
    // Verificar si los presets están deshabilitados (excepto para Ricardo)
    if (presetsDisabled && !isRicardoPage) {
      console.log("PTZ deshabilitado - presets globalmente deshabilitados");
      return;
    }

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

  // Función para manejar zoom con dirección correcta (corregida)
  const handleZoomIn = () => {
    // + siempre acerca (zoom in) en todos los dispositivos
    zoomDown(zoomSpeed); // zoom in
  };

  const handleZoomOut = () => {
    // - siempre aleja (zoom out) en todos los dispositivos
    zoomDown(-zoomSpeed); // zoom out
  };

  /* ─── Teclado 4-8-6-2 + / - (sólo desktop) ─── */
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches) return;
    const held = new Set();
    let keyTmr = null;

    const vel = () => {
      let vx=0, vy=0, vz=0;
      held.forEach(k => {
        switch (k) {
          case "4": case "Numpad4": vx = -panSpeed; break;
          case "6": case "Numpad6": vx =  panSpeed; break;
          case "8": case "Numpad8": vy =  panSpeed; break; // arriba
          case "2": case "Numpad2": vy = -panSpeed; break; // abajo
          case "+": case "=": case "NumpadAdd":    vz =  zoomSpeed; break; // + acerca (zoom in)
          case "-": case "NumpadSubtract":         vz = -zoomSpeed; break; // - aleja (zoom out)
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
  }, [open, panSpeed, zoomSpeed]);

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

  // Si los presets están deshabilitados (excepto para Ricardo), mostrar mensaje
  if (presetsDisabled && !isRicardoPage) {
    return (
      <div className="absolute bottom-4 right-4 bg-red-500 text-white px-3 py-2 rounded text-sm z-50">
        PTZ Deshabilitado
        <button
          onClick={() => setOpen(false)}
          className="ml-2 text-xs underline"
        >
          Cerrar
        </button>
      </div>
    );
  }

  // Estilo base botones
  const btn = "absolute bg-black/50 p-2 rounded-full active:bg-black/70 text-white pointer-events-auto";

  return (
    <>
      {/* ─── INTERFAZ UNIFICADA: flechas absolutas ─── */}
      <div className="absolute inset-0 pointer-events-none z-50">
        {/* Indicador de admin para Ricardo */}
        {isRicardoPage && (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded text-xs pointer-events-auto">
            🔑 Admin Mode
          </div>
        )}

        {/* Arriba */}
        <FaArrowUp
          onPointerDown={() => dirDown(0, +panSpeed)}
          onPointerUp={dirUp}
          className={`${btn} top-4 left-1/2 transform -translate-x-1/2 w-8 h-8`}
        />
        {/* Abajo */}
        <FaArrowDown
          onPointerDown={() => dirDown(0, -panSpeed)}
          onPointerUp={dirUp}
          className={`${btn} bottom-20 left-1/2 transform -translate-x-1/2 w-8 h-8`}
        />
        {/* Izquierda */}
        <FaArrowLeft
          onPointerDown={() => dirDown(-panSpeed, 0)}
          onPointerUp={dirUp}
          className={`${btn} top-1/2 left-4 transform -translate-y-1/2 w-8 h-8`}
        />
        {/* Derecha */}
        <FaArrowRight
          onPointerDown={() => dirDown(+panSpeed, 0)}
          onPointerUp={dirUp}
          className={`${btn} top-1/2 right-4 transform -translate-y-1/2 w-8 h-8`}
        />

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
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex items-center gap-4 pointer-events-auto">
          <FaMinus
            onPointerDown={handleZoomOut}
            onPointerUp={zoomUp}
            className="w-6 h-6 text-white active:scale-95"
          />
          <FaPlus
            onPointerDown={handleZoomIn}
            onPointerUp={zoomUp}
            className="w-6 h-6 text-white active:scale-95"
          />
        </div>

        {/* Cerrar */}
        <button
          onClick={() => setOpen(false)}
          className="absolute bottom-4 left-4 text-xs text-white underline pointer-events-auto"
        >Cerrar</button>
      </div>
    </>
  );
}
