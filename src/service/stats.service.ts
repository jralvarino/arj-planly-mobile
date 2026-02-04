import { planlyApiClient } from "../api/planly-api";

export interface GlobalStreakResponse {
    body?: { currentStreak?: number };
    currentStreak?: number;
}

export interface HabitForSelectedDate {
    id: string;
    title: string;
    emoji: string;
    categoryId: string;
    status?: string;
    completedAt?: string;
    color?: string;
    unit?: string;
    targetValue?: string;
    period?: string;
    active?: boolean;
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
    monthTotalCompletions?: number;
    monthDailyAverage?: number;
    monthBestStreak?: number;
    daysInMonth: number;
    habitsForSelectedDate?: HabitForSelectedDate[];
    categoryStreak?: number;
    categoryLongestStreak?: number;
    categoryTotalCompletions?: number;
    categoryMonthTotalCompletions?: number;
    categoryMonthDailyAverage?: number;
    categoryMonthBestStreak?: number;
    habitStreak?: number;
    habitMonthTotalCompletions?: number;
    habitMonthDailyAverage?: number;
    habitMonthBestStreak?: number;
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
    habitId?: string;
    selectedDate?: string;
}

export const getDashboard = async (params: GetDashboardParams, signal?: AbortSignal): Promise<DashboardResponse> => {
    const { month, categoryId, habitId, selectedDate } = params;
    const searchParams = new URLSearchParams({ month });
    if (categoryId) searchParams.set("categoryId", categoryId);
    if (habitId) searchParams.set("habitId", habitId);
    if (selectedDate) searchParams.set("selectedDate", selectedDate);

    const { data } = await planlyApiClient.get<DashboardResponse>(`/stats/dashboard?${searchParams.toString()}`, {
        signal,
    });

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
        monthTotalCompletions: data.monthTotalCompletions,
        monthDailyAverage: data.monthDailyAverage,
        monthBestStreak: data.monthBestStreak,
        categoryMonthTotalCompletions: data.categoryMonthTotalCompletions,
        categoryMonthDailyAverage: data.categoryMonthDailyAverage,
        categoryMonthBestStreak: data.categoryMonthBestStreak,
        habitStreak: data.habitStreak,
        habitMonthTotalCompletions: data.habitMonthTotalCompletions,
        habitMonthDailyAverage: data.habitMonthDailyAverage,
        habitMonthBestStreak: data.habitMonthBestStreak,
        daysInMonth: data.daysInMonth ?? 0,
    };
};
