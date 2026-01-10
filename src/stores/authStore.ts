import { create } from "zustand";
import { isAuthenticated as checkAuth, logout as logoutService } from "../service/auth.service";

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    token: string | null;
    hasChecked: boolean;
    checkAuthStatus: () => Promise<void>;
    setAuthenticated: (token: string) => void;
    setUnauthenticated: () => void;
    logout: () => Promise<void>;
}

// Variável para controlar chamadas simultâneas
let checkingPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
    isAuthenticated: false,
    isLoading: true,
    token: null,
    hasChecked: false,

    checkAuthStatus: async () => {
        const currentState = get();
        // Se já foi verificado, não verificar novamente
        if (currentState.hasChecked) {
            return;
        }

        // Se já está verificando, retornar a mesma promise
        if (checkingPromise) {
            return checkingPromise;
        }

        // Criar uma nova promise para verificação
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

    setAuthenticated: (token: string) => {
        set({
            isAuthenticated: true,
            token,
            isLoading: false,
            hasChecked: true,
        });
    },

    setUnauthenticated: () => {
        set({
            isAuthenticated: false,
            token: null,
            isLoading: false,
            hasChecked: true,
        });
    },

    logout: async () => {
        try {
            await logoutService();
            set({
                isAuthenticated: false,
                token: null,
                isLoading: false,
                hasChecked: false,
            });
        } catch (error) {
            console.error("Error during logout:", error);
            // Ainda assim, limpar o estado local
            set({
                isAuthenticated: false,
                token: null,
                isLoading: false,
                hasChecked: false,
            });
        }
    },
}));
