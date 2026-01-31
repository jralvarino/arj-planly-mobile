import { planlyApiClient } from "../api/planly-api";

export interface GlobalStreakResponse {
    body?: { currentStreak?: number };
    currentStreak?: number;
}

export const getGlobalStreak = async (): Promise<string> => {
    const { data } = await planlyApiClient.get<GlobalStreakResponse>("/stats/globalStreak");
    const num = data?.body?.currentStreak ?? data?.currentStreak ?? 0;
    const value = typeof num === "number" ? num : parseInt(String(num), 10) || 0;
    return value === 1 ? "1 day" : `${value} days`;
};
