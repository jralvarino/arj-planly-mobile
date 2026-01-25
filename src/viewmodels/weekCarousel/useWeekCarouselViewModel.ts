import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, FlatList } from "react-native";
import moment from "moment";
import { WeekSummary } from "../../interfaces/todo/summary.interface";
import { colors } from "../../theme/colors";

const SCREEN_WIDTH = Dimensions.get("window").width;

export interface WeekDay {
    date: Date;
    dateString: string;
    weekday: string;
}

interface UseWeekCarouselViewModelProps {
    weekSummary: WeekSummary;
    onWeekChange: (startDate: string, endDate: string) => void;
    selectedCategoryId?: string | null;
}

export function useWeekCarouselViewModel({
    weekSummary,
    onWeekChange,
    selectedCategoryId,
}: UseWeekCarouselViewModelProps) {
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(52); // Começa no índice 52 (semana atual, meio do array)

    // Gera semanas: [-52, ..., -1, 0, 1, ..., 52] semanas a partir de hoje
    const weeks = useMemo(() => {
        const today = moment();
        // Garante que começa na segunda-feira
        const dayOfWeek = today.day(); // 0 = domingo, 1 = segunda, ..., 6 = sábado
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const startOfCurrentWeek = today.clone().subtract(daysToMonday, "days").startOf("day");

        return Array.from({ length: 105 }, (_, i) => {
            const weekOffset = i - 52; // -52 a 52 semanas
            const weekStart = startOfCurrentWeek.clone().add(weekOffset, "weeks");
            return Array.from({ length: 7 }, (_, dayIndex) => {
                const date = weekStart.clone().add(dayIndex, "day");
                return {
                    date: date.toDate(),
                    dateString: date.format("YYYY-MM-DD"),
                    weekday: date.format("ddd"),
                };
            });
        });
    }, []);

    const isDayComplete = useCallback(
        (dateString: string): boolean => {
            const d = weekSummary.find((day) => day.date === dateString);
            if (!d) return false;
            if (selectedCategoryId) {
                const c = d.categories.find((cat) => cat.categoryId === selectedCategoryId);
                return c ? c.done === c.total && c.total > 0 : false;
            }
            return d.total.done === d.total.total && d.total.total > 0;
        },
        [weekSummary, selectedCategoryId]
    );

    const getDayColor = useCallback(
        (dateString: string): string => {
            const d = weekSummary.find((day) => day.date === dateString);
            if (!d) return colors.gray[100];
            let done: number, total: number;
            if (selectedCategoryId) {
                const c = d.categories.find((cat) => cat.categoryId === selectedCategoryId);
                if (!c) return colors.gray[100];
                done = c.done;
                total = c.total;
            } else {
                done = d.total.done;
                total = d.total.total;
            }
            if (total === 0 || done === 0) return colors.gray[100];
            if (done === total && total > 0) return colors.orange.base;
            if (done === 1) return colors.orange.light;
            // Gradiente entre light e base
            const p = (done - 1) / (total - 1);
            const s = { r: 255, g: 237, b: 213 }; // orange.light em RGB
            const e = { r: 255, g: 152, b: 0 }; // orange.base em RGB (aproximado)
            const r = Math.round(s.r + (e.r - s.r) * p);
            const g = Math.round(s.g + (e.g - s.g) * p);
            const b = Math.round(s.b + (e.b - s.b) * p);
            return `rgb(${r}, ${g}, ${b})`;
        },
        [weekSummary, selectedCategoryId]
    );

    const isToday = useCallback((date: Date) => moment(date).isSame(moment(), "day"), []);

    // Calcula o range da semana atual para notificar o parent
    useEffect(() => {
        const currentWeek = weeks[currentIndex];
        if (currentWeek && currentWeek.length > 0) {
            const startDate = currentWeek[0].dateString;
            const endDate = currentWeek[6].dateString;
            onWeekChange(startDate, endDate);
        }
    }, [currentIndex, weeks, onWeekChange]);

    // Handler quando o scroll termina
    const handleMomentumScrollEnd = useCallback(
        (event: any) => {
            const offsetX = event.nativeEvent.contentOffset.x;
            const newIndex = Math.round(offsetX / SCREEN_WIDTH);
            setCurrentIndex(newIndex);
        },
        []
    );

    // Scroll para a semana atual quando o componente monta
    useEffect(() => {
        if (flatListRef.current && weeks.length > 0) {
            const initialOffset = SCREEN_WIDTH * 52;
            setTimeout(() => {
                flatListRef.current?.scrollToOffset({ offset: initialOffset, animated: false });
            }, 100);
        }
    }, [weeks.length]);

    return {
        weeks,
        flatListRef,
        isDayComplete,
        getDayColor,
        isToday,
        handleMomentumScrollEnd,
    };
}
