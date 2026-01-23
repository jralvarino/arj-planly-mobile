import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import moment from "moment";
import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import { Category } from "../../models/Category";
import { getAllCategories } from "../../service/category.service";
import { createHabit, getHabitById, updateHabit } from "../../service/habit.service";

export function useHabitFormViewModel() {
    const router = useRouter();
    const params = useLocalSearchParams<{ id?: string }>();
    const isEditMode = !!params.id;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("#59008c");
    const [emoji, setEmoji] = useState("");
    const [unit, setUnit] = useState<"count" | "pg" | "km" | "ml">("count");
    const [value, setValue] = useState("1");
    const [periodType, setPeriodType] = useState<"every_day" | "specific_days_week" | "specific_days_month">(
        "every_day"
    );
    const [periodValue, setPeriodValue] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [period, setPeriod] = useState<"Anytime" | "Morning" | "Afternoon" | "Evening">("Anytime");
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState("09:00");
    const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState("");
    const [active, setActive] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    // Load categories on focus
    const fetchCategories = useCallback(async () => {
        setCategoriesLoading(true);
        try {
            const data = await getAllCategories();
            setCategories(data);
            if (data.length > 0) {
                setCategoryId((prev) => prev || data[0].id);
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
        } finally {
            setCategoriesLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchCategories();
        }, [fetchCategories])
    );

    // Reset form when creating new habit (not in edit mode)
    const resetForm = useCallback(() => {
        setTitle("");
        setDescription("");
        setColor("#59008c");
        setEmoji("");
        setUnit("count");
        setValue("1");
        setPeriodType("every_day");
        setPeriodValue("");
        setPeriod("Anytime");
        setReminderEnabled(false);
        setReminderTime("09:00");
        setStartDate(moment().format("YYYY-MM-DD"));
        setEndDate("");
        setActive(true);
    }, []);

    // Load habit data if editing, reset if creating new
    useFocusEffect(
        useCallback(() => {
            if (isEditMode && params.id) {
                loadHabit(params.id);
            } else {
                // Reset form when creating a new habit
                resetForm();
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isEditMode, params.id])
    );

    const loadHabit = useCallback(
        async (habitId: string) => {
            setInitialLoading(true);
            try {
                const habit = await getHabitById(habitId);
                setTitle(habit.title);
                setDescription(habit.description || "");
                setColor(habit.color);
                setEmoji(habit.emoji);
                setUnit(habit.unit);
                setValue(habit.value);
                setPeriodType(habit.period_type);
                setPeriodValue(habit.period_value || "");
                setCategoryId(habit.categoryId);
                setPeriod(habit.period);
                setReminderEnabled(habit.reminder_enabled);
                setReminderTime(habit.reminder_time || "");
                setStartDate(habit.start_date);
                setEndDate(habit.end_date || "");
                setActive(habit.active);
            } catch (err: any) {
                console.error("Error loading habit:", err);
                let errorMessage = "Failed to load habit. Please try again.";

                if (err.response?.data?.message) {
                    errorMessage = err.response.data.message;
                } else if (err.message) {
                    errorMessage = err.message;
                }

                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: errorMessage,
                });
                router.back();
            } finally {
                setInitialLoading(false);
            }
        },
        [router]
    );

    // Ao marcar como inativo: define end_date como hoje apenas se o usuário não informou.
    // Ao marcar como ativo: remove end_date.
    const handleActiveChange = useCallback(
        (value: boolean) => {
            if (!value) {
                setActive(false);
                setEndDate((prev) => (prev ? prev : moment().format("YYYY-MM-DD")));
            } else {
                setActive(true);
                setEndDate("");
            }
        },
        []
    );

    const handleSubmit = useCallback(async () => {
        // Validation
        if (!title.trim()) {
            Toast.show({
                type: "error",
                text1: "Validation Error",
                text2: "Please enter a habit title.",
            });
            return;
        }

        if (!categoryId) {
            Toast.show({
                type: "error",
                text1: "Validation Error",
                text2: "Please select a category.",
            });
            return;
        }

        setLoading(true);
        try {
            // Se está sendo desativado, garante que end_date está definido
            // Se está sendo reativado, remove o end_date (undefined)
            const finalEndDate = !active ? (endDate || moment().format("YYYY-MM-DD")) : undefined;
            
            const habitData = {
                title: title.trim(),
                description: description.trim() || undefined,
                color,
                emoji,
                unit,
                value,
                period_type: periodType,
                period_value: periodType === "every_day" ? undefined : periodValue || undefined,
                categoryId,
                period,
                reminder_enabled: reminderEnabled,
                reminder_time: reminderEnabled ? reminderTime : undefined,
                start_date: startDate,
                end_date: finalEndDate,
                active,
            };

            if (isEditMode && params.id) {
                await updateHabit(params.id, habitData);
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: "Habit updated successfully.",
                });
                setTimeout(() => router.back(), 1500);
            } else {
                await createHabit(habitData);
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: "Habit created successfully.",
                });
                setTimeout(() => router.back(), 1500);
            }
        } catch (err: any) {
            console.error("Error saving habit:", err.response?.data);
            let errorMessage = isEditMode
                ? "Failed to update habit. Please try again."
                : "Failed to create habit. Please try again.";

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }

            Toast.show({
                type: "error",
                text1: "Error",
                text2: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    }, [
        title,
        description,
        color,
        emoji,
        unit,
        value,
        periodType,
        periodValue,
        categoryId,
        period,
        reminderEnabled,
        reminderTime,
        startDate,
        endDate,
        active,
        isEditMode,
        params.id,
        router,
    ]);

    return {
        // State
        title,
        description,
        color,
        emoji,
        unit,
        value,
        periodType,
        periodValue,
        categoryId,
        period,
        reminderEnabled,
        reminderTime,
        startDate,
        endDate,
        active,
        categories,
        categoriesLoading,
        loading,
        initialLoading,
        isEditMode,

        // Actions
        setTitle,
        setDescription,
        setColor,
        setEmoji,
        setUnit,
        setValue,
        setPeriodType,
        setPeriodValue,
        setCategoryId,
        setPeriod,
        setReminderEnabled,
        setReminderTime,
        setStartDate,
        setEndDate,
        setActive,
        handleActiveChange,
        handleSubmit,
    };
}
