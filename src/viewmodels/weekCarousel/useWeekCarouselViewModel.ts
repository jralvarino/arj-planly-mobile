import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList } from "react-native";
import { WeekSummary } from "../../interfaces/todo/summary.interface";
import { getCalendarColorByHabits } from "../../utils/colorUtils";
import { colors } from "../../theme/colors";

const INITIAL_DAYS_COUNT = 200; // 100 dias para trás e 100 para frente
const CONTAINER_PADDING = 3 * 2; // paddingHorizontal de 3 em cada lado
const WIDTH_REDUCTION = 5; // Valor a ser removido da largura de cada item
const GAP_BETWEEN_ITEMS = WIDTH_REDUCTION; // Gap equivalente ao valor removido
const GAPS_TOTAL = GAP_BETWEEN_ITEMS * 6; // 6 gaps entre 7 itens

export interface DayItem {
    date: Date;
    dateString: string;
    dayName: string;
    dayNumber: string;
    isToday: boolean;
    index: number;
}

const getTodayDate = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getDayName = (date: Date): string => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
};

const getDayNumber = (date: Date): string => {
    return date.getDate().toString();
};

const generateDay = (offset: number): DayItem => {
    const today = new Date();
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const dateString = formatDate(date);
    const isToday = dateString === getTodayDate();

    return {
        date,
        dateString,
        dayName: getDayName(date),
        dayNumber: getDayNumber(date),
        isToday,
        index: offset,
    };
};

// Calcula a largura do item para que 7 dias caibam na tela
// Reduz a largura e compensa com gaps entre os itens
const getDayItemWidth = (screenWidth: number): number => {
    const availableWidth = screenWidth - CONTAINER_PADDING - GAPS_TOTAL;
    return availableWidth / 7;
};

