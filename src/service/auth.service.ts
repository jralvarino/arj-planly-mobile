import { LoginHttpParams } from "@/interfaces/http/LoginHttpParams";
import { AuthResponse } from "@/interfaces/http/LoginHttpResponse";
import CryptoJS from "crypto-js";
import { planlyApiClient } from "../api/planly-api";
import { tokenStorage } from "./tokenStorage";

const hashPassword = (password: string): string => {
    return CryptoJS.SHA256(password).toString();
};

export const login = async (userData: LoginHttpParams): Promise<void> => {
    userData.password = hashPassword(userData.password);

    const { data } = await planlyApiClient.post<AuthResponse>("/auth/login", userData);

    if (!data.token) {
        throw new Error("Token not found in response");
    }

    await tokenStorage.saveToken(data.token);
};

export const logout = async (): Promise<void> => {
    await tokenStorage.removeToken();
};

export const isAuthenticated = async (): Promise<boolean> => {
    const token = await tokenStorage.getToken();
    return token !== null;
};
