"use client";

import { useEffect, useRef, useState } from "react";
import { fetchProducts } from "../utils/azul-fetch"; // Asegúrate de que la ruta es correcta
import Marquee from "./marquee";

const SimpleCameraStream = () => {
  const videoRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);

  // Estados para Marquee
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Obtener productos al montar el componente
  useEffect(() => {
    const getProducts = async () => {
      try {
        const fetchedProducts = await fetchProducts();
        console.log("Productos obtenidos:", fetchedProducts);

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

  const handlePlay = () => {
    if (!videoRef.current) return;
    try {
      videoRef.current.src = "https://azul-kite.ddns.net/api/webcam/index.m3u8";
      videoRef.current.load(); // Carga explícita del stream
      videoRef.current.play().catch((err) => {
        console.error("Error al iniciar el vídeo:", err);
      });
      setVideoStarted(true);
    } catch (err) {
      console.error("Error en handlePlay:", err);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>El Médano Webcam (iOS)</h1>
      <div style={styles.videoWrapper}>
        {/* Renderizar Marquee solo si hay productos y el video está en ejecución */}
        {videoStarted && !isLoading && !fetchError && (
          <Marquee products={products} currentIndex={currentIndex} />
        )}
        <video
          ref={videoRef}
          muted
          playsInline
          style={styles.video} // Ocultamos los controles nativos
        />
      </div>
      <div style={styles.buttonContainer}>
        {!videoStarted ? (
          <button onClick={handlePlay} style={styles.button}>
            Iniciar Video
          </button>
        ) : (
          <>
            <button onClick={handlePause} style={styles.button}>
              Pausar Video
            </button>
            <button onClick={handlePlay} style={styles.button}>
              Reanudar Video
            </button>
          </>
        )}
      </div>
      {/* Manejo de estados de carga y error */}
      {isLoading && (
        <div style={styles.statusMessage}>Cargando productos...</div>
      )}
      {fetchError && (
        <div style={styles.errorMessage}>Error al cargar los productos.</div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#000",
    color: "#fff",
    padding: "20px",
    position: "relative",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "1.5rem",
  },
  videoWrapper: {
    position: "relative",
    width: "100%",
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "auto",
    backgroundColor: "#000",
    display: "block", // Aseguramos que se renderiza correctamente
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "20px",
  },
  button: {
    background: "#fff",
    color: "#000",
    padding: "10px 20px",
    borderRadius: "5px",
    border: "1px solid #007bff",
    cursor: "pointer",
    transition: "background 0.3s, color 0.3s",
  },
  statusMessage: {
    textAlign: "center",
    marginTop: "20px",
    color: "#ccc",
  },
  errorMessage: {
    textAlign: "center",
    marginTop: "20px",
    color: "#ff0000",
  },
};

export default SimpleCameraStream;
