"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import Hls from "hls.js";
import { fetchProducts } from "../utils/azul-fetch"; // Asegúrate de que la ruta es correcta
import Marquee from "./marquee";

const FullCameraStream = ({ params }) => {
  const idioma = params.lang || "es";
  const playakite = idioma === "es" ? "Playa Kite" : "Kite Beach";
  const bilenko = idioma === "es" ? "Tecnología ofrecida por" : "Technology offered by";
  const tituloBotones = idioma === "es" ? "¡Elige tu vista!" : "Choose your view!";

  const videoRef = useRef(null);
  const hlsInstanceRef = useRef(null);

  const [isClient, setIsClient] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Establecer que el componente es cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Obtener productos al montar el componente
  useEffect(() => {
    const getProducts = async () => {
      try {
        const fetchedProducts = await fetchProducts();

        // Transformar los productos al formato requerido por Marquee
        const transformedProducts = fetchedProducts.map((product) => ({
          id: product.id,
          name: product.name, // Nombre del producto
          link: product.permalink, // Enlace al producto
          img: product.images[0]?.src || "", // Primera imagen
          price: product.price ? `${product.price} €` : "Precio no disponible", // Precio
        }));

        setProducts(transformedProducts);
        setIsLoading(false);
      } catch (error) {
        console.error("Error al obtener productos:", error);
        setFetchError(error);
        setIsLoading(false);
      }
    };

    if (isClient) {
      getProducts();
    }
  }, [isClient]);

  // Rotar el índice actual de productos cada 5 segundos
  useEffect(() => {
    if (products.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [products]);

  // Inicializar el reproductor de video
  useEffect(() => {
    if (isClient && videoRef.current && products.length > 0) {
      const videoElement = videoRef.current;
      const player = videojs(videoElement, {
        liveui: true,
        fluid: true,
        controls: true,
        autoplay: true,
        muted: true,
        controlBar: {
          fullscreenToggle: true, // Asegura que el botón de pantalla completa está habilitado
        },
      });
      setupHLS(videoElement);

      // Listener para pantalla completa
      player.on('fullscreenchange', () => {
        if (player.isFullscreen()) {
          console.log('Entró en pantalla completa');
        } else {
          console.log('Salió de pantalla completa');
        }
      });

      return () => {
        if (hlsInstanceRef.current) {
          hlsInstanceRef.current.destroy();
          hlsInstanceRef.current = null;
        }
        player.dispose();
      };
    }
  }, [isClient, products]);

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
      hls.loadSource("https://azul-kite.ddns.net/api/webcam/index.m3u8");
      hls.attachMedia(videoElement);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoElement.play();
      });
      hlsInstanceRef.current = hls;
    } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
      videoElement.src = "https://azul-kite.ddns.net/api/webcam/index.m3u8";
      videoElement.addEventListener("loadedmetadata", () => {
        videoElement.play();
      });
    }
  };

  // Manejar la selección de preset
  const handlePreset = (presetId) => {
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

    fetch(url)
      .then((response) => {
        if (response.ok) {
          console.log(`Preset ${presetId} activado`);
          if (videoRef.current) {
            setupHLS(videoRef.current);
          }
        } else {
          console.error("Error al activar preset");
        }
      })
      .catch((error) => {
        console.error("Error al conectar con la cámara:", error);
      });
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

      <div className="video-wrapper relative w-full bg-black">
        <Marquee products={products} currentIndex={currentIndex} />
        <video
          ref={videoRef}
          className="video-js vjs-default-skin vjs-big-play-centered"
        />
      </div>

      <div className="p-4 flex justify-end items-center">
        <h2 className="text-xs text-white font-bold mb-4">{bilenko}</h2>
        <a href="https://bilenko.es/">
          <img
            className="ml-2 w-16"
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
      `}</style>
    </div>
  );
};

export default FullCameraStream;
