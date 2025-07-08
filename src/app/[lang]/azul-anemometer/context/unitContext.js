import React, { createContext, useState, useContext } from 'react';

// 1. Crear el Contexto
const UnitContext = createContext();

// Lista de unidades disponibles
export const availableUnits = ['knots', 'beaufort', 'km/h', 'm/s'];

// 2. Crear el Proveedor del Contexto
export const UnitProvider = ({ children }) => {
  const [unit, setUnit] = useState(availableUnits[0]); // 'knots' por defecto

  const value = {
    unit,
    setUnit,
    availableUnits
  };

  return (
    <UnitContext.Provider value={value}>
      {children}
    </UnitContext.Provider>
  );
};

// 3. Crear un Hook personalizado para usar el contexto más fácilmente
export const useUnit = () => {
  const context = useContext(UnitContext);
  if (context === undefined) {
    throw new Error('useUnit debe ser usado dentro de un UnitProvider');
  }
  return context;
}; 