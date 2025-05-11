// FullCameraStream.jsx
/* eslint react-hooks/exhaustive-deps: 0 */
"use client";

import { useEffect, useRef, useState } from "react";
import { fetchProducts } from "../utils/azul-fetch";
import Marquee from "./marquee";

const FullCameraStream = ({ params }) => {
  /* ────────────────  TEXTOS MULTI-IDIOMA  ──────────────── */
  const idioma        = params.lang || "es";
  const playakite     = idioma === "es" ? "Playa Kite"           : "Kite Beach";
  const bilenkoTxt    = idioma === "es" ? "Tecnología ofrecida por" : "Technology offered by";
  const tituloBotones = idioma === "es" ? "¡Elige tu vista!"     : "Choose your view!";

  /* ────────────────  REFS & STATE  ──────────────── */
  const videoRef        = useRef(null);
  const webrtcReaderRef = useRef(null);
  const [readerLoaded, setReaderLoaded] = useState(false);

  const [isClient,      setIsClient]      = useState(false);
  const [selectedPreset,setSelected]      = useState(null);
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [products,      setProducts]      = useState([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [fetchError,    setFetchError]    = useState(null);

  /* ────────────────  MARCAR COMO CLIENTE  ──────────────── */
  useEffect(() => { setIsClient(true); }, []);

  /* ────────────────  CARGA DE PRODUCTOS  ──────────────── */
  useEffect(() => {
    const getProducts = async () => {
      try {
        const fetched = await fetchProducts();
        const mapped  = fetched.map(p => ({
          id:    p.id,
          name:  p.name,
          link:  p.permalink,
          img:   p.images[0]?.src ?? "",
          price: p.price ? `${p.price} €` : "Precio no disponible",
        }));
        setProducts(mapped);
        setIsLoading(false);
      } catch (err) {
        console.error("Error al obtener productos:", err);
        setFetchError(err);
        setIsLoading(false);
      }
    };
    if (isClient) getProducts();
  }, [isClient]);

  /* ────────────────  ROTAR PRODUCTOS  ──────────────── */
  useEffect(() => {
    if (products.length === 0) return;
    const id = setInterval(
      () => setCurrentIndex(i => (i + 1) % products.length),
      5000
    );
    return () => clearInterval(id);
  }, [products]);

  /* ────────────────  CARGAR SCRIPT WebRTC UNA VEZ ──────────────── */
  useEffect(() => {
    if (!isClient) return;
    const script = document.createElement("script");
    script.src   = "https://azul-kite.ddns.net/webrtc/dahua/reader.js";
    script.defer = true;
    script.onload = () => setReaderLoaded(true);
    document.body.appendChild(script);
    return () => script.remove();
  }, [isClient]);

  /* ────────────────  SETUP WebRTC (inicial y tras cambio de preset) ──────────────── */
  const setupWebRTC = () => {
    if (!readerLoaded || !videoRef.current) return;
    // Cierra conexión previa si existe
    if (webrtcReaderRef.current) {
      webrtcReaderRef.current.pc.close();
      webrtcReaderRef.current = null;
      videoRef.current.srcObject = null;
    }
    // Crea nueva instancia
    webrtcReaderRef.current = new window.MediaMTXWebRTCReader({
      url: "https://azul-kite.ddns.net/webrtc/dahua/whep",
      iceServers: [
            { urls: "stun:stun.l.google.com:19302" }
         ],
      iceTransportPolicy: "all",
      onError: err => console.error("WebRTC error:", err),
      onTrack: evt => {
        const videoEl = videoRef.current;
        videoEl.srcObject = evt.streams[0];
        videoEl.play().catch(() => {});
      },
    });
  };

  /* Inicializa WebRTC cuando esté todo listo */
  useEffect(() => {
    if (readerLoaded && products.length > 0) {
      setupWebRTC();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readerLoaded, products]);

    /* ────────────────  HANDLER PRESETS PTZ  ──────────────── */
  const handlePreset = (presetId) => {
    setSelected(presetId);
    const preset =
      presetId === "AzulKiteboarding" ? 1 :
      presetId === playakite          ? 2 :
      presetId === "Muelle"           ? 3 : "";

    fetch(`/api/azul-cam/cameraControl?action=preset&preset=${preset}`)
      .then(r => {
        if (!r.ok) throw new Error("Respuesta PTZ KO");
        console.log(`Preset ${presetId} activado`);
        // No es necesario reiniciar WebRTC: la transmisión sigue automáticamente
      })
      .catch(err => console.error("Error PTZ:", err));
  };

  /* ────────────────  RENDER  ──────────────── */
  if (!isClient || isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando…</div>;
  }
  if (fetchError) {
    return <div className="text-center text-red-500">Error al cargar los productos.</div>;
  }

  return (
    <div className="video-container min-w-[300px]">
      <h1 className="p-2 text-center md:text-4xl text-lg mb-[10px]">El Médano Webcam</h1>

      <div className="video-wrapper relative w-full bg-black">
        <Marquee products={products} currentIndex={currentIndex} />
        <video
          ref={videoRef}
          className="webrtc-video w-full h-auto block object-cover"
          playsInline
          muted
          controls
        />
      </div>

      <div className="p-4 flex justify-end items-center gap-2">
        <h2 className="text-xs text-white font-bold">{bilenkoTxt}</h2>
        <a href="https://bilenko.es/">
          <img
            className="w-16"
            src="https://www.azulkiteboarding.com/wp-content/uploads/2024/02/LOGO-BILENKO_VERDE.png"
            alt="Bilenko Logo"
            loading="lazy"
          />
        </a>
      </div>

      <h1 className="p-2 text-center md:text-3xl text-lg mb-[10px]">{tituloBotones}</h1>
      <div className="p-10 flex flex-col justify-center gap-10 md:flex-row">
        {["AzulKiteboarding", playakite, "Muelle"].map((preset) => (
          <button
            key={preset}
            onClick={() => handlePreset(preset)}
            className={`preset-button ${selectedPreset === preset ? "selected" : ""}`}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* ────────────────  STYLES  ──────────────── */}
      <style jsx>{`
        .video-container { max-width: 1000px; margin: 0 auto; background:#000; color:#fff; }
        .preset-button    { background:#fff; color:#000; padding:10px 20px;
                            border-radius:5px; border:1px solid #007bff; cursor:pointer;
                            transition:background .3s,color .3s; }
        .preset-button.selected { background:#007bff; color:#fff; }
      `}</style>
    </div>
  );
};

export default FullCameraStream;
