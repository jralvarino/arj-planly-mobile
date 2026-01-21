import { Todo, TodoStatus } from "@/models/Todo";
import { planlyApiClient } from "../api/planly-api";
import { WeekSummary } from "../interfaces/todo/summary.interface";

export const getTodosByDate = async (date: string): Promise<Todo[]> => {
    const { data } = await planlyApiClient.get<Todo[]>(`/todo/date?date=${date}`);
    return data || [];
};

export const getTodoSummary = async (startDate: string, endDate: string): Promise<WeekSummary> => {
    const { data } = await planlyApiClient.get<WeekSummary>(
        `/todo/summary?startDate=${startDate}&endDate=${endDate}`
    );
    return data || [];
};

export const updateTodoStatus = async (
    habitId: string,
    date: string,
    status: TodoStatus,
    progressValue: string,
    notes: string
): Promise<Todo> => {
    const { data } = await planlyApiClient.patch<Todo>(`/todo/${habitId}`, {
        date,
        status,
        progressValue,
        notes,
    });
    return data;
};
