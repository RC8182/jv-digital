"use client";

import { useState, useRef, useEffect } from "react";
import PTZOverlay from "./PTZOverlay";
import usePresetStore from "@/store/presetStore";

export default function PTZControls() {
  /* UI ↓ desplegable */
  const [open, setOpen] = useState(false);

  /* Velocidades separadas Dahua 1-8 */
  const [panSpeed, setPanSpeed] = useState(4);  // Velocidad de movimiento
  const [zoomSpeed, setZoomSpeed] = useState(4); // Velocidad de zoom
  const SEND_MS = 400;

  /* Loops para mantener comando vivo */
  const panLoop  = useRef(null);
  const zoomLoop = useRef(null);

  // Estado global de presets
  const { presetsDisabled, isAdmin } = usePresetStore();

  // Detectar si estamos en la página de Ricardo
  const [isRicardoPage, setIsRicardoPage] = useState(false);
  
  useEffect(() => {
    // Verificar si estamos en la página de Ricardo
    const pathname = window.location.pathname;
    setIsRicardoPage(pathname.includes('/ricardo'));
  }, []);

  /* ─── helpers HTTP PTZ ─── */
  async function sendPTZ(x = 0, y = 0, z = 0) {
    // Verificar si los presets están deshabilitados (excepto para Ricardo)
    if (presetsDisabled && !isRicardoPage) {
      console.log("PTZ deshabilitado - presets globalmente deshabilitados");
      return;
    }

    const q = new URLSearchParams({
      action: "start", channel: "1", code: "Continuously",
      arg1: x, arg2: y, arg3: z, arg4: "1"
    });
    await fetch(`/api/azul-cam/cameraControl?${q}`);
  }
  async function stopPTZ() { await sendPTZ(0, 0, 0); }

  /* ─── Direcciones ─── */
  function dirDown(vx, vy) {
    sendPTZ(vx, vy, 0);
    if (!panLoop.current) {
      panLoop.current = setInterval(() => sendPTZ(vx, vy, 0), SEND_MS);
    }
  }
  function dirUp() {
    clearInterval(panLoop.current); panLoop.current = null;
    stopPTZ();
  }

  /* ─── Zoom ─── */
  function zoomDown(vz) {
    sendPTZ(0, 0, vz);
    if (!zoomLoop.current) {
      zoomLoop.current = setInterval(() => sendPTZ(0, 0, vz), SEND_MS);
    }
  }
  function zoomUp() {
    clearInterval(zoomLoop.current); zoomLoop.current = null;
    stopPTZ();
  }

  /* ─── Teclado 4-8-6-2 ± ─── */
  useEffect(() => {
    const held = new Set();
    let keyTmr = null;

    const v = () => {
      let vx = 0, vy = 0, vz = 0;
      held.forEach(k => {
        switch (k) {
          case "4": case "Numpad4": vx = -panSpeed; break;
          case "6": case "Numpad6": vx =  panSpeed; break;
          case "8": case "Numpad8": vy =  panSpeed; break;
          case "2": case "Numpad2": vy = -panSpeed; break;
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
      const { vx, vy, vz } = v();
      sendPTZ(vx, vy, vz);
      if (!keyTmr) keyTmr = setInterval(() => {
        const { vx, vy, vz } = v();
        sendPTZ(vx, vy, vz);
      }, SEND_MS);
    };

    const ku = e => {
      if (!held.delete(e.key)) return;
      e.preventDefault();
      if (held.size === 0) {
        clearInterval(keyTmr); keyTmr = null; stopPTZ();
      } else {
        const { vx, vy, vz } = v(); sendPTZ(vx, vy, vz);
      }
    };

    window.addEventListener("keydown", kd, { passive:false });
    window.addEventListener("keyup",   ku, { passive:false });
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup",   ku);
      clearInterval(keyTmr);
    };
  }, [open, panSpeed, zoomSpeed]);

  /* Freno global si pointer se suelta fuera */
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
  // Solo mostrar el botón si es Ricardo
  if (!open) {
    // Si no es Ricardo, no mostrar el botón
    if (!isRicardoPage) {
      return null;
    }
    
    return (
      <button
        onClick={() => setOpen(true)}
        className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-black/60 text-white text-2xl z-50"
      >＋</button>
    );
  }

  return (
    <PTZOverlay
      panSpeed={panSpeed}
      setPanSpeed={setPanSpeed}
      zoomSpeed={zoomSpeed}
      setZoomSpeed={setZoomSpeed}
      dirDown={dirDown}
      dirUp={dirUp}
      zoomDown={zoomDown}
      zoomUp={zoomUp}
      close={() => setOpen(false)}
      presetsDisabled={presetsDisabled && !isRicardoPage}
      isRicardoPage={isRicardoPage}
    />
  );
}
