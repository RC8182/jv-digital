"use client";

import { useEffect, useState } from "react";
import FullCameraStreamFull from "./components/WebRTCCameraStreamFull";

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
      <FullCameraStreamFull params={params} />
    </main>
  );
}
