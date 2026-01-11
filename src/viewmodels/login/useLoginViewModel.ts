import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import type { LoginHttpParams } from "../../interfaces/http/LoginHttpParams";
import { login } from "../../service/auth.service";
import { useAuthStore } from "../../stores/authStore";

export function useLoginViewModel() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

    const handleLogin = useCallback(async () => {
        // Validation
        if (!username.trim()) {
            Alert.alert("Validation Error", "Please enter your username.");
            return;
        }

        if (!password.trim()) {
            Alert.alert("Validation Error", "Please enter your password.");
            return;
        }

        setLoading(true);
        try {
            const loginData: LoginHttpParams = {
                user: username.trim(),
                password: password,
            };

            await login(loginData);

            // Update authentication store
            setAuthenticated();

            // Navigate to main screen after successful login
            router.replace("/(tabs)");
        } catch (error: any) {
            console.log("Login error:", error);

            // Get error message - can come from backend (error.response?.data?.message) or be a generic message
            let errorMessage = "Invalid credentials. Please try again.";

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert("Login Error", errorMessage);
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
