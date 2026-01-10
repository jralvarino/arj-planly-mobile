import { useRouter } from "expo-router";
import { useCallback } from "react";
import { useAuthStore } from "../stores/authStore";

export function useHomeViewModel() {
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = useCallback(async () => {
        await logout();
        router.replace("/login");
    }, [logout, router]);

    return {
        handleLogout,
    };
}
