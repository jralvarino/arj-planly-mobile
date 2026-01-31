import { create } from "zustand";
import { getGlobalStreak } from "../service/stats.service";

interface StreakState {
    globalStreak: string;
    fetchGlobalStreak: () => Promise<void>;
}

export const useStreakStore = create<StreakState>((set) => ({
    globalStreak: "0 days",

    fetchGlobalStreak: async () => {
        try {
            const value = await getGlobalStreak();
            set({ globalStreak: value });
        } catch (err) {
            console.error("Error fetching global streak:", err);
            set({ globalStreak: "0 days" });
        }
    },
}));
