import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePresetStore = create(
  persist(
    (set, get) => ({
      // Estado: presets deshabilitados por defecto
      presetsDisabled: false,
      
      // Acciones
      togglePresets: () => set((state) => ({ 
        presetsDisabled: !state.presetsDisabled 
      })),
      
      enablePresets: () => set({ presetsDisabled: false }),
      
      disablePresets: () => set({ presetsDisabled: true }),
      
      // Getter para verificar si los presets están habilitados
      arePresetsEnabled: () => !get().presetsDisabled,
      
      // Función para verificar si el usuario es admin (Ricardo)
      isAdmin: (userId) => {
        // Ricardo tiene ID específico o podemos usar el pathname
        return userId === 'ricardo' || userId === 'admin';
      },
      
      // Función para verificar si los presets están habilitados para un usuario específico
      arePresetsEnabledForUser: (userId) => {
        const state = get();
        // Si es admin, siempre tiene acceso
        if (state.isAdmin(userId)) {
          return true;
        }
        // Para otros usuarios, respeta el estado global
        return !state.presetsDisabled;
      },
    }),
    {
      name: 'preset-store', // nombre para localStorage
      partialize: (state) => ({ presetsDisabled: state.presetsDisabled }), // solo persistir este campo
    }
  )
);

export default usePresetStore; 