"use client";
import { useState, useEffect, useRef } from "react";

const ScrollProgressButton = () => {
  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    setScrollProgress(progress);
    setIsActive(window.scrollY > 50);
  };

  const handleProgressClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <button
      ref={scrollRef}
      onClick={handleProgressClick}
      title="Go To Top"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '50px', // Tamaño del botón ajustado
        height: '50px', // Tamaño del botón ajustado
        backgroundColor: isActive ? '#FFFFFF' : 'transparent',
        border: 'none',
        borderRadius: '50%',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isActive
          ? '0 4px 8px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.19)'
          : 'none',
        cursor: isActive ? 'pointer' : 'default',
        opacity: isActive ? 1 : 0,
        transition: 'opacity 0.3s ease',
        zIndex: 1000,
      }}
    >
      {/* Ícono de flecha hacia arriba */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          width: '24px',
          height: '24px',
          color: '#3887FE',
        }}
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>

      {/* Círculo de progreso */}
      <svg
        width="40px" // Ajustamos el tamaño del círculo SVG
        height="40px" // Ajustamos el tamaño del círculo SVG
        viewBox="-1 -1 102 102"
        style={{
          position: 'absolute',
          transform: 'rotate(-90deg)',
        }}
      >
        <path
          d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"
          stroke="#3887FE"
          strokeWidth="4"
          fill="none"
          style={{
            strokeDasharray: "308.66px",
            strokeDashoffset: `${308.66 - scrollProgress * 3.0866}px`,
            transition: "stroke-dashoffset 0.3s ease",
          }}
        />
      </svg>
    </button>
  );
};

export default ScrollProgressButton;
