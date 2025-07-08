"use client";

import { useEffect, useState } from "react";
import FullCameraStream from "../azul-cam/components/WebRTCCameraStreamFull";
import usePresetStore from "@/store/presetStore";
import { usePresetSync } from "@/hooks/usePresetSync";

export default function Page({ params }) {
  const [isClient, setIsClient] = useState(false);

  // Estado global de presets
  const { 
    presetsDisabled, 
    togglePresets
  } = usePresetStore();

  // Hook de sincronización
  const { syncStatus, syncWithServer, updateServerState } = usePresetSync();

  useEffect(() => {
    // Solo renderiza en cliente
    setIsClient(true);
  }, []);

  // Función para cambiar el estado y sincronizar
  const handleTogglePresets = async () => {
    const newState = !presetsDisabled;
    
    const success = await updateServerState(newState);
    if (success) {
      togglePresets();
    } else {
      alert('Error al actualizar el estado en el servidor');
    }
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-900">
      {/* Panel de Control de Presets */}
      <div className="bg-gray-800 p-6 border-b border-gray-700">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-4">
            Panel de Control - Cámara El Médano
          </h1>
          
          <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={presetsDisabled}
                  onChange={handleTogglePresets}
                  className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-white font-medium">
                  Deshabilitar Presets Globalmente
                </span>
              </label>
              
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                presetsDisabled 
                  ? 'bg-red-500 text-white' 
                  : 'bg-green-500 text-white'
              }`}>
                {presetsDisabled ? 'DESHABILITADOS' : 'HABILITADOS'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={syncWithServer}
                disabled={syncStatus === "syncing"}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncStatus === "syncing" ? "Sincronizando..." : "Sincronizar"}
              </button>
              
              {syncStatus === "success" && (
                <span className="text-green-400 text-sm">✓ Sincronizado</span>
              )}
              {syncStatus === "error" && (
                <span className="text-red-400 text-sm">✗ Error</span>
              )}
            </div>
          </div>
          
          <div className="mt-4 text-gray-300 text-sm">
            <p>
              <strong>Estado actual:</strong> Los presets están {presetsDisabled ? 'deshabilitados' : 'habilitados'} globalmente.
            </p>
            <p className="mt-1">
              Cuando están deshabilitados, ningún usuario podrá cambiar las vistas de la cámara.
            </p>
          </div>
        </div>
      </div>

      {/* Contenido de la cámara */}
      <div className="max-w-4xl mx-auto p-6">
        <FullCameraStream params={params} />
      </div>
    </main>
  );
}
