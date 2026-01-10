import { create } from "zustand";
import { isAuthenticated as checkAuth, logout as logoutService } from "../service/auth.service";

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    hasChecked: boolean;
    checkAuthStatus: () => Promise<void>;
    setAuthenticated: () => void;
    logout: () => Promise<void>;
}

// Variable to control concurrent calls
let checkingPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
    isAuthenticated: false,
    isLoading: true,
    hasChecked: false,

    checkAuthStatus: async () => {
        const currentState = get();
        // If already checked, don't check again
        if (currentState.hasChecked) {
            return;
        }

        // If already checking, return the same promise
        if (checkingPromise) {
            return checkingPromise;
        }

        // Create a new promise for verification
        checkingPromise = (async () => {
            set({ isLoading: true });

            try {
                const authenticated = await checkAuth();
                set({
                    isAuthenticated: authenticated,
                    isLoading: false,
                    hasChecked: true,
                });
            } catch (error) {
                console.error("Error checking auth status:", error);
                set({
                    isAuthenticated: false,
                    isLoading: false,
                    hasChecked: true,
                });
            } finally {
                checkingPromise = null;
            }
        })();

        return checkingPromise;
    },

    setAuthenticated: () => {
        set({
            isAuthenticated: true,
            isLoading: false,
            hasChecked: true,
        });
    },

    logout: async () => {
        try {
            await logoutService();
            set({
                isAuthenticated: false,
                isLoading: false,
                hasChecked: false,
            });
        } catch (error) {
            console.error("Error during logout:", error);
            // Still clear local state
            set({
                isAuthenticated: false,
                isLoading: false,
                hasChecked: false,
            });
        }
    },
}));
