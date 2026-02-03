import { useMemo } from "react";
import moment from "moment";
import { Habit } from "../../models/Habit";
import { PERIOD_TYPE_OPTIONS, PeriodType, WEEK_DAYS } from "../../utils/constants";

interface UseHabitCardViewModelProps {
    habit: Habit;
}

export function useHabitCardViewModel({ habit }: UseHabitCardViewModelProps) {
    const formatPeriodType = (type: string): string => {
        switch (type) {
            case PeriodType.EVERY_DAY:
                return "Every Day";
            case PeriodType.WEEKLY:
                return "Weekly";
            case PeriodType.MONTHLY:
                return "Monthly";
            default:
                return PERIOD_TYPE_OPTIONS.find((opt) => opt.code === type)?.label || type;
        }
    };

    const formattedPeriodType = useMemo(() => formatPeriodType(habit.period_type), [habit.period_type]);

    const formattedSelectedDates = useMemo(() => {
        if (habit.period_type === PeriodType.EVERY_DAY || !habit.period_value?.trim()) return null;
        if (habit.period_type === PeriodType.WEEKLY) {
            const codes = habit.period_value.split(",").map((d) => d.trim().toUpperCase()).filter(Boolean);
            const labels = codes
                .map((code) => WEEK_DAYS.find((d) => d.code.toUpperCase() === code)?.label?.slice(0, 3) ?? code)
                .filter(Boolean);
            return labels.length > 0 ? labels.join(", ") : null;
        }
        if (habit.period_type === PeriodType.MONTHLY) {
            const days = habit.period_value
                .split(",")
                .map((d) => parseInt(d.trim(), 10))
                .filter((n) => !Number.isNaN(n) && n >= 1 && n <= 31)
                .sort((a, b) => a - b);
            return days.length > 0 ? days.join(", ") : null;
        }
        return null;
    }, [habit.period_type, habit.period_value]);

    const formattedStartDate = useMemo(() => {
        if (!habit.start_date) return null;
        return moment(habit.start_date, "YYYY-MM-DD").format("DD/MM/YYYY");
    }, [habit.start_date]);

    const formattedEndDate = useMemo(() => {
        if (!habit.end_date) return null;
        return moment(habit.end_date, "YYYY-MM-DD").format("DD/MM/YYYY");
    }, [habit.end_date]);

    const goalText = useMemo(() => {
        return `${habit.value} ${habit.unit}`;
    }, [habit.value, habit.unit]);

    return {
        formattedPeriodType,
        formattedSelectedDates,
        formattedStartDate,
        formattedEndDate,
        goalText,
        isInactive: !habit.active,
    };
}
