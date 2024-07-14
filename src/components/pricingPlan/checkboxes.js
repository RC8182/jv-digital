'use client';
import useStore from '@/store/planesStore';
import React from 'react';

const Checkboxes = ({ planIndex }) => {
  const { plans, toggleReserves, togglePlus } = useStore((state) => ({
    plans: state.plans,
    toggleReserves: state.toggleReserves,
    togglePlus: state.togglePlus,
  }));

  const plan = plans[planIndex];

  const handleToggleOption = (option) => {
    if (option === 'reserves') {
      toggleReserves(planIndex);
    } else if (option === 'plus') {
      togglePlus(planIndex);
    }
  };

  return (
    <div className="mb-8 flex flex-col">
      <label className="flex items-center my-2 cursor-pointer">
        <input
          type="checkbox"
          checked={plan.reserves}
          onChange={() => handleToggleOption('reserves')}
          className="peer hidden"
        />
        <span className={`w-4 h-4 border-2 rounded-full ${plan.reserves ? 'bg-gpt_blue border-gpt_blue' : 'border-white'} peer-checked:bg-gpt_blue`}></span>
        <span className="ml-2 text-gray-400">Servicio de Reservas</span>
      </label>
      <label className="flex items-center my-2 cursor-pointer">
        <input
          type="checkbox"
          checked={plan.plus}
          onChange={() => handleToggleOption('plus')}
          className="peer hidden"
        />
        <span className={`w-4 h-4 border-2 rounded-full ${plan.plus ? 'bg-gpt_blue border-gpt_blue' : 'border-white'} peer-checked:bg-gpt_blue`}></span>
        <span className="ml-2 text-gray-400">Plan Plus</span>
      </label>
    </div>
  );
};

export default Checkboxes;
