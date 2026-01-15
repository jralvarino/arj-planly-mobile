import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Alert } from "react-native";
import { Habit } from "../../models/Habit";
import { deleteHabit, getAllHabits, updateHabit } from "../../service/habit.service";
import Swipeable, { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";

export type FilterType = "all" | "active" | "inactive";

export function useHabitsViewModel() {
    const router = useRouter();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>("active");
    const swipeableRefs = useRef<{ [id: string]: SwipeableMethods | null }>({});

    const fetchHabits = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllHabits();
            setHabits(data);
        } catch (error) {
            console.error("Error fetching habits:", error);
            Alert.alert("Error", "Failed to load habits. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

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
            swipeableRefs.current[habit.id]?.close();
            router.push(`/habits/${habit.id}`);
        },
        [router]
    );

    const handleDelete = useCallback(
        async (habit: Habit) => {
            swipeableRefs.current[habit.id]?.close();
            Alert.alert("Delete Habit", `Are you sure you want to delete "${habit.title}"?`, [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteHabit(habit.id);
                            await fetchHabits();
                        } catch (error) {
                            console.error("Error deleting habit:", error);
                            Alert.alert("Error", "Failed to delete habit. Please try again.");
                        }
                    },
                },
            ]);
        },
        [fetchHabits]
    );

    const handleDisable = useCallback(
        async (habit: Habit) => {
            swipeableRefs.current[habit.id]?.close();
            try {
                await updateHabit(habit.id, { active: !habit.active });
                await fetchHabits();
            } catch (error) {
                console.error("Error updating habit:", error);
                Alert.alert("Error", "Failed to update habit. Please try again.");
            }
        },
        [fetchHabits]
    );

    const filteredHabits = habits.filter((habit) => {
        if (filter === "active") return habit.active;
        if (filter === "inactive") return !habit.active;
        return true;
    });

    return {
        // State
        habits: filteredHabits,
        loading,
        filter,
        swipeableRefs,

        // Actions
        setFilter,
        handleHabitPress,
        handleEdit,
        handleDelete,
        handleDisable,
    };
}
