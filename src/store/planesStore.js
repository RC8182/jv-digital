import { create } from 'zustand';

const useStore = create((set) => ({
  plans: [],
  setPlans: (plans) => set({ plans }),
  toggleReserves: (index) =>
    set((state) => ({
      plans: state.plans.map((plan, i) =>
        i === index ? { ...plan, reserves: !plan.reserves } : plan
      ),
    })),
  togglePlus: (index) =>
    set((state) => ({
      plans: state.plans.map((plan, i) =>
        i === index ? { ...plan, plus: !plan.plus } : plan
      ),
    })),
}));

export default useStore;