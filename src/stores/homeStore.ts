import { create } from "zustand";

interface HomeState {
    summaryRefreshTrigger: number;
    invalidateSummary: () => void;
}

export const useHomeStore = create<HomeState>((set) => ({
    summaryRefreshTrigger: 0,

    invalidateSummary: () => {
        set((state) => ({ summaryRefreshTrigger: state.summaryRefreshTrigger + 1 }));
    },
}));
