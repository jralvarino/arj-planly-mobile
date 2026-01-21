import { useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { CategoryFilter } from "../../components/CategoryFilter";
import { TodoCard } from "../../components/TodoCard";
import { WeekCarousel } from "../../components/WeekCarousel";
import { TODO_STATUS } from "../../models/Todo";
import { colors } from "../../theme/colors";
import { getTodayDate, headerTitleComponent } from "../../utils/dateUtils";
import { useHomeViewModel } from "../../viewmodels/home/useHomeViewModel";
import { useTodoViewModel } from "../../viewmodels/todo/useTodoViewModel";

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
    
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
    
    // ViewModel para gerenciar weekSummary e lógica relacionada
    const { weekSummary, loadingSummary, handleWeekChange } = useHomeViewModel({
        todos,
        selectedDate,
    });

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
            <CategoryFilter
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onCategorySelect={setSelectedCategoryId}
            />

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
});
