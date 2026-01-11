import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { Platform } from "react-native";
import { tokenStorage } from "../service/tokenStorage";

const getBaseURL = () => {
    return Platform.select({
        android: "https://hb8tb78tic.execute-api.us-east-1.amazonaws.com/prod",
        ios: "http://localhost:3000",
    });
};

export const baseURL = getBaseURL();

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
