import { useCallback, useEffect, useRef, useState } from "react";
import { LayoutAnimation, Platform, UIManager } from "react-native";
import { WeekSummary } from "../../interfaces/todo/summary.interface";
import { TODO_STATUS, Todo } from "../../models/Todo";
import { getTodoSummary } from "../../service/todo.service";
import { formatDate, getTodayDate } from "../../utils/dateUtils";

// Habilita LayoutAnimation no Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Calcula o primeiro dia da semana (segunda-feira) baseado em uma data
const getWeekRangeFromDate = (date: string): { startDate: string; endDate: string } => {
    const todoDate = new Date(date);
    const dayOfWeek = todoDate.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado
    const firstDayOfWeek = new Date(todoDate);
    // Ajusta para segunda-feira: se domingo (0), volta 6 dias; caso contrário, volta (dayOfWeek - 1) dias
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    firstDayOfWeek.setDate(todoDate.getDate() - daysToMonday);
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

    return {
        startDate: formatDate(firstDayOfWeek),
        endDate: formatDate(lastDayOfWeek),
    };
};

interface UseHomeViewModelProps {
    todos: Todo[];
    selectedDate: string;
}

export function useHomeViewModel({ todos, selectedDate }: UseHomeViewModelProps) {
    const [weekSummary, setWeekSummary] = useState<WeekSummary>([]);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const currentWeekRangeRef = useRef<{ startDate: string; endDate: string } | null>(null);
    const prevTodosRef = useRef<Todo[]>([]);

    // Cache de summaries por semana (chave: "startDate-endDate")
    const weekSummaryCacheRef = useRef<Map<string, WeekSummary>>(new Map());

    // Ref para cancelar requisições pendentes
    const abortControllerRef = useRef<AbortController | null>(null);

    // Ref para o timer de debounce
    const debounceTimerRef = useRef<number | ReturnType<typeof setTimeout> | null>(null);

    // Ref para o summary atual (para acesso síncrono durante render)
    const currentWeekSummaryRef = useRef<WeekSummary>([]);

    // Função auxiliar para calcular datas adjacentes
    const getAdjacentWeekRanges = useCallback((startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Semana anterior (7 dias antes)
        const prevStart = new Date(start);
        prevStart.setDate(start.getDate() - 7);
        const prevEnd = new Date(end);
        prevEnd.setDate(end.getDate() - 7);

        // Semana seguinte (7 dias depois)
        const nextStart = new Date(start);
        nextStart.setDate(start.getDate() + 7);
        const nextEnd = new Date(end);
        nextEnd.setDate(end.getDate() + 7);

        return {
            prev: { startDate: formatDate(prevStart), endDate: formatDate(prevEnd) },
            next: { startDate: formatDate(nextStart), endDate: formatDate(nextEnd) },
        };
    }, []);

    // Busca o summary da semana com cache e debounce
    const fetchWeekSummary = useCallback(
        async (startDate: string, endDate: string, skipCache: boolean = false) => {
            const cacheKey = `${startDate}-${endDate}`;

            // Atualiza a referência da semana atual imediatamente
            currentWeekRangeRef.current = { startDate, endDate };

            // Verifica cache primeiro e atualiza IMEDIATAMENTE (a menos que skipCache seja true)
            if (!skipCache && weekSummaryCacheRef.current.has(cacheKey)) {
                const cachedSummary = weekSummaryCacheRef.current.get(cacheKey)!;

                // Atualiza o ref síncronamente (acesso imediato)
                currentWeekSummaryRef.current = cachedSummary;

                // Atualiza o estado imediatamente (sem debounce quando há cache)
                // Cria uma nova referência profunda do array e objetos para forçar re-render
                const timestamp = Date.now();
                const newSummary: WeekSummary = cachedSummary.map(
                    (day, index) =>
                        ({
                            date: day.date,
                            total: { ...day.total },
                            categories: day.categories.map((cat) => ({ ...cat })),
                            // Adiciona propriedade temporária para forçar nova referência (será ignorada pelo componente)
                            _cacheTimestamp: timestamp + index,
                        }) as any
                );

                // Atualiza estado imediatamente - cria nova referência para forçar re-render
                setWeekSummary(newSummary);

                // Pre-carrega semanas adjacentes em background (não bloqueia a atualização)
                setTimeout(() => {
                    const adjacent = getAdjacentWeekRanges(startDate, endDate);
                    const prevKey = `${adjacent.prev.startDate}-${adjacent.prev.endDate}`;
                    const nextKey = `${adjacent.next.startDate}-${adjacent.next.endDate}`;

                    if (!weekSummaryCacheRef.current.has(prevKey)) {
                        getTodoSummary(adjacent.prev.startDate, adjacent.prev.endDate)
                            .then((summary) => {
                                weekSummaryCacheRef.current.set(prevKey, summary);
                            })
                            .catch(() => {});
                    }
                    if (!weekSummaryCacheRef.current.has(nextKey)) {
                        getTodoSummary(adjacent.next.startDate, adjacent.next.endDate)
                            .then((summary) => {
                                weekSummaryCacheRef.current.set(nextKey, summary);
                            })
                            .catch(() => {});
                    }
                }, 0);

                return;
            }

            // Se não tem cache, mantém os dados anteriores visíveis (não limpa)
            // e busca do servidor com debounce

            // Cancela requisição anterior se existir
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Limpa timer de debounce anterior
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            // Debounce reduzido para 100ms - resposta mais rápida
            debounceTimerRef.current = setTimeout(async () => {
                // Verifica novamente se ainda estamos nesta semana
                if (
                    currentWeekRangeRef.current?.startDate !== startDate ||
                    currentWeekRangeRef.current?.endDate !== endDate
                ) {
                    // Semana mudou durante o debounce, ignora esta requisição
                    return;
                }

                try {
                    setLoadingSummary(true);

                    // Cria novo AbortController para esta requisição
                    const abortController = new AbortController();
                    abortControllerRef.current = abortController;

                    const summary = await getTodoSummary(startDate, endDate, abortController.signal);

                    // Verifica se a requisição foi cancelada
                    if (abortController.signal.aborted) {
                        return;
                    }

                    // Verifica novamente se ainda estamos nesta semana antes de atualizar
                    if (
                        currentWeekRangeRef.current?.startDate === startDate &&
                        currentWeekRangeRef.current?.endDate === endDate
                    ) {
                        // Atualiza cache, ref e estado
                        weekSummaryCacheRef.current.set(cacheKey, summary);
                        currentWeekSummaryRef.current = summary;
                        setWeekSummary([...summary]); // Cópia para forçar atualização

                        // Pre-carrega semanas adjacentes em background após carregar a atual
                        const adjacent = getAdjacentWeekRanges(startDate, endDate);
                        const prevKey = `${adjacent.prev.startDate}-${adjacent.prev.endDate}`;
                        const nextKey = `${adjacent.next.startDate}-${adjacent.next.endDate}`;

                        if (!weekSummaryCacheRef.current.has(prevKey)) {
                            getTodoSummary(adjacent.prev.startDate, adjacent.prev.endDate)
                                .then((adjSummary) => {
                                    if (!abortController.signal.aborted) {
                                        weekSummaryCacheRef.current.set(prevKey, adjSummary);
                                    }
                                })
                                .catch(() => {});
                        }
                        if (!weekSummaryCacheRef.current.has(nextKey)) {
                            getTodoSummary(adjacent.next.startDate, adjacent.next.endDate)
                                .then((adjSummary) => {
                                    if (!abortController.signal.aborted) {
                                        weekSummaryCacheRef.current.set(nextKey, adjSummary);
                                    }
                                })
                                .catch(() => {});
                        }
                    }
                } catch (err: any) {
                    // Se foi cancelada, não faz nada
                    if (
                        abortControllerRef.current?.signal.aborted ||
                        err?.name === "AbortError" ||
                        err?.code === "ERR_CANCELED"
                    ) {
                        return;
                    }
                    console.error("Error fetching week summary:", err);
                    // Não limpa o summary em caso de erro, mantém o anterior
                } finally {
                    setLoadingSummary(false);
                }
            }, 100);
        },
        [getAdjacentWeekRanges]
    );

    // Callback quando a semana muda no carrossel
    const handleWeekChange = useCallback(
        (startDate: string, endDate: string) => {
            // Sempre chama fetchWeekSummary, que já tem lógica interna para cache e evitar duplicatas
            fetchWeekSummary(startDate, endDate);
        },
        [fetchWeekSummary]
    );

    // Atualiza o summary quando um todo muda de status
    const handleTodoStatusChange = useCallback(
        (changedDate: string, todos: Todo[]) => {
            const weekRange = getWeekRangeFromDate(changedDate);
            const cacheKey = `${weekRange.startDate}-${weekRange.endDate}`;

            // Atualização otimista: atualiza o summary localmente baseado nos todos atuais
            if (weekSummary.length > 0) {
                const doneCount = todos.filter((t) => t.status === TODO_STATUS.DONE).length;
                const totalCount = todos.length;
                const skippedCount = todos.filter((t) => t.status === TODO_STATUS.SKIPPED).length;
                const pendingCount = todos.filter((t) => t.status === TODO_STATUS.PENDING).length;

                // Atualiza apenas o dia da data selecionada no summary
                const updatedSummary = weekSummary.map((daySummary) => {
                    if (daySummary.date === changedDate) {
                        return {
                            ...daySummary,
                            total: {
                                done: doneCount,
                                skipped: skippedCount,
                                pending: pendingCount,
                                total: totalCount,
                            },
                        };
                    }
                    return daySummary;
                });

                // Cria uma nova referência para forçar re-render
                const newSummary = updatedSummary.map((day) => ({
                    ...day,
                    total: { ...day.total },
                    categories: day.categories.map((cat) => ({ ...cat })),
                }));

                // Atualiza o estado imediatamente
                setWeekSummary(newSummary);
                currentWeekSummaryRef.current = newSummary;
                // Atualiza o cache com os dados otimistas
                weekSummaryCacheRef.current.set(cacheKey, newSummary);
            }

            // Busca dados atualizados do servidor para garantir consistência
            setTimeout(() => {
                fetchWeekSummary(weekRange.startDate, weekRange.endDate, true);
            }, 200); // Pequeno delay para garantir que o backend processou
        },
        [weekSummary, fetchWeekSummary]
    );

    // Anima quando os todos mudam de posição ou status e atualiza o summary
    useEffect(() => {
        if (prevTodosRef.current.length > 0) {
            // Verifica se algum todo mudou de status (para animar quando completa)
            const hasStatusChange = todos.some((todo) => {
                const prevTodo = prevTodosRef.current.find((t) => t.id === todo.id);
                return prevTodo && prevTodo.status !== todo.status;
            });

            // Verifica se algum todo mudou de posição na lista
            const hasPositionChange = todos.some((todo, index) => {
                const prevTodo = prevTodosRef.current[index];
                return !prevTodo || prevTodo.id !== todo.id;
            });

            if (hasStatusChange || hasPositionChange) {
                LayoutAnimation.configureNext({
                    duration: 400,
                    create: {
                        type: LayoutAnimation.Types.easeInEaseOut,
                        property: LayoutAnimation.Properties.opacity,
                        springDamping: 0.7,
                    },
                    update: {
                        type: LayoutAnimation.Types.spring,
                        springDamping: 0.7,
                        property: LayoutAnimation.Properties.scaleXY,
                        initialVelocity: 0.3,
                    },
                    delete: {
                        type: LayoutAnimation.Types.easeInEaseOut,
                        property: LayoutAnimation.Properties.opacity,
                        duration: 200,
                    },
                });

                // Atualiza o summary quando o status de algum todo muda
                if (hasStatusChange) {
                    handleTodoStatusChange(selectedDate, todos);
                }
            }
        }
        prevTodosRef.current = todos;
    }, [todos, selectedDate, handleTodoStatusChange]);

    // Busca o summary da semana inicial quando o componente carrega (começando na segunda-feira)
    useEffect(() => {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado
        const firstDayOfWeek = new Date(today);
        // Ajusta para segunda-feira: se domingo (0), volta 6 dias; caso contrário, volta (dayOfWeek - 1) dias
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        firstDayOfWeek.setDate(today.getDate() - daysToMonday);
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

        const startDateStr = formatDate(firstDayOfWeek);
        const endDateStr = formatDate(lastDayOfWeek);
        currentWeekRangeRef.current = { startDate: startDateStr, endDate: endDateStr };
        fetchWeekSummary(startDateStr, endDateStr);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        weekSummary,
        loadingSummary,
        handleWeekChange,
        fetchWeekSummary,
    };
}
