import { Redirect, Stack, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { checkAndScheduleNotifications } from "../service/notificationService";
import { getAllTasks } from "../service/taskService";
import { useAuthStore } from "../stores/authStore";
import { colors } from "../theme/colors";

export default function RootLayout() {
    const segments = useSegments();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoading = useAuthStore((state) => state.isLoading);
    const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);
    const hasCheckedAuth = useRef(false);

    useEffect(() => {
        // Verificar autenticação ao iniciar apenas uma vez
        if (!hasCheckedAuth.current) {
            hasCheckedAuth.current = true;
            checkAuthStatus();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Verificar e agendar notificações quando o app inicia (apenas se autenticado)
        if (isAuthenticated) {
            const scheduleNotifications = async () => {
                try {
                    const habits = await getAllTasks();
                    await checkAndScheduleNotifications(habits);
                } catch (error) {
                    console.error("Error scheduling notifications:", error);
                }
            };

            scheduleNotifications();

            // Verificar novamente a cada minuto (para garantir que notificações sejam agendadas)
            const interval = setInterval(() => {
                scheduleNotifications();
            }, 60000); // 1 minuto

            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    // Mostrar loading enquanto verifica autenticação
    if (isLoading) {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: colors.background,
                    }}
                >
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </GestureHandlerRootView>
        );
    }

    // Se não está autenticado e não está na tela de login, redirecionar
    const isLoginRoute = segments.length > 0 && segments[segments.length - 1] === "login";
    if (!isAuthenticated && !isLoginRoute) {
        return <Redirect href="/login" />;
    }

    // Se está autenticado e está na tela de login, redirecionar para tabs
    if (isAuthenticated && isLoginRoute) {
        return <Redirect href="/(tabs)" />;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack>
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="habit/[id]" options={{ headerTitle: "Editar Hábito" }} />
                <Stack.Screen name="categories/new" options={{ headerTitle: "Nova Categoria" }} />
                <Stack.Screen name="categories/[id]" options={{ headerTitle: "Editar Categoria" }} />
            </Stack>
        </GestureHandlerRootView>
    );
}
