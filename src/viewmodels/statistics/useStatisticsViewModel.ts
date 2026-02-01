import { useCallback, useEffect, useRef, useState } from "react";
import { DateData } from "react-native-calendars";
import Toast from "react-native-toast-message";
import { DashboardResponse, getDashboard } from "../../service/stats.service";
import { colors } from "../../theme/colors";
import { formatDate } from "../../utils/dateUtils";

type MarkedDates = Record<
    string,
    {
        selected?: boolean;
        selectedColor?: string;
        selectedTextColor?: string;
        marked?: boolean;
        dotColor?: string;
        startingDay?: boolean;
        endingDay?: boolean;
        color?: string;
        textColor?: string;
        customContainerStyle?: { borderWidth?: number; borderColor?: string };
    }
>;

const getMonthFromDate = (dateString: string): string => {
    const [year, month] = dateString.split("-");
    return `${year}-${month}`;
};

const getNextDay = (dateStr: string): string => {
    const d = new Date(dateStr + "T12:00:00");
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
};

const groupConsecutiveDates = (dates: string[]): string[][] => {
    if (dates.length === 0) return [];
    const sorted = [...new Set(dates)].sort();
    const groups: string[][] = [];
    let currentGroup = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
        const expectedNext = getNextDay(currentGroup[currentGroup.length - 1]);
        if (sorted[i] === expectedNext) {
            currentGroup.push(sorted[i]);
        } else {
            groups.push(currentGroup);
            currentGroup = [sorted[i]];
        }
    }
    groups.push(currentGroup);
    return groups;
};

export function useStatisticsViewModel() {
    const today = formatDate(new Date());
    const [selectedDate, setSelectedDate] = useState<string>(today);
    const [currentMonth, setCurrentMonth] = useState<string>(getMonthFromDate(today));
    const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchDashboard = useCallback(async (month: string, selected: string) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            setLoading(true);
            const data = await getDashboard({ month, selectedDate: selected }, abortController.signal);

            if (!abortController.signal.aborted) {
                setDashboardData(data);
            }
        } catch (err: unknown) {
            if (
                abortController.signal.aborted ||
                (err as { name?: string })?.name === "AbortError" ||
                (err as { code?: string })?.code === "ERR_CANCELED"
            ) {
                return;
            }
            console.error("Error fetching dashboard:", err);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to load statistics",
            });
        } finally {
            if (!abortController.signal.aborted) {
                setLoading(false);
            }
            abortControllerRef.current = null;
        }
    }, []);

    const handleDayPress = useCallback((day: DateData) => {
        setSelectedDate(day.dateString);
    }, []);

    const handleMonthChange = useCallback((month: DateData) => {
        const monthStr = `${month.year}-${String(month.month).padStart(2, "0")}`;
        setCurrentMonth(monthStr);
    }, []);

    const markedDates = useCallback((): MarkedDates => {
        const result: MarkedDates = {};
        const completedDates = dashboardData?.completedDates ?? [];
        const consecutiveGroups = groupConsecutiveDates(completedDates);

        for (const group of consecutiveGroups) {
            for (let i = 0; i < group.length; i++) {
                const dateStr = group[i];
                const isFirst = i === 0;
                const isLast = i === group.length - 1;
                const isSingle = group.length === 1;

                result[dateStr] = {
                    startingDay: isFirst || isSingle,
                    endingDay: isLast || isSingle,
                    color: colors.successLight,
                    textColor: colors.text.title,
                    ...(dateStr === selectedDate && {
                        selected: true,
                        selectedTextColor: colors.white,
                        marked: true,
                        dotColor: colors.orange.base,
                    }),
                };
            }
        }

        if (!result[selectedDate]) {
            result[selectedDate] = {
                selected: true,
                startingDay: true,
                endingDay: true,
                textColor: colors.text.title,
                marked: true,
                dotColor: colors.orange.base,
            };
        }

        return result;
    }, [dashboardData?.completedDates, selectedDate]);

    const refetchDashboard = useCallback(() => {
        fetchDashboard(currentMonth, selectedDate);
    }, [currentMonth, selectedDate, fetchDashboard]);

    useEffect(() => {
        fetchDashboard(currentMonth, selectedDate);
    }, [currentMonth, selectedDate, fetchDashboard]);

    return {
        selectedDate,
        loading,
        markedDates: markedDates(),
        dashboardData,
        handleDayPress,
        handleMonthChange,
        refetchDashboard,
    };
}
