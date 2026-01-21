import { useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    LayoutAnimation,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";
import { TodoCard } from "../../components/TodoCard";
import { WeekCarousel } from "../../components/WeekCarousel";
import { WeekSummary } from "../../interfaces/todo/summary.interface";
import { TODO_STATUS } from "../../models/Todo";
import { getTodoSummary } from "../../service/todo.service";
import { colors } from "../../theme/colors";
import { headerTitleComponent } from "../../utils/dateUtils";
import { useTodoViewModel } from "../../viewmodels/todo/useTodoViewModel";

// Habilita LayoutAnimation no Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const getTodayDate = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export default function HomeScreen() {
    const navigation = useNavigation();
    const {
        todos,
        categories,
        loading,
        error,
        refreshing,
        updating,
        handleRefresh,
        handleFocus,
        fetchTodosByDate,
        handleToggleTodo,
        handleSkipTodoWithConfirmation,
        handleSaveTodo,
        playCompletionSound,
    } = useTodoViewModel();
    const prevTodosRef = useRef<typeof todos>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
    const [weekSummary, setWeekSummary] = useState<WeekSummary>([]);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const currentWeekRangeRef = useRef<{ startDate: string; endDate: string } | null>(null);

    // Cache de summaries por semana (chave: "startDate-endDate")
    const weekSummaryCacheRef = useRef<Map<string, WeekSummary>>(new Map());

    // Ref para cancelar requisições pendentes
    const abortControllerRef = useRef<AbortController | null>(null);

    // Ref para o timer de debounce
    const debounceTimerRef = useRef<number | ReturnType<typeof setTimeout> | null>(null);

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

    // Ref para o summary atual (para acesso síncrono durante render)
    const currentWeekSummaryRef = useRef<WeekSummary>([]);

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
                // Adiciona um timestamp para garantir que seja sempre uma nova referência
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

    // Anima quando os todos mudam de posição ou status e recarrega o summary
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

                // Recarrega o summary quando o status de algum todo muda
                // Invalida o cache e atualiza imediatamente
                if (hasStatusChange) {
                    // Calcula qual semana contém a data selecionada (data do todo que mudou)
                    // Semana começa na segunda-feira
                    const todoDate = new Date(selectedDate);
                    const dayOfWeek = todoDate.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado
                    const firstDayOfWeek = new Date(todoDate);
                    // Ajusta para segunda-feira: se domingo (0), volta 6 dias; caso contrário, volta (dayOfWeek - 1) dias
                    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                    firstDayOfWeek.setDate(todoDate.getDate() - daysToMonday);
                    const lastDayOfWeek = new Date(firstDayOfWeek);
                    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

                    const weekStartDate = formatDate(firstDayOfWeek);
                    const weekEndDate = formatDate(lastDayOfWeek);
                    const cacheKey = `${weekStartDate}-${weekEndDate}`;

                    // Atualização otimista: atualiza o summary localmente baseado nos todos atuais
                    // Conta os todos completados da data selecionada para atualizar apenas esse dia
                    if (weekSummary.length > 0) {
                        const doneCount = todos.filter((t) => t.status === TODO_STATUS.DONE).length;
                        const totalCount = todos.length;
                        const skippedCount = todos.filter((t) => t.status === TODO_STATUS.SKIPPED).length;
                        const pendingCount = todos.filter((t) => t.status === TODO_STATUS.PENDING).length;

                        // Atualiza apenas o dia da data selecionada no summary
                        const updatedSummary = weekSummary.map((daySummary) => {
                            if (daySummary.date === selectedDate) {
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
                        fetchWeekSummary(weekStartDate, weekEndDate, true);
                    }, 200); // Pequeno delay para garantir que o backend processou
                }
            }
        }
        prevTodosRef.current = todos;
    }, [todos, fetchWeekSummary]);

    // Atualiza a lista quando a tab recebe foco
    useFocusEffect(
        useCallback(() => {
            // Busca categorias quando a tela recebe foco
            handleFocus();
        }, [handleFocus])
    );

    // Atualiza o título do header quando a data selecionada muda
    useEffect(() => {
        // Força o cálculo do título baseado na data selecionada atual
        const title = headerTitleComponent(selectedDate);
        navigation.setOptions({
            headerTitle: title,
        });
    }, [selectedDate, navigation]);

    // Busca todos quando a data selecionada muda ou na inicialização
    useEffect(() => {
        fetchTodosByDate(selectedDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate]);

    // Callback quando a semana muda no carrossel
    const handleWeekChange = useCallback(
        (startDate: string, endDate: string) => {
            // Sempre chama fetchWeekSummary, que já tem lógica interna para cache e evitar duplicatas
            fetchWeekSummary(startDate, endDate);
        },
        [fetchWeekSummary]
    );

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

    // Filtra os todos baseado na categoria selecionada
    const filteredTodos = useMemo(() => {
        if (!selectedCategoryId) {
            return todos;
        }
        return todos.filter((todo) => todo.categoryId === selectedCategoryId);
    }, [todos, selectedCategoryId]);

    const renderItem = useCallback(
        ({ item, index }: { item: (typeof filteredTodos)[0]; index: number }) => {
            // Verifica se este é o primeiro Todo com status "done"
            const isFirstDone =
                item.status === TODO_STATUS.DONE &&
                (index === 0 || filteredTodos[index - 1].status !== TODO_STATUS.DONE);

            // Verifica se este é o primeiro Todo com status "skipped"
            const isFirstSkipped =
                item.status === TODO_STATUS.SKIPPED &&
                (index === 0 || filteredTodos[index - 1].status !== TODO_STATUS.SKIPPED);

            return (
                <>
                    {isFirstDone && (
                        <View style={styles.separator}>
                            <View style={styles.separatorLine} />
                            <Text style={styles.separatorText}>Done</Text>
                            <View style={styles.separatorLine} />
                        </View>
                    )}
                    {isFirstSkipped && (
                        <View style={styles.separator}>
                            <View style={styles.separatorLine} />
                            <Text style={styles.separatorText}>Skipped</Text>
                            <View style={styles.separatorLine} />
                        </View>
                    )}
                    <TodoCard
                        todo={item}
                        categories={categories}
                        selectedDate={selectedDate}
                        onToggle={(todoId, status, progressValue, notes, date) =>
                            handleToggleTodo(todoId, status, progressValue, notes, date || selectedDate)
                        }
                        onSkip={(todoId, title, status, progressValue, notes, date) =>
                            handleSkipTodoWithConfirmation(
                                todoId,
                                title,
                                status,
                                progressValue,
                                notes,
                                date || selectedDate
                            )
                        }
                        onSave={(todoId, status, progressValue, notes, date) =>
                            handleSaveTodo(todoId, status, progressValue, notes, date || selectedDate)
                        }
                        onPlayCompletionSound={playCompletionSound}
                    />
                </>
            );
        },
        [
            handleToggleTodo,
            handleSkipTodoWithConfirmation,
            handleSaveTodo,
            playCompletionSound,
            categories,
            filteredTodos,
        ]
    );

    const renderEmpty = useCallback(() => {
        if (loading) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.emptyText}>Loading todos...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.errorText}>Error: {error}</Text>
                    <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No todos for today</Text>
            </View>
        );
    }, [loading, error, handleRefresh]);

    return (
        <View style={styles.container}>
            {/* Carrossel de Dias da Semana */}
            <WeekCarousel
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                weekSummary={weekSummary}
                onWeekChange={handleWeekChange}
                selectedCategoryId={selectedCategoryId}
            />

            {/* Filtro de Categorias */}
            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScrollContent}
                >
                    <TouchableOpacity
                        style={[styles.filterButton, selectedCategoryId === null && styles.filterButtonActive]}
                        onPress={() => setSelectedCategoryId(null)}
                    >
                        <Text
                            style={[
                                styles.filterButtonText,
                                selectedCategoryId === null && styles.filterButtonTextActive,
                            ]}
                        >
                            All
                        </Text>
                    </TouchableOpacity>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.filterButton,
                                selectedCategoryId === category.id && styles.filterButtonActive,
                            ]}
                            onPress={() => setSelectedCategoryId(category.id)}
                        >
                            <Text
                                style={[
                                    styles.filterButtonText,
                                    selectedCategoryId === category.id && styles.filterButtonTextActive,
                                ]}
                            >
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredTodos}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
                }
            />
            {(loading || updating) && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>{loading ? "Loading todos..." : "Updating..."}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        color: colors.text.title,
    },
    logoutButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    logoutText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: "500",
    },
    listContent: {
        padding: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: colors.text.body,
        marginTop: 12,
    },
    errorText: {
        fontSize: 16,
        color: "#EF4444",
        marginBottom: 12,
        textAlign: "center",
    },
    retryButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 8,
    },
    retryButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
    },
    loadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: colors.text.body,
    },
    separator: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
        marginVertical: 10,
        marginHorizontal: 16,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.gray[300],
    },
    separatorText: {
        marginHorizontal: 12,
        fontSize: 14,
        fontWeight: "600",
        color: colors.text.body,
    },
    filterContainer: {
        paddingVertical: 5,
        paddingHorizontal: 6,
        backgroundColor: colors.background,
    },
    filterScrollContent: {
        paddingRight: 0,
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 11,
        backgroundColor: colors.gray[100],
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: colors.primary,
    },
    filterButtonText: {
        fontSize: 12,
        fontWeight: "600",
        color: "gray",
    },
    filterButtonTextActive: {
        color: "#fff",
    },
});
