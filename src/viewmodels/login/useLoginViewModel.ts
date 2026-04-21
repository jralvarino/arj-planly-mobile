import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import type { LoginHttpParams } from "../../interfaces/http/LoginHttpParams";
import { login } from "../../service/auth.service";
import { useAuthStore } from "../../stores/authStore";

export function useLoginViewModel() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

    const handleLogin = useCallback(async () => {
        if (!email.trim()) {
            Toast.show({
                type: "error",
                text1: "Validation Error",
                text2: "Please enter your email.",
            });
            return;
        }

        if (!password.trim()) {
            Toast.show({
                type: "error",
                text1: "Validation Error",
                text2: "Please enter your password.",
            });
            return;
        }

        setLoading(true);
        try {
            const loginData: LoginHttpParams = {
                email: email.trim(),
                password: password,
            };

            await login(loginData);

            setAuthenticated();

            router.replace("/(tabs)");
        } catch (error: any) {
            console.log("Login error:", error);

            let errorMessage = "Invalid credentials. Please try again.";

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            Toast.show({
                type: "error",
                text1: "Login Error",
                text2: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    }, [email, password, setAuthenticated, router]);

    const toggleShowPassword = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    return {
        email,
        password,
        loading,
        showPassword,
        setEmail,
        setPassword,
        handleLogin,
        toggleShowPassword,
    };
}
