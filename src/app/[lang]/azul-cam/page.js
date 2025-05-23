"use client";

import { useEffect, useState } from "react";
import FullCameraStream from "./components/WebRTCCameraStream";


export default function Page({ params }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Solo renderiza en cliente
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <FullCameraStream params={params} />
    </main>
  );
}
