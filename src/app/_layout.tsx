import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SplashScreen } from "../components/SplashScreen";
import { useRootLayoutViewModel } from "../viewmodels/useRootLayoutViewModel";

export default function RootLayout() {
    const { isAuthenticated, isLoading } = useRootLayoutViewModel();

    // Show splash screen while checking authentication
    if (isLoading) {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <SplashScreen />
            </GestureHandlerRootView>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack>
                {/* Login route: accessible only when NOT authenticated */}
                <Stack.Protected guard={!isAuthenticated}>
                    <Stack.Screen name="login" options={{ headerShown: false }} />
                </Stack.Protected>

                {/* Protected routes: accessible only when authenticated */}
                <Stack.Protected guard={isAuthenticated}>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack.Protected>
            </Stack>
        </GestureHandlerRootView>
    );
}
