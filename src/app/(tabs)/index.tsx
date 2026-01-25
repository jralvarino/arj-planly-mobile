import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useEffect } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CategoryFilter } from "../../components/CategoryFilter";
import { TodoCard } from "../../components/TodoCard";
import { WeekCarousel } from "../../components/WeekCarousel";
import { colors } from "../../theme/colors";
import { getTodayDate, headerTitleComponent } from "../../utils/dateUtils";
import { useHomeViewModel } from "../../viewmodels/home/useHomeViewModel";
import { useHomeScreenViewModel } from "../../viewmodels/home/useHomeScreenViewModel";
import { useTodoViewModel } from "../../viewmodels/todo/useTodoViewModel";

const TAB_BAR_HEIGHT = 72;

export default function HomeScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const {
        todos,
        categories,
        loading,
        error,
        refreshing,
        handleRefresh,
        handleFocus,
        fetchTodosByDate,
        handleToggleTodo,
        handleSkipTodoWithConfirmation,
        handleSaveTodo,
        handleSaveNotes,
    } = useTodoViewModel();
    
    // ViewModel para gerenciar estado da tela (filtros, datas, separadores)
    const {
        selectedCategoryId,
        setSelectedCategoryId,
        selectedDate,
        setSelectedDate,
        filteredTodos,
        getItemSeparatorInfo,
    } = useHomeScreenViewModel({ todos });
    
    // ViewModel para gerenciar weekSummary e lógica relacionada
    const { weekSummary, handleWeekChange } = useHomeViewModel({
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
            headerTitle: () => (
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitleText}>{title}</Text>
                </View>
            ),
            headerRight: () => (
                <View style={styles.streakTag}>
                    <Ionicons name="flame" size={16} color={colors.orange.base} />
                    <Text style={styles.streakText}>1 day</Text>
                </View>
            ),
        });
    }, [selectedDate, navigation]);

    // Busca todos quando a data selecionada muda ou na inicialização
    useEffect(() => {
        fetchTodosByDate(selectedDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate]);

    const renderItem = useCallback(
        ({ item, index }: { item: (typeof filteredTodos)[0]; index: number }) => {
            const { isFirstDone, isFirstSkipped, showCongratulations } = getItemSeparatorInfo(item, index);

            return (
                <>
                    {showCongratulations && (
                        <View style={styles.congratulationsSeparator}>
                            <View style={styles.separatorLine} />
                            <Text style={styles.congratulationsText}>All Done 🎉</Text>
                            <View style={styles.separatorLine} />
                        </View>
                    )}
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
                        onToggle={(todoId, status, progressValue, date) =>
                            handleToggleTodo(todoId, status, progressValue, date || selectedDate)
                        }
                        onSkip={(todoId, title, status, progressValue, date) =>
                            handleSkipTodoWithConfirmation(
                                todoId,
                                title,
                                status,
                                progressValue,
                                date || selectedDate
                            )
                        }
                        onSave={(todoId, status, progressValue, date) =>
                            handleSaveTodo(todoId, status, progressValue, date || selectedDate)
                        }
                        onSaveNotes={(todoId, notes, date) =>
                            handleSaveNotes(todoId, notes, date || selectedDate)
                        }
                    />
                </>
            );
        },
        [handleToggleTodo, handleSkipTodoWithConfirmation, handleSaveTodo, categories, filteredTodos, getItemSeparatorInfo]
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
                <MaterialCommunityIcons name="check-circle-outline" size={64} color={colors.gray[300]} />
                <Text style={styles.emptyText}>No todos for today</Text>
                <Text style={styles.emptySubtext}>Create your first todo to get started</Text>
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
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 16 },
                    filteredTodos.length === 0 && styles.listContentEmpty,
                ]}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
                }
            />
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading todos...</Text>
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
    streakTag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.orange.light,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 16,
        gap: 4,
        borderWidth: 1,
        borderColor: colors.orange.base,
    },
    streakText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.orange.base,
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
        paddingTop: 0,
    },
    listContentEmpty: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
        minHeight: 400,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.text.title,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.text.body,
        textAlign: "center",
    },
    errorText: {
        fontSize: 16,
        color: colors.error,
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
        color: colors.white,
        fontSize: 14,
        fontWeight: "600",
    },
    loadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.overlay.white90,
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
    congratulationsSeparator: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
        marginVertical: 16,
        marginHorizontal: 16,
    },
    congratulationsText: {
        marginHorizontal: 12,
        fontSize: 16,
        fontWeight: "700",
        color: colors.success,
    },
    headerTitleContainer: {
        backgroundColor: colors.primary,
        paddingHorizontal: 30,
        paddingVertical: 5,
        borderRadius: 15,
    },
    headerTitleText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.white,
    },
});
