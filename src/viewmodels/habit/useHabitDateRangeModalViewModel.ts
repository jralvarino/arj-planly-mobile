import { useCallback, useMemo, useState } from "react";
import BottomSheetModal from "@gorhom/bottom-sheet";
import moment from "moment";

interface UseHabitDateRangeModalViewModelProps {
    modalRef: React.RefObject<BottomSheetModal | null>;
    initialValue: string;
    onConfirm: (date: string) => void;
    onDismiss?: () => void;
}

export function useHabitDateRangeModalViewModel({
    modalRef,
    initialValue,
    onConfirm,
    onDismiss,
}: UseHabitDateRangeModalViewModelProps) {
    // Parse current value or default to current date
    const parseInitialValue = useCallback((value: string) => {
        if (value) {
            const parsed = moment(value, "YYYY-MM-DD");
            if (parsed.isValid()) {
                return {
                    year: parsed.year(),
                    month: parsed.month() + 1, // moment months are 0-indexed
                    day: parsed.date(),
                };
            }
        }
        const now = moment();
        return {
            year: now.year(),
            month: now.month() + 1,
            day: now.date(),
        };
    }, []);

    const initialDate = useMemo(() => parseInitialValue(initialValue), [initialValue, parseInitialValue]);

    const [selectedYear, setSelectedYear] = useState(initialDate.year);
    const [selectedMonth, setSelectedMonth] = useState(initialDate.month);
    const [selectedDay, setSelectedDay] = useState(initialDate.day);

    // Generate arrays for years (starting from 2026, up to current year + 10), months (1-12), days (1-31)
    const currentYear = moment().year();
    const minYear = 2026;
    const maxYear = currentYear + 10;
    const years = useMemo(() => Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i), []);
    const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
    const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);

    const handleDismiss = useCallback(() => {
        const ref = modalRef.current as any;
        if (ref) {
            if (typeof ref.dismiss === "function") {
                ref.dismiss();
            } else if (typeof ref.close === "function") {
                ref.close();
            } else if (typeof ref.collapse === "function") {
                ref.collapse();
            }
        }
        onDismiss?.();
    }, [modalRef, onDismiss]);

    const handleConfirm = useCallback(() => {
        const formattedDate = moment({
            year: selectedYear,
            month: selectedMonth - 1,
            day: selectedDay,
        }).format("YYYY-MM-DD");
        onConfirm(formattedDate);
        handleDismiss();
    }, [selectedYear, selectedMonth, selectedDay, onConfirm, handleDismiss]);

    const handleYearSelect = useCallback((year: number) => {
        setSelectedYear(year);
    }, []);

    const handleMonthSelect = useCallback((month: number) => {
        setSelectedMonth(month);
    }, []);

    const handleDaySelect = useCallback((day: number) => {
        setSelectedDay(day);
    }, []);

    return {
        selectedYear,
        selectedMonth,
        selectedDay,
        years,
        months,
        days,
        handleDismiss,
        handleConfirm,
        handleYearSelect,
        handleMonthSelect,
        handleDaySelect,
    };
}
