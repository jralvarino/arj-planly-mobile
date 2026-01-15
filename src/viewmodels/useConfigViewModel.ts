import { useCallback } from "react";
import { useAuthStore } from "../stores/authStore";

export function useConfigViewModel() {
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = useCallback(() => {
        logout();
    }, [logout]);

    return {
        handleLogout,
    };
}
