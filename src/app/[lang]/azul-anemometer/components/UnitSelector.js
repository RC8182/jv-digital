import React from 'react';
import { useUnit } from '../context/unitContext';

const UnitSelector = () => {
  const { unit, setUnit, availableUnits } = useUnit();

  return (
    <div className="flex justify-center items-center gap-2 my-2">
      {availableUnits.map((unitName) => (
        <React.Fragment key={unitName}>
          <button
            onClick={() => setUnit(unitName)}
            className={`
              text-xs px-3 py-1 rounded-md transition-colors duration-200
              ${unit === unitName 
                ? 'bg-blue-500 text-white font-bold shadow-md' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }
            `}
          >
            {unitName}
          </button>
          {availableUnits.indexOf(unitName) < availableUnits.length - 1 && (
            <span className="text-gray-500">|</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default UnitSelector; 