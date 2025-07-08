"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { fetchProducts } from "../utils/azul-fetch";
import usePresetStore from "@/store/presetStore";

const FullCameraStream = ({ params }) => {
  const idioma        = params.lang || "es";
  const playakite     = idioma === "es" ? "Playa Kite" : "Kite Beach";
  const bilenkoTxt    = idioma === "es" ? "Tecnología ofrecida por" : "Technology offered by";
  const tituloBotones = idioma === "es" ? "¡Elige tu vista!" : "Choose your view!";

  const videoRef        = useRef(null);
  const hlsInstanceRef  = useRef(null);

  const [isClient,      setIsClient]      = useState(false);
  const [selectedPreset,setSelectedPreset] = useState(null);
  const [products,      setProducts]      = useState([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [fetchError,    setFetchError]    = useState(null);

  // Estado global de presets
  const { presetsDisabled, arePresetsEnabled } = usePresetStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  useEffect(() => {
    if (products.length === 0) return;
    const id = setInterval(
      () => setSelectedPreset((i) => (i + 1) % products.length),
      5000
    );
    return () => clearInterval(id);
  }, [products]);

  useEffect(() => {
    if (!isClient || !videoRef.current) return;
    setupHLS(videoRef.current);
  }, [isClient]);

  // Configurar HLS
  const setupHLS = (videoElement) => {
    if (Hls.isSupported()) {
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
      }
      const hls = new Hls({
        liveSyncDuration: 1,
        liveMaxLatencyDuration: 3,
        maxBufferLength: 1,
        maxMaxBufferLength: 3,
        backBufferLength: 1,
      });
      hls.loadSource("https://azul-kite.ddns.net/dahua/index.m3u8");
      //hls.loadSource("https://jv-digital.com/dahua/index.m3u8");
      hls.attachMedia(videoElement);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoElement.play();
      });
      hlsInstanceRef.current = hls;
    } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
      videoElement.src = "https://azul-kite.ddns.net/dahua/index.m3u8";
      //videoElement.src = "https://jv-digital.com/dahua/index.m3u8";
      videoElement.addEventListener("loadedmetadata", () => {
        videoElement.play();
      });
    }
  };

  // Manejar la selección de preset
  const handlePreset = async (presetId) => {
    // Verificar si los presets están habilitados
    if (!arePresetsEnabled()) {
      alert(idioma === "es" ? "Los presets están deshabilitados globalmente" : "Presets are globally disabled");
      return;
    }

    setSelectedPreset(presetId);
    const preset =
      presetId === "AzulKiteboarding"
        ? 1
        : presetId === playakite
        ? 2
        : presetId === "Muelle"
        ? 3
        : "";
    const url = `/api/azul-cam/cameraControl?action=preset&preset=${preset}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`Preset ${presetId} activado`);
        if (videoRef.current) {
          setupHLS(videoRef.current);
        }
      } else {
        if (data.presetsDisabled) {
          alert(idioma === "es" ? "Los presets están deshabilitados globalmente" : "Presets are globally disabled");
        } else {
          console.error("Error al activar preset");
          alert(idioma === "es" ? "Error al cambiar la vista de la cámara" : "Error changing camera view");
        }
      }
    } catch (error) {
      console.error("Error al conectar con la cámara:", error);
      alert(idioma === "es" ? "Error de conexión con la cámara" : "Camera connection error");
    }
  };

  if (!isClient || isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (fetchError) {
    return <div className="text-center text-red-500">Error al cargar los productos.</div>;
  }

  return (
    <div className="video-container min-w-[300px]">
      <h1 className="p-2 text-center md:text-4xl text-lg mb-[10px]">El Médano Webcam</h1>

      {/* Indicador de estado de presets */}
      {presetsDisabled && (
        <div className="bg-red-500 text-white text-center py-2 px-4 mb-4 rounded">
          {idioma === "es" ? "⚠️ Presets deshabilitados globalmente" : "⚠️ Presets globally disabled"}
        </div>
      )}

      <div className="video-wrapper relative w-full bg-black">
        <video
          ref={videoRef}
          className="w-full h-auto block object-cover"
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
            disabled={presetsDisabled}
            className={`preset-button ${selectedPreset === preset ? "selected" : ""} ${
              presetsDisabled ? "disabled" : ""
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Estilos internos */}
      <style jsx>{`
        .video-container {
          max-width: 1000px;
          margin: 0 auto;
          background-color: #000;
          color: #fff;
          position: relative;
          padding-bottom: 20px; /* Espacio inferior para evitar superposición */
        }
        .video-wrapper {
          position: relative;
          width: 100%;
          background-color: #000;
        }
        video {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
        }
        .preset-button {
          background: #fff;
          color: #000;
          padding: 10px 20px;
          border-radius: 5px;
          border: 1px solid #007bff;
          cursor: pointer;
          transition: background 0.3s, color 0.3s;
        }
        .preset-button.selected {
          background: #007bff;
          color: #fff;
        }
        .preset-button.disabled { 
          background:#666; color:#999; cursor:not-allowed; 
          border-color:#666; opacity:0.5;
        }
      `}</style>
      {/*<Anemometro/>*/}
    </div>
  );
};

export default FullCameraStream;
