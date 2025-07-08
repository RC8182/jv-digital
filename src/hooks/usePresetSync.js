import { useEffect, useState } from 'react';
import usePresetStore from '@/store/presetStore';

export const usePresetSync = () => {
  const [syncStatus, setSyncStatus] = useState("idle"); // idle, syncing, success, error
  const { presetsDisabled, enablePresets, disablePresets } = usePresetStore();

  // Sincronizar con el servidor
  const syncWithServer = async () => {
    setSyncStatus("syncing");
    try {
      const response = await fetch('/api/azul-cam/preset-control');
      if (response.ok) {
        const { presetsDisabled: serverState } = await response.json();
        
        // Si el estado del servidor es diferente al local, actualizar
        if (serverState !== presetsDisabled) {
          if (serverState) {
            disablePresets();
          } else {
            enablePresets();
          }
        }
        setSyncStatus("success");
      } else {
        setSyncStatus("error");
      }
    } catch (error) {
      console.error('Error sincronizando con servidor:', error);
      setSyncStatus("error");
    }
  };

  // Actualizar estado en el servidor
  const updateServerState = async (newState) => {
    try {
      const response = await fetch('/api/azul-cam/preset-control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ presetsDisabled: newState }),
      });

      if (response.ok) {
        setSyncStatus("success");
        return true;
      } else {
        setSyncStatus("error");
        return false;
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      setSyncStatus("error");
      return false;
    }
  };

  // Sincronizar al montar el componente
  useEffect(() => {
    syncWithServer();
  }, []);

  return {
    syncStatus,
    syncWithServer,
    updateServerState,
  };
}; 