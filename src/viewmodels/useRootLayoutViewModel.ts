import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { useAuthStore } from "../stores/authStore";

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export function useRootLayoutViewModel() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoading = useAuthStore((state) => state.isLoading);
    const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);
    const hasCheckedAuth = useRef(false);

    useEffect(() => {
        // Check authentication on mount only once
        if (!hasCheckedAuth.current) {
            hasCheckedAuth.current = true;
            checkAuthStatus();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Hide splash screen when authentication check is complete
        if (!isLoading) {
            SplashScreen.hideAsync();
        }
    }, [isLoading]);

    return {
        isAuthenticated,
        isLoading,
    };
}
