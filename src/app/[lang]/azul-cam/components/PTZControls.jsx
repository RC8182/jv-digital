"use client";

import { useState, useRef, useEffect } from "react";
import PTZOverlay from "./PTZOverlay";

export default function PTZControls() {
  /* UI ↓ desplegable */
  const [open, setOpen] = useState(false);

  /* Velocidad Dahua 1-8 */
  const [spd, setSpd] = useState(4);
  const SEND_MS = 400;

  /* Loops para mantener comando vivo */
  const panLoop  = useRef(null);
  const zoomLoop = useRef(null);

  /* ─── helpers HTTP PTZ ─── */
  async function sendPTZ(x = 0, y = 0, z = 0) {
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
          case "4": case "Numpad4": vx = -spd; break;
          case "6": case "Numpad6": vx =  spd; break;
          case "8": case "Numpad8": vy =  spd; break;
          case "2": case "Numpad2": vy = -spd; break;
          case "+": case "=": case "NumpadAdd":    vz = -spd; break;
          case "-": case "NumpadSubtract":         vz =  spd; break;
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
  }, [open, spd]);

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
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-black/60 text-white text-2xl z-50"
      >＋</button>
    );
  }

  return (
    <PTZOverlay
      spd={spd}
      setSpd={setSpd}
      dirDown={dirDown}
      dirUp={dirUp}
      zoomDown={zoomDown}
      zoomUp={zoomUp}
      close={() => setOpen(false)}
    />
  );
}
