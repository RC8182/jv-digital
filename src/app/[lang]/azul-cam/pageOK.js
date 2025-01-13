"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import Hls from "hls.js";

const CameraStream = ({ params }) => {
  const idioma = params.lang || "es";
  const playakite = idioma === "es" ? "Playa Kite" : "Kite Beach";
  const bilenko = idioma === "es" ? "Tecnología ofrecida por" : "Technology offered by";
  const tituloBotones = idioma === "es" ? "Elige tu vista!" : "Choose your view!";
  const videoRef = useRef(null);
  const hlsInstanceRef = useRef(null); // Referencia para HLS.js
  const [isClient, setIsClient] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const products = [
    {
      img: "https://www.azulkiteboarding.com/wp-content/uploads/2024/10/Bar_04_2_2_rotation.01.jpg",
      link: "https://www.azulkiteboarding.com/en/brands/eleveight-cs-auto-bar-2024-2/",
      text: "ELEVEIGHT CS Auto Bar 2024 - 535,00 €",
    },
    {
      img: "https://www.azulkiteboarding.com/wp-content/uploads/2024/04/WS-V7-View-2-White.png",
      link: "https://www.azulkiteboarding.com/en/all-sales-en/eleveight-wsv6-5m-test-kite/",
      text: "Eleveight WSV6 5m test kite - 395,00 €",
    },
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && videoRef.current) {
      const videoElement = videoRef.current;

      // Configuración de Video.js
      const player = videojs(videoElement, {
        liveui: true,
        fluid: true,
        controls: true,
        autoplay: true,
        muted: true,
      });

      // Inicializa el flujo HLS
      setupHLS(videoElement);

      return () => {
        if (hlsInstanceRef.current) {
          hlsInstanceRef.current.destroy(); // Limpia la instancia de HLS.js
          hlsInstanceRef.current = null;
        }
        player.dispose(); // Limpia el reproductor Video.js
      };
    }
  }, [isClient]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
    }, 5000); // Cambia el producto cada 5 segundos
    return () => clearInterval(interval);
  }, [products.length]);

  const setupHLS = (videoElement) => {
    if (Hls.isSupported()) {
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy(); // Limpia cualquier instancia anterior de HLS.js
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

  const handlePreset = (presetId) => {
    setSelectedPreset(presetId);
    const preset = presetId === "AzulKiteboarding" ? 1 : presetId === playakite ? 2 : presetId === "Muelle" ? 3 : "";
    const url = `/api/cameraControl?action=preset&preset=${preset}`;

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

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="video-container  min-w-[300px]">
      <h1 className="p-2 text-center md:text-4xl text-lg mb[10px]">El Médano Webcam</h1>

      <div className="video-wrapper">
        {/* Marquee sobre el video */}
        <div className="marquee">
          <div className="flex justify-center items-center gap-10">
            <img
              src={products[currentIndex].img}
              alt="Producto"
              className="sm:w-[100px] sm:h-[100px] w-[40px] h-[40px]"
            />
            <a
              href={products[currentIndex].link}
              target="_blank"
              rel="noopener noreferrer"
              className="product-link"
            >
              {products[currentIndex].text}
            </a>
          </div>
        </div>

        <video
          ref={videoRef}
          className="video-js vjs-default-skin vjs-big-play-centered"
          data-setup="{}"
        />
      </div>
      
      <div className="p-4 flex justify-end">
        <h2 className="text-xs text-white font-bold mb-4 ">{bilenko}</h2>
        <a href="https://bilenko.es/">
          <img
            className="ml-2 w-16"
            src="https://www.azulkiteboarding.com/wp-content/uploads/2024/02/LOGO-BILENKO_VERDE.png"
            alt="alt_de_la_imagen"
            loading="lazy"
          />
        </a>
      </div>
      <h1 className="p-2 text-center md:text-3xl text-lg mb[10px]">{tituloBotones}</h1>
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
        }


        .video-wrapper {
          position: relative;
          width: 100%;
          background-color: #000;
        }

        video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .marquee {
          position: absolute;
          top: 0;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.6);
          padding: 10px;
          z-index: 2;
          animation: fade-in-out 5s infinite;
        }


        .product-link {
          color: #fff;
          text-decoration: none;
          font-size: 0.9rem;
        }

        @keyframes fade-in-out {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
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

export default CameraStream;