// Calcula o início e fim da semana baseado no offset do scroll
const getWeekRangeFromOffset = (
    offsetX: number,
    daysList: DayItem[],
    itemWidthWithGap: number
): { startDate: string; endDate: string } => {
    // Calcula qual é o índice do primeiro dia visível baseado no offset
    const dayIndex = Math.round(offsetX / itemWidthWithGap);
    const visibleDay = daysList[Math.max(0, Math.min(dayIndex, daysList.length - 1))];

    if (!visibleDay) {
        // Fallback: retorna a semana atual (começando na segunda-feira)
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado
        const firstDayOfWeek = new Date(today);
        // Ajusta para segunda-feira: se domingo (0), volta 6 dias; caso contrário, volta (dayOfWeek - 1) dias
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        firstDayOfWeek.setDate(today.getDate() - daysToMonday);
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

        return {
            startDate: formatDate(firstDayOfWeek),
            endDate: formatDate(lastDayOfWeek),
        };
    }

    // Calcula o primeiro dia da semana que contém esse dia (segunda-feira)
    const targetDate = visibleDay.date;
    const dayOfWeek = targetDate.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado
    const firstDayOfWeek = new Date(targetDate);
    // Ajusta para segunda-feira: se domingo (0), volta 6 dias; caso contrário, volta (dayOfWeek - 1) dias
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    firstDayOfWeek.setDate(targetDate.getDate() - daysToMonday);
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

    return {
        startDate: formatDate(firstDayOfWeek),
        endDate: formatDate(lastDayOfWeek),
    };
};

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
    const weekDaysListRef = useRef<FlatList>(null);
    const hasScrolledToWeek = useRef(false);
    const currentWeekRangeRef = useRef<{ startDate: string; endDate: string } | null>(null);
    
    const [daysList, setDaysList] = useState<DayItem[]>(() => {
        const days = [];
        const startOffset = -Math.floor(INITIAL_DAYS_COUNT / 2);
        for (let i = 0; i < INITIAL_DAYS_COUNT; i++) {
            days.push(generateDay(startOffset + i));
        }
        return days;
    });

    // Calcula as dimensões baseado na largura da tela
    const dayItemWidth = useMemo(() => getDayItemWidth(screenWidth), [screenWidth]);
    const itemWidthWithGap = useMemo(() => dayItemWidth + GAP_BETWEEN_ITEMS, [dayItemWidth]);
    const weekWidth = useMemo(() => itemWidthWithGap * 7, [itemWidthWithGap]);

    // Calcula o índice inicial para mostrar a semana atual (segunda-feira da semana atual)
    const initialScrollIndex = useMemo(() => {
        const todayIndex = daysList.findIndex((day) => day.isToday);
        if (todayIndex === -1) return 0;

        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado
        // Calcula o índice da segunda-feira da semana atual
        // Se domingo (0), segunda-feira está 6 dias atrás; caso contrário, está (dayOfWeek - 1) dias atrás
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const firstDayOfWeekIndex = Math.max(0, todayIndex - daysToMonday);
        return firstDayOfWeekIndex;
    }, [daysList]);

    // Scroll para mostrar a semana atual quando a lista é carregada
    // Posiciona a segunda-feira da semana atual como o primeiro item visível
    const scrollToCurrentWeek = useCallback(() => {
        if (hasScrolledToWeek.current || !weekDaysListRef.current) return;

        // Calcula o offset para posicionar a segunda-feira da semana atual como primeiro item visível
        // O initialScrollIndex já é o índice da segunda-feira da semana atual
        const offset = initialScrollIndex * itemWidthWithGap;

        requestAnimationFrame(() => {
            if (weekDaysListRef.current) {
                weekDaysListRef.current.scrollToOffset({
                    offset: offset,
                    animated: false,
                });
                hasScrolledToWeek.current = true;
            }
        });
    }, [initialScrollIndex, itemWidthWithGap]);

    // Ref para debounce de detecção de semana durante o scroll
    const scrollDetectionTimerRef = useRef<number | ReturnType<typeof setTimeout> | null>(null);
    
    // Carrega mais dias quando se aproxima das bordas e detecta mudança de semana durante o scroll
    const handleScroll = useCallback(
        (event: any) => {
            const offsetX = event.nativeEvent.contentOffset.x;
            const contentWidth = event.nativeEvent.contentSize.width;

            if (offsetX < contentWidth * 0.2) {
                const firstDay = daysList[0];
                if (firstDay && firstDay.index < -500) return;

                const newDays: DayItem[] = [];
                for (let i = 50; i > 0; i--) {
                    newDays.push(generateDay(firstDay.index - i));
                }
                setDaysList((prev) => [...newDays, ...prev]);
            }

            if (offsetX > contentWidth * 0.8) {
                const lastDay = daysList[daysList.length - 1];
                if (lastDay && lastDay.index > 500) return;

                const newDays: DayItem[] = [];
                for (let i = 1; i <= 50; i++) {
                    newDays.push(generateDay(lastDay.index + i));
                }
                setDaysList((prev) => [...prev, ...newDays]);
            }
            
            // Detecta mudança de semana durante o scroll (throttled)
            if (scrollDetectionTimerRef.current) {
                clearTimeout(scrollDetectionTimerRef.current);
            }
            
            scrollDetectionTimerRef.current = setTimeout(() => {
                const weekRange = getWeekRangeFromOffset(offsetX, daysList, itemWidthWithGap);
                
                if (
                    !currentWeekRangeRef.current ||
                    currentWeekRangeRef.current.startDate !== weekRange.startDate ||
                    currentWeekRangeRef.current.endDate !== weekRange.endDate
                ) {
                    // Detectou mudança de semana durante o scroll - inicia carregamento antecipado
                    currentWeekRangeRef.current = weekRange;
                    // Passa um flag indicando que é durante scroll para priorizar cache
                    onWeekChange(weekRange.startDate, weekRange.endDate);
                }
            }, 30); // Throttle reduzido para 30ms - resposta mais rápida
        },
        [daysList, itemWidthWithGap, onWeekChange]
    );

    // Detecta quando o scroll termina e confirma o summary da semana visível
    const handleScrollEnd = useCallback(
        (event: any) => {
            const offsetX = event.nativeEvent.contentOffset.x;
            const weekRange = getWeekRangeFromOffset(offsetX, daysList, itemWidthWithGap);

            // Limpa o timer de detecção do scroll
            if (scrollDetectionTimerRef.current) {
                clearTimeout(scrollDetectionTimerRef.current);
                scrollDetectionTimerRef.current = null;
            }

            // Garante que a semana final está sincronizada (pode já ter sido detectada durante o scroll)
            if (
                !currentWeekRangeRef.current ||
                currentWeekRangeRef.current.startDate !== weekRange.startDate ||
                currentWeekRangeRef.current.endDate !== weekRange.endDate
            ) {
                currentWeekRangeRef.current = weekRange;
                onWeekChange(weekRange.startDate, weekRange.endDate);
            }
        },
        [daysList, itemWidthWithGap, onWeekChange]
    );

    // Verifica se um dia está completo (todos os todos foram concluídos)
    const isDayComplete = useCallback(
        (dateString: string): boolean => {
            const daySummary = weekSummary.find((day) => day.date === dateString);
            if (!daySummary) return false;
            
            // Se uma categoria está selecionada, usa os dados da categoria
            if (selectedCategoryId) {
                const categorySummary = daySummary.categories.find((cat) => cat.categoryId === selectedCategoryId);
                if (!categorySummary) return false;
                return categorySummary.done === categorySummary.total && categorySummary.total > 0;
            }
            
            // Caso contrário, usa o total geral
            return daySummary.total.done === daySummary.total.total && daySummary.total.total > 0;
        },
        [weekSummary, selectedCategoryId]
    );

    // Calcula a cor do dia baseado na quantidade de todos completados
    const getDayColor = useCallback(
        (dateString: string): string => {
            const daySummary = weekSummary.find((day) => day.date === dateString);
            if (!daySummary) {
                // Se não houver summary, retorna a cor padrão
                return colors.gray[100];
            }
            
            let completed: number;
            let total: number;
            
            // Se uma categoria está selecionada, usa os dados da categoria
            if (selectedCategoryId) {
                const categorySummary = daySummary.categories.find((cat) => cat.categoryId === selectedCategoryId);
                if (!categorySummary) {
                    return colors.gray[100];
                }
                completed = categorySummary.done;
                total = categorySummary.total;
            } else {
                // Caso contrário, usa o total geral
                completed = daySummary.total.done;
                total = daySummary.total.total;
            }
            
            // Se nenhum todo foi completado, retorna a cor cinza padrão
            if (completed === 0 || total === 0) {
                return colors.gray[100];
            }
            
            // Usa a cor primária como base e calcula a cor baseado no progresso
            const calculatedColor = getCalendarColorByHabits(colors.primary, completed, total);
            
            return calculatedColor;
        },
        [weekSummary, selectedCategoryId]
    );

    // Inicializa o scroll quando a lista estiver pronta
    useEffect(() => {
        if (daysList.length > 0 && initialScrollIndex > 0) {
            const timeoutId = setTimeout(() => {
                scrollToCurrentWeek();
            }, 100);
            return () => clearTimeout(timeoutId);
        }
    }, [daysList.length, initialScrollIndex, scrollToCurrentWeek]);

    return {
        daysList,
        weekDaysListRef,
        hasScrolledToWeek,
        dayItemWidth,
        itemWidthWithGap,
        weekWidth,
        gapBetweenItems: GAP_BETWEEN_ITEMS,
        initialScrollIndex,
        scrollToCurrentWeek,
        handleScroll,
        handleScrollEnd,
        isDayComplete,
        getDayColor,
        onDateSelect,
        selectedDate,
    };
}
