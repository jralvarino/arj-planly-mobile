import { planlyApiClient } from "../api/planly-api";

export interface GlobalStreakResponse {
    body?: { currentStreak?: number };
    currentStreak?: number;
}

export interface HabitForSelectedDate {
    id: string;
    title: string;
    color: string;
    emoji: string;
    unit: string;
    targetValue: string;
    categoryId: string;
    period: string;
    active: boolean;
    status?: string;
    progressValue?: string;
    notes?: string;
    updatedAt?: string;
}

export interface DashboardResponse {
    completedDates: string[];
    globalStreak: number;
    globalLongestStreak: number;
    globalTotalCompletions: number;
    lastCompletedDate?: string;
    monthCompletionCount: number;
    monthCompletionRate: number;
    daysInMonth: number;
    habitsForSelectedDate?: HabitForSelectedDate[];
    categoryStreak?: number;
    categoryLongestStreak?: number;
    categoryTotalCompletions?: number;
}

export const getGlobalStreak = async (): Promise<string> => {
    const { data } = await planlyApiClient.get<GlobalStreakResponse>("/stats/globalStreak");
    const num = data?.body?.currentStreak ?? data?.currentStreak ?? 0;
    const value = typeof num === "number" ? num : parseInt(String(num), 10) || 0;
    return value === 1 ? "1 day" : `${value} days`;
};

export interface GetDashboardParams {
    month: string;
    categoryId?: string;
    selectedDate?: string;
}

export const getDashboard = async (
    params: GetDashboardParams,
    signal?: AbortSignal
): Promise<DashboardResponse> => {
    const { month, categoryId, selectedDate } = params;
    const searchParams = new URLSearchParams({ month });
    if (categoryId) searchParams.set("categoryId", categoryId);
    if (selectedDate) searchParams.set("selectedDate", selectedDate);

    const { data } = await planlyApiClient.get<DashboardResponse>(
        `/stats/dashboard?${searchParams.toString()}`,
        { signal }
    );

    if (!data) {
        return {
            completedDates: [],
            globalStreak: 0,
            globalLongestStreak: 0,
            globalTotalCompletions: 0,
            monthCompletionCount: 0,
            monthCompletionRate: 0,
            daysInMonth: 0,
        };
    }

    return {
        ...data,
        completedDates: data.completedDates ?? [],
        globalStreak: data.globalStreak ?? 0,
        globalLongestStreak: data.globalLongestStreak ?? 0,
        globalTotalCompletions: data.globalTotalCompletions ?? 0,
        monthCompletionCount: data.monthCompletionCount ?? 0,
        monthCompletionRate: data.monthCompletionRate ?? 0,
        daysInMonth: data.daysInMonth ?? 0,
    };
};
