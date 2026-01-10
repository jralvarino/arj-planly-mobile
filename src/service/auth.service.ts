import { LoginHttpParams } from "@/interfaces/http/LoginHttpParams";
import { AuthResponse } from "@/interfaces/http/LoginHttpResponse";
import CryptoJS from "crypto-js";
import { planlyApiClient } from "../api/planly-api";
import { tokenStorage } from "./tokenStorage";

const API_BASE_URL = "http://localhost:3000";

const hashPassword = (password: string): string => {
    return CryptoJS.SHA256(password).toString();
};

export const login = async (userData: LoginHttpParams): Promise<string> => {
    userData.password = hashPassword(userData.password);

    const { data } = await planlyApiClient.post<AuthResponse>("/auth/login", userData);

    if (!data.token) {
        throw new Error("Token not found in response");
    }

    // Salvar o token
    await tokenStorage.saveToken(data.token);

    return data.token;
};

// Fazer logout
export const logout = async (): Promise<void> => {
    await tokenStorage.removeToken();
};

// Verificar se está autenticado
export const isAuthenticated = async (): Promise<boolean> => {
    const token = await tokenStorage.getToken();
    return token !== null;
};

// Obter token atual
export const getAuthToken = async (): Promise<string | null> => {
    return await tokenStorage.getToken();
};
