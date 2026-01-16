import { Todo, TodoStatus } from "@/models/Todo";
import { planlyApiClient } from "../api/planly-api";

export const getTodosByDate = async (date: string): Promise<Todo[]> => {
    const { data } = await planlyApiClient.get<Todo[]>(`/todo/date?date=${date}`);
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
