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

    // Busca o summary da semana
    const fetchWeekSummary = useCallback(async (startDate: string, endDate: string) => {
        try {
            setLoadingSummary(true);
            const summary = await getTodoSummary(startDate, endDate);
            setWeekSummary(summary);
            currentWeekRangeRef.current = { startDate, endDate };
        } catch (err) {
            console.error("Error fetching week summary:", err);
            setWeekSummary([]);
        } finally {
            setLoadingSummary(false);
        }
    }, []);

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
                if (hasStatusChange && currentWeekRangeRef.current) {
                    fetchWeekSummary(
                        currentWeekRangeRef.current.startDate,
                        currentWeekRangeRef.current.endDate
                    );
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
            if (
                !currentWeekRangeRef.current ||
                currentWeekRangeRef.current.startDate !== startDate ||
                currentWeekRangeRef.current.endDate !== endDate
            ) {
                fetchWeekSummary(startDate, endDate);
            }
        },
        [fetchWeekSummary]
    );

    // Busca o summary da semana inicial quando o componente carrega
    useEffect(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - dayOfWeek);
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

        fetchWeekSummary(formatDate(firstDayOfWeek), formatDate(lastDayOfWeek));
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
                            handleSkipTodoWithConfirmation(todoId, title, status, progressValue, notes, date || selectedDate)
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
