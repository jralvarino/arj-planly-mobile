import { useCallback, useEffect, useState } from "react";
import { Category } from "../../models/Category";
import { Todo } from "../../models/Todo";
import { getAllCategories } from "../../service/category.service";
import { getTodosByDate, updateTodoStatus } from "../../service/todo.service";
import { useAuthStore } from "../../stores/authStore";

const getTodayDate = (): string => {
    return new Date().toISOString().split("T")[0];
};

export function useTodoViewModel() {
    const logout = useAuthStore((state) => state.logout);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const handleLogout = useCallback(() => {
        logout();
    }, [logout]);

    const fetchTodos = useCallback(async (date: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await getTodosByDate(date);
            setTodos(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch todos");
            setTodos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        const today = getTodayDate();
        try {
            setError(null);
            const data = await getTodosByDate(today);
            setTodos(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch todos");
        } finally {
            setRefreshing(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    }, []);

    const handleFocus = useCallback(() => {
        const today = getTodayDate();
        fetchTodos(today);
        fetchCategories();
    }, [fetchTodos, fetchCategories]);

    const handleToggleTodo = useCallback(
        async (todoId: string, currentStatus: "done" | "pending" | "skipped") => {
            try {
                const newStatus = currentStatus === "done" ? "pending" : "done";
                await updateTodoStatus(todoId, newStatus);
                // Atualiza a lista após a mudança
                const today = getTodayDate();
                await fetchTodos(today);
            } catch (err) {
                console.error("Error toggling todo:", err);
            }
        },
        [fetchTodos]
    );

    useEffect(() => {
        const today = getTodayDate();
        fetchTodos(today);
        fetchCategories();
    }, [fetchTodos, fetchCategories]);

    return {
        handleLogout,
        todos,
        categories,
        loading,
        error,
        refreshing,
        handleRefresh,
        handleFocus,
        handleToggleTodo,
    };
}
