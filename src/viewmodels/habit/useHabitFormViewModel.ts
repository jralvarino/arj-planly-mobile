import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import moment from "moment";
import { useCallback, useMemo, useRef, useState } from "react";
import { Dimensions } from "react-native";
import Toast from "react-native-toast-message";
import BottomSheetModal from "@gorhom/bottom-sheet";
import { colors } from "../../theme/colors";
import { Category } from "../../models/Category";
import { getAllCategories } from "../../service/category.service";
import { createHabit, getHabitById, updateHabit } from "../../service/habit.service";
import { UnitType, PeriodType as PeriodTypeValue, PeriodType, UNIT_OPTIONS } from "../../utils/constants";

export function useHabitFormViewModel() {
    const router = useRouter();
    const params = useLocalSearchParams<{ id?: string }>();
    const isEditMode = !!params.id;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState(colors.habitDefault);
    const [emoji, setEmoji] = useState("");
    const [unit, setUnit] = useState<UnitType>("count");
    const [value, setValue] = useState("1");
    const [periodType, setPeriodType] = useState<PeriodTypeValue>(PeriodType.EVERY_DAY);
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

    // UI State for modals
    const [showEmojiModal, setShowEmojiModal] = useState(false);

    // Refs for modals
    const emojiBottomSheetRef = useRef<BottomSheetModal | null>(null);
    const unitBottomSheetRef = useRef<BottomSheetModal | null>(null);
    const reminderTimePickerRef = useRef<BottomSheetModal | null>(null);
    const startDatePickerRef = useRef<BottomSheetModal | null>(null);
    const endDatePickerRef = useRef<BottomSheetModal | null>(null);

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
        setColor(colors.habitDefault);
        setEmoji("");
        setUnit("count");
        setValue("1");
        setPeriodType(PeriodType.EVERY_DAY);
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
    const handleActiveChange = useCallback((value: boolean) => {
        if (!value) {
            setActive(false);
            setEndDate((prev) => (prev ? prev : moment().format("YYYY-MM-DD")));
        } else {
            setActive(true);
            setEndDate("");
        }
    }, []);

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
            const finalEndDate = !active ? endDate || moment().format("YYYY-MM-DD") : undefined;

            const habitData = {
                title: title.trim(),
                description: description.trim() || undefined,
                color,
                emoji,
                unit,
                value,
                period_type: periodType,
                period_value: periodType === PeriodType.EVERY_DAY ? undefined : periodValue || undefined,
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

    // Parse periodValue to array of selected days
    const selectedDays = useMemo(() => {
        return periodType === PeriodType.WEEKLY && periodValue
            ? periodValue
                  .split(",")
                  .map((day) => day.trim())
                  .filter((day) => day !== "")
            : [];
    }, [periodType, periodValue]);

    // Parse periodValue to array of selected month days
    const selectedMonthDays = useMemo(() => {
        return periodType === PeriodType.MONTHLY && periodValue
            ? periodValue
                  .split(",")
                  .map((day) => day.trim())
                  .filter((day) => day !== "")
            : [];
    }, [periodType, periodValue]);

    // Generate array of month days (1-31)
    const monthDays = useMemo(() => Array.from({ length: 31 }, (_, i) => (i + 1).toString()), []);

    // Toggle day selection (for week days)
    const toggleDay = useCallback(
        (dayCode: string) => {
            setPeriodValue((prevValue) => {
                const currentDays = prevValue
                    ? prevValue.split(",").map((day) => day.trim()).filter((day) => day !== "")
                    : [];
                const isSelected = currentDays.includes(dayCode);
                if (isSelected) {
                    return currentDays.filter((day) => day !== dayCode).join(",");
                } else {
                    return [...currentDays, dayCode].join(",");
                }
            });
        },
        []
    );

    // Toggle month day selection
    const toggleMonthDay = useCallback(
        (day: string) => {
            setPeriodValue((prevValue) => {
                const currentDays = prevValue
                    ? prevValue.split(",").map((d) => d.trim()).filter((d) => d !== "")
                    : [];
                const isSelected = currentDays.includes(day);
                if (isSelected) {
                    return currentDays.filter((d) => d !== day).join(",");
                } else {
                    return [...currentDays, day].join(",");
                }
            });
        },
        []
    );

    // Handle period type change
    const handlePeriodTypeChange = useCallback(
        (type: PeriodTypeValue) => {
            // Clear periodValue if changing to every_day or to a different type
            if (type === PeriodType.EVERY_DAY || periodType !== type) {
                setPeriodValue("");
            }
            setPeriodType(type);
        },
        [periodType, setPeriodType, setPeriodValue]
    );

    // Modal handlers
    const handlePresentEmojiModal = useCallback(() => {
        setShowEmojiModal(true);
        const ref = emojiBottomSheetRef.current as any;
        if (ref) {
            if (typeof ref.present === "function") {
                ref.present();
            } else if (typeof ref.snapToIndex === "function") {
                ref.snapToIndex(0);
            } else if (typeof ref.expand === "function") {
                ref.expand();
            }
        }
    }, []);


    const handleOpenGoalModal = useCallback(() => {
        const ref = unitBottomSheetRef.current as any;
        if (ref) {
            if (typeof ref.present === "function") {
                ref.present();
            } else if (typeof ref.snapToIndex === "function") {
                ref.snapToIndex(0);
            } else if (typeof ref.expand === "function") {
                ref.expand();
            }
        }
    }, []);

    const handleOpenReminderModal = useCallback(() => {
        const ref = reminderTimePickerRef.current as any;
        if (ref) {
            if (typeof ref.present === "function") {
                ref.present();
            } else if (typeof ref.snapToIndex === "function") {
                ref.snapToIndex(0);
            } else if (typeof ref.expand === "function") {
                ref.expand();
            }
        }
    }, []);

    const handleOpenStartDateModal = useCallback(() => {
        const ref = startDatePickerRef.current as any;
        if (ref) {
            if (typeof ref.present === "function") {
                ref.present();
            } else if (typeof ref.snapToIndex === "function") {
                ref.snapToIndex(0);
            } else if (typeof ref.expand === "function") {
                ref.expand();
            }
        }
    }, []);

    const handleOpenEndDateModal = useCallback(() => {
        const ref = endDatePickerRef.current as any;
        if (ref) {
            if (typeof ref.present === "function") {
                ref.present();
            } else if (typeof ref.snapToIndex === "function") {
                ref.snapToIndex(0);
            } else if (typeof ref.expand === "function") {
                ref.expand();
            }
        }
    }, []);

    // Simplified handlers
    const handleSetPeriod = useCallback(
        (periodValue: "Anytime" | "Morning" | "Afternoon" | "Evening") => {
            setPeriod(periodValue);
        },
        [setPeriod]
    );

    const handleSetColor = useCallback(
        (colorValue: string) => {
            setColor(colorValue);
        },
        [setColor]
    );

    const handleSetCategoryId = useCallback(
        (id: string) => {
            setCategoryId(id);
        },
        [setCategoryId]
    );

    // Computed values
    const emojiSelectorHeight = useMemo(() => {
        const screenHeight = Dimensions.get("window").height;
        const modalHeight = screenHeight * 0.95; // 95% snapPoint
        const headerHeight = 60; // Approximate header height
        const padding = 100; // Increased padding to ensure last row is visible
        return modalHeight - headerHeight - padding;
    }, []);

    const goalText = useMemo(() => {
        const displayValue = value || "1";
        const unitLabel = UNIT_OPTIONS.find((opt) => opt.code === unit)?.label || "Count";
        return `${displayValue} ${unitLabel}`;
    }, [value, unit]);

    const formattedStartDate = useMemo(() => {
        if (!startDate) return "Select";
        return moment(startDate, "YYYY-MM-DD").format("DD/MM/YYYY");
    }, [startDate]);

    const formattedEndDate = useMemo(() => {
        if (!endDate) return "Select";
        return moment(endDate, "YYYY-MM-DD").format("DD/MM/YYYY");
    }, [endDate]);

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

        // UI State
        showEmojiModal,
        emojiBottomSheetRef,
        unitBottomSheetRef,
        reminderTimePickerRef,
        startDatePickerRef,
        endDatePickerRef,

        // Computed values
        selectedDays,
        selectedMonthDays,
        monthDays,
        goalText,
        formattedStartDate,
        formattedEndDate,

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
        toggleDay,
        toggleMonthDay,
        handlePeriodTypeChange,
        handleSetPeriod,
        handleSetColor,
        handleSetCategoryId,
        handlePresentEmojiModal,
        handleOpenGoalModal,
        handleOpenReminderModal,
        handleOpenStartDateModal,
        handleOpenEndDateModal,
        setShowEmojiModal,
    };
}
