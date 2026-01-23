import { useCallback, useEffect, useMemo, useRef } from "react";
import { FlatList } from "react-native";
import { WeekSummary } from "../../interfaces/todo/summary.interface";
import { colors } from "../../theme/colors";

// Funções auxiliares para conversão de cores
function hexToRgb(hex: string): { r: number; g: number; b: number } {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map((x: string) => x + x).join('');
    }
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map((x) => (x.toString(16).length === 1 ? '0' + x.toString(16) : x.toString(16))).join('');
}

const INITIAL_DAYS_COUNT = 364; // ~52 semanas para trás e ~52 para a frente (lista fixa, sem prepend/append)
const CONTAINER_PADDING = 3 * 2;
const GAP_BETWEEN_ITEMS = 5;
const GAPS_TOTAL = GAP_BETWEEN_ITEMS * 6;

export interface DayItem {
    date: Date;
    dateString: string;
    dayName: string;
    dayNumber: string;
    isToday: boolean;
    index: number;
}

const getTodayDate = (): string => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
};

const formatDate = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getDayName = (date: Date): string => {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
};

const generateDay = (offsetFromToday: number): DayItem => {
    const today = new Date();
    const date = new Date(today);
    date.setDate(today.getDate() + offsetFromToday);
    const dateString = formatDate(date);
    return {
        date,
        dateString,
        dayName: getDayName(date),
        dayNumber: String(date.getDate()),
        isToday: dateString === getTodayDate(),
        index: offsetFromToday,
    };
};

/** Segunda-feira da semana que contém a data (YYYY-MM-DD). */
function getMondayOfWeek(dateString: string): Date {
    const [y, m, d] = dateString.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const dow = date.getDay();
    const toMonday = dow === 0 ? 6 : dow - 1;
    const monday = new Date(date);
    monday.setDate(date.getDate() - toMonday);
    return monday;
}

/** { startDate, endDate } (segunda a domingo) da semana que contém a data. */
function getWeekRangeFromDate(dateString: string): { startDate: string; endDate: string } {
    const mon = getMondayOfWeek(dateString);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return { startDate: formatDate(mon), endDate: formatDate(sun) };
}

const getDayItemWidth = (screenWidth: number): number => {
    return (screenWidth - CONTAINER_PADDING - GAPS_TOTAL) / 7;
};

function getWeekRangeFromOffset(offsetX: number, daysList: DayItem[], itemWidthWithGap: number): { startDate: string; endDate: string } {
    const idx = Math.round(offsetX / itemWidthWithGap);
    const day = daysList[Math.max(0, Math.min(idx, daysList.length - 1))];
    if (!day) return getWeekRangeFromDate(getTodayDate());
    return getWeekRangeFromDate(day.dateString);
}

interface UseWeekCarouselViewModelProps {
    selectedDate: string;
    weekSummary: WeekSummary;
    onDateSelect: (date: string) => void;
    onWeekChange: (startDate: string, endDate: string) => void;
    screenWidth: number;
    selectedCategoryId?: string | null;
}

export function useWeekCarouselViewModel({
    selectedDate,
    weekSummary,
    onDateSelect,
    onWeekChange,
    screenWidth,
    selectedCategoryId,
}: UseWeekCarouselViewModelProps) {
    const listRef = useRef<FlatList>(null);
    const hasScrolledToWeek = useRef(false);
    const currentWeekRangeRef = useRef<{ startDate: string; endDate: string } | null>(null);

    // Lista fixa: começa numa segunda-feira para snapToInterval encaixar nas segundas
    const daysList = useMemo<DayItem[]>(() => {
        const today = new Date();
        const ref = new Date(today);
        ref.setDate(today.getDate() - 180);
        const firstMonday = getMondayOfWeek(formatDate(ref));
        const firstOffset = Math.round((firstMonday.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
        const out: DayItem[] = [];
        for (let i = 0; i < INITIAL_DAYS_COUNT; i++) out.push(generateDay(firstOffset + i));
        return out;
    }, []);

    const dayItemWidth = useMemo(() => getDayItemWidth(screenWidth), [screenWidth]);
    const itemWidthWithGap = useMemo(() => dayItemWidth + GAP_BETWEEN_ITEMS, [dayItemWidth]);
    const weekWidth = useMemo(() => itemWidthWithGap * 7, [itemWidthWithGap]);

    const initialScrollIndex = useMemo(() => {
        const { startDate } = getWeekRangeFromDate(getTodayDate());
        const i = daysList.findIndex((d) => d.dateString === startDate);
        return Math.max(0, i);
    }, [daysList]);

    const scrollToCurrentWeek = useCallback(() => {
        if (hasScrolledToWeek.current || !listRef.current) return;
        const offset = initialScrollIndex * itemWidthWithGap;
        requestAnimationFrame(() => {
            listRef.current?.scrollToOffset({ offset, animated: false });
            hasScrolledToWeek.current = true;
        });
    }, [initialScrollIndex, itemWidthWithGap]);

    const notifyWeekIfChanged = useCallback(
        (offsetX: number) => {
            const week = getWeekRangeFromOffset(offsetX, daysList, itemWidthWithGap);
            if (
                !currentWeekRangeRef.current ||
                currentWeekRangeRef.current.startDate !== week.startDate ||
                currentWeekRangeRef.current.endDate !== week.endDate
            ) {
                currentWeekRangeRef.current = week;
                onWeekChange(week.startDate, week.endDate);
            }
        },
        [daysList, itemWidthWithGap, onWeekChange]
    );

    const handleMomentumScrollEnd = useCallback(
        (e: any) => {
            const x = e.nativeEvent.contentOffset.x;
            notifyWeekIfChanged(x);
        },
        [notifyWeekIfChanged]
    );

    const handleScrollEndDrag = useCallback(
        (e: any) => {
            const x = e.nativeEvent.contentOffset.x;
            notifyWeekIfChanged(x);
        },
        [notifyWeekIfChanged]
    );

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
            if (done === total && total > 0) return colors.orange.base; // todos completos (inclui 1/1)
            if (done === 1) return colors.orange.light; // primeiro de vários
            const p = (done - 1) / (total - 1);
            const s = hexToRgb(colors.orange.light);
            const e = hexToRgb(colors.orange.base);
            return rgbToHex(
                Math.round(s.r + (e.r - s.r) * p),
                Math.round(s.g + (e.g - s.g) * p),
                Math.round(s.b + (e.b - s.b) * p)
            );
        },
        [weekSummary, selectedCategoryId]
    );

    useEffect(() => {
        if (daysList.length > 0 && initialScrollIndex > 0) {
            const t = setTimeout(scrollToCurrentWeek, 100);
            return () => clearTimeout(t);
        }
    }, [daysList.length, initialScrollIndex, scrollToCurrentWeek]);

    return {
        daysList,
        weekDaysListRef: listRef,
        hasScrolledToWeek,
        dayItemWidth,
        itemWidthWithGap,
        weekWidth,
        gapBetweenItems: GAP_BETWEEN_ITEMS,
        initialScrollIndex,
        scrollToCurrentWeek,
        handleMomentumScrollEnd,
        handleScrollEndDrag,
        isDayComplete,
        getDayColor,
    };
}
