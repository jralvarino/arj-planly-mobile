import { Todo, TodoStatus } from "@/models/Todo";
import { planlyApiClient } from "../api/planly-api";
import { WeekSummary } from "../interfaces/todo/summary.interface";

export const getTodosByDate = async (date: string): Promise<Todo[]> => {
    const { data } = await planlyApiClient.get<Todo[]>(`/todo/date?date=${date}`);
    return data || [];
};

export const getTodoSummary = async (
    startDate: string,
    endDate: string,
    signal?: AbortSignal
): Promise<WeekSummary> => {
    const { data } = await planlyApiClient.get<WeekSummary>(
        `/todo/summary?startDate=${startDate}&endDate=${endDate}`,
        { signal }
    );
    return data || [];
};

export const updateTodoStatus = async (
    habitId: string,
    date: string,
    status: TodoStatus,
    progressValue: string
): Promise<Todo> => {
    const { data } = await planlyApiClient.patch<Todo>(`/todo/${habitId}`, {
        date,
        status,
        progressValue,
    });
    return data;
};

export const updateTodoNotes = async (
    habitId: string,
    date: string,
    notes: string
): Promise<Todo> => {
    const { data } = await planlyApiClient.patch<Todo>(`/todo/${habitId}/notes`, {
        date,
        notes,
    });
    return data;
};
