"use client";
import { useEffect, useState } from "react";
import SimpleCameraStream from "./components/SimpleCameraStream.js";
import FullCameraStream from "./components/FullCameraStream";

export default function Page({ params }) {
  const [isIOS, setIsIOS] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent.toLowerCase();
      // Detectar iPhone, iPad o iPod
      const isIPhone = ua.includes("iphone");
      const isIPad = ua.includes("ipad");
      const isIPod = ua.includes("ipod");

      if (isIPhone || isIPad || isIPod) {
        setIsIOS(true);
      }

      setIsClient(true);
    }
  }, []);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      {isIOS ? (
        <SimpleCameraStream params={params} />
      ) : (
        <FullCameraStream params={params} />
      )}
    </main>
  );
}
