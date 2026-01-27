import { useMemo } from "react";
import moment from "moment";
import { Habit } from "../../models/Habit";
import { PERIOD_TYPE_OPTIONS, PeriodType } from "../../utils/constants";

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

    const formattedStartDate = useMemo(() => {
        if (!habit.start_date) return null;
        return moment(habit.start_date, "YYYY-MM-DD").format("DD/MM/YYYY");
    }, [habit.start_date]);

    const goalText = useMemo(() => {
        return `${habit.value} ${habit.unit}`;
    }, [habit.value, habit.unit]);

    return {
        formattedPeriodType,
        formattedStartDate,
        goalText,
        isInactive: !habit.active,
    };
}
