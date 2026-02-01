import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { getAllHabits } from "../service/habit.service";
import {
    requestNotificationPermissions,
    syncHabitReminders,
} from "../service/notification.service";
import { useAuthStore } from "../stores/authStore";

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

// iOS: Show notifications when app is in foreground
if (Platform.OS === "ios") {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
}

export function useRootLayoutViewModel() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoading = useAuthStore((state) => state.isLoading);
    const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);
    const hasCheckedAuth = useRef(false);
    const hasSyncedNotifications = useRef(false);

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

    useEffect(() => {
        if (!isAuthenticated) {
            hasSyncedNotifications.current = false;
        }
    }, [isAuthenticated]);

    // iOS: Request permissions and sync habit reminders when authenticated
    useEffect(() => {
        if (Platform.OS !== "ios" || !isAuthenticated || hasSyncedNotifications.current) return;

        hasSyncedNotifications.current = true;

        const setupNotifications = async () => {
            const granted = await requestNotificationPermissions();
            if (!granted) return;

            try {
                const habits = await getAllHabits();
                await syncHabitReminders(habits);
            } catch (err) {
                console.error("Error syncing habit reminders:", err);
            }
        };

        setupNotifications();
    }, [isAuthenticated]);

    return {
        isAuthenticated,
        isLoading,
    };
}
