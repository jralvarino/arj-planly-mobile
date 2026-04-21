import { LoginHttpParams } from "@/interfaces/http/LoginHttpParams";
import { AuthResponse } from "@/interfaces/http/LoginHttpResponse";
import { arjAuthClient } from "../api/planly-api";
import { tokenStorage } from "./tokenStorage";

export const login = async (userData: LoginHttpParams): Promise<void> => {
    const { data } = await arjAuthClient.post<AuthResponse>("/auth/login", userData);

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
