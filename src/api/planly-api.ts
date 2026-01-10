import axios, { AxiosInstance } from "axios";
import { Platform } from "react-native";

const getBaseURL = () => {
    return Platform.select({
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
    }

    getInstance() {
        return this.instance;
    }
}

export const planlyApiClient = new PlanlyApiClient().getInstance();
