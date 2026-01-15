import { Todo } from "@/models/Todo";
import { planlyApiClient } from "../api/planly-api";

export const getTodosByDate = async (date: string): Promise<Todo[]> => {
    const { data } = await planlyApiClient.get<Todo[]>(`/todo/date?date=${date}`);
    return data || [];
};

export const updateTodoStatus = async (id: string, status: "done" | "pending" | "skipped"): Promise<Todo> => {
    const { data } = await planlyApiClient.post<Todo>(`/todo`, { id, status });
    return data;
};
