import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import type { LoginHttpParams } from "../interfaces/http/LoginHttpParams";
import { login } from "../service/auth.service";
import { useAuthStore } from "../stores/authStore";

export function useLoginViewModel() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

    const handleLogin = useCallback(async () => {
        // Validação
        if (!username.trim()) {
            Alert.alert("Erro", "Por favor, informe o login.");
            return;
        }

        if (!password.trim()) {
            Alert.alert("Erro", "Por favor, informe a senha.");
            return;
        }

        setLoading(true);
        try {
            const loginData: LoginHttpParams = {
                user: username.trim(),
                password: password,
            };

            const token = await login(loginData);

            // Atualizar o store de autenticação
            setAuthenticated(token);

            // Navegar para a tela principal após login bem-sucedido
            router.replace("/(tabs)");
        } catch (error: any) {
            console.log("Login error:", error);

            // Pegar a mensagem de erro - pode vir do backend (error.response?.data?.message) ou ser uma mensagem genérica
            let errorMessage = "Credenciais inválidas. Por favor, tente novamente.";

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert("Erro ao fazer login", errorMessage);
        } finally {
            setLoading(false);
        }
    }, [username, password, setAuthenticated, router]);

    const toggleShowPassword = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    return {
        // State
        username,
        password,
        loading,
        showPassword,

        // Actions
        setUsername,
        setPassword,
        handleLogin,
        toggleShowPassword,
    };
}
