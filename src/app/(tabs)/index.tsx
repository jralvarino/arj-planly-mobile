import { useFocusEffect } from "expo-router";
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
import { TODO_STATUS } from "../../models/Todo";
import { colors } from "../../theme/colors";
import { useTodoViewModel } from "../../viewmodels/todo/useTodoViewModel";

// Habilita LayoutAnimation no Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
    const {
        todos,
        categories,
        loading,
        error,
        refreshing,
        updating,
        handleRefresh,
        handleFocus,
        handleToggleTodo,
        handleSkipTodoWithConfirmation,
        handleSaveTodo,
        playCompletionSound,
    } = useTodoViewModel();
    const prevTodosRef = useRef<typeof todos>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    // Anima quando os todos mudam de posição
    useEffect(() => {
        if (prevTodosRef.current.length > 0 && todos.length === prevTodosRef.current.length) {
            // Verifica se algum todo mudou de posição
            const hasPositionChange = todos.some((todo, index) => {
                const prevTodo = prevTodosRef.current[index];
                return !prevTodo || prevTodo.id !== todo.id;
            });

            if (hasPositionChange) {
                LayoutAnimation.configureNext({
                    duration: 300,
                    create: {
                        type: LayoutAnimation.Types.easeInEaseOut,
                        property: LayoutAnimation.Properties.opacity,
                    },
                    update: {
                        type: LayoutAnimation.Types.easeInEaseOut,
                        springDamping: 0.7,
                    },
                    delete: {
                        type: LayoutAnimation.Types.easeInEaseOut,
                        property: LayoutAnimation.Properties.opacity,
                    },
                });
            }
        }
        prevTodosRef.current = todos;
    }, [todos]);

    // Atualiza a lista quando a tab recebe foco
    useFocusEffect(
        useCallback(() => {
            handleFocus();
        }, [handleFocus])
    );

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
                        onToggle={handleToggleTodo}
                        onSkip={handleSkipTodoWithConfirmation}
                        onSave={handleSaveTodo}
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
        padding: 16,
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
        marginVertical: 16,
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
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
        backgroundColor: colors.background,
    },
    filterScrollContent: {
        paddingRight: 16,
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 11,
        backgroundColor: colors.gray[200],
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: colors.primary,
    },
    filterButtonText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.text.body,
    },
    filterButtonTextActive: {
        color: "#fff",
    },
});
