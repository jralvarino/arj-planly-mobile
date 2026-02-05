import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import type { Category } from "../../models/Category";
import { Habit } from "../../models/Habit";
import { getAllCategories } from "../../service/category.service";
import { deleteHabit, getAllHabits, updateHabit } from "../../service/habit.service";
import { cancelHabitReminders, scheduleHabitReminders } from "../../service/notification.service";
import { useHomeStore } from "../../stores/homeStore";
import { useStreakStore } from "../../stores/streakStore";

export type FilterType = "all" | "active" | "inactive";

export function useHabitsViewModel() {
    const router = useRouter();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>("active");
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

    const fetchHabits = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllHabits();
            setHabits(data);
        } catch (error) {
            console.error("Error fetching habits:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to load habits. Please try again.",
            });
        } finally {
            setLoading(false);
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

    const handleCategorySelect = useCallback((categoryId: string | null) => {
        setSelectedCategoryId(categoryId);
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useFocusEffect(
        useCallback(() => {
            fetchHabits();
        }, [fetchHabits])
    );

    const handleHabitPress = useCallback(
        (habitId: string) => {
            router.push(`/habits/${habitId}`);
        },
        [router]
    );

    const handleEdit = useCallback(
        (habit: Habit) => {
            router.push(`/habits/${habit.id}`);
        },
        [router]
    );

    const handleDelete = useCallback((habit: Habit) => {
        setHabitToDelete(habit);
        setDeleteDialogVisible(true);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!habitToDelete) return;

        setDeleteDialogVisible(false);
        try {
            await cancelHabitReminders(habitToDelete.id);
            await deleteHabit(habitToDelete.id);
            await fetchHabits();
            setHabitToDelete(null);
            useStreakStore.getState().fetchGlobalStreak();
            useHomeStore.getState().invalidateSummary();
        } catch (error) {
            console.error("Error deleting habit:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to delete habit. Please try again.",
            });
        }
    }, [habitToDelete, fetchHabits]);

    const cancelDelete = useCallback(() => {
        setDeleteDialogVisible(false);
        setHabitToDelete(null);
    }, []);

    const handleDisable = useCallback(
        async (habit: Habit) => {
            try {
                const newActiveStatus = !habit.active;
                const updateData: Partial<Habit> = { active: newActiveStatus };

                // Se está sendo desativado, define end_date como hoje
                if (!newActiveStatus) {
                    const today = new Date().toISOString().split("T")[0];
                    updateData.end_date = today;
                } else {
                    // Se está sendo reativado, remove o end_date
                    updateData.end_date = undefined;
                }

                const updatedHabit = await updateHabit(habit.id, updateData);
                await cancelHabitReminders(habit.id);
                if (newActiveStatus && updatedHabit.reminder_enabled) {
                    await scheduleHabitReminders(updatedHabit);
                }
                await fetchHabits();
                useStreakStore.getState().fetchGlobalStreak();
                useHomeStore.getState().invalidateSummary();
            } catch (error) {
                console.error("Error updating habit:", error);
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Failed to update habit. Please try again.",
                });
            }
        },
        [fetchHabits]
    );

    const filteredHabits = habits.filter((habit) => {
        if (filter === "active") return habit.active;
        if (filter === "inactive") return !habit.active;
        return true;
    });

    const habitsByCategory =
        selectedCategoryId == null
            ? filteredHabits
            : filteredHabits.filter((habit) => habit.categoryId === selectedCategoryId);

    return {
        // State
        habits: habitsByCategory,
        categories,
        selectedCategoryId,
        loading,
        filter,
        deleteDialogVisible,
        habitToDelete,

        // Actions
        setFilter,
        handleCategorySelect,
        handleHabitPress,
        handleEdit,
        handleDelete,
        handleDisable,
        confirmDelete,
        cancelDelete,
    };
}
