import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TodoCard } from "../../components/TodoCard";
import { colors } from "../../theme/colors";
import { useTodoViewModel } from "../../viewmodels/todo/useTodoViewModel";

export default function HomeScreen() {
    const { todos, categories, loading, error, refreshing, handleRefresh, handleFocus, handleToggleTodo } =
        useTodoViewModel();

    // Atualiza a lista quando a tab recebe foco
    useFocusEffect(
        useCallback(() => {
            handleFocus();
        }, [handleFocus])
    );

    const renderItem = useCallback(
        ({ item }: { item: (typeof todos)[0] }) => {
            return <TodoCard todo={item} categories={categories} onToggle={handleToggleTodo} />;
        },
        [handleToggleTodo, categories]
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
            <FlatList
                data={todos}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
                }
            />
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
});
