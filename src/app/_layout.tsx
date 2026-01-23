import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import Toast, { BaseToast } from "react-native-toast-message";
import { colors } from "../theme/colors";
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
            <PaperProvider>
                <BottomSheetModalProvider>
                    <Stack>
                    {/* Login route: accessible only when NOT authenticated */}
                    <Stack.Protected guard={!isAuthenticated}>
                        <Stack.Screen name="login" options={{ headerShown: false }} />
                    </Stack.Protected>

                    {/* Protected routes: accessible only when authenticated */}
                    <Stack.Protected guard={isAuthenticated}>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="categories" options={{ headerShown: false }} />
                        <Stack.Screen name="habits" options={{ headerShown: false }} />
                    </Stack.Protected>
                </Stack>
            </BottomSheetModalProvider>
            <Toast
                config={{
                    success: (props) => (
                        <BaseToast
                            {...props}
                            style={{ borderLeftColor: colors.toast.success }}
                        />
                    ),
                    info: (props) => (
                        <BaseToast
                            {...props}
                            style={{ borderLeftColor: colors.toast.info }}
                        />
                    ),
                    error: (props) => (
                        <BaseToast
                            {...props}
                            style={{ borderLeftColor: colors.toast.error }}
                        />
                    ),
                }}
            />
            </PaperProvider>
        </GestureHandlerRootView>
    );
}
