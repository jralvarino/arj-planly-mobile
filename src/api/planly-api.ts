import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { Platform } from "react-native";
import { tokenStorage } from "../service/tokenStorage";

const getPlanlyBaseURL = () => {
    return Platform.select({
        ios: "https://1trlwwn164.execute-api.us-east-1.amazonaws.com/prod",
        android: "http://localhost:3000",
    });
};

const ARJ_AUTH_BASE_URL =
    process.env.EXPO_PUBLIC_ARJ_AUTH_URL ?? "https://bhn6vxh1s0.execute-api.us-east-1.amazonaws.com/prod";

export const baseURL = getPlanlyBaseURL();

export class PlanlyApiClient {
    private instance: AxiosInstance;

    constructor() {
        this.instance = axios.create({
            baseURL,
        });

        this.instance.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                const token = await tokenStorage.getToken();

                config.headers = config.headers ?? {};

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                config.headers["Content-Type"] = "application/json";

                return config;
            },
            (error) => Promise.reject(error)
        );
    }

    getInstance() {
        return this.instance;
    }
}

export const planlyApiClient = new PlanlyApiClient().getInstance();

export const arjAuthClient = axios.create({
    baseURL: ARJ_AUTH_BASE_URL,
    headers: { "Content-Type": "application/json" },
});
