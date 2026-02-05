import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import { CategoryFilter } from "../../components/CategoryFilter";
import { HabitCard } from "../../components/habit/HabitCard";
import { colors } from "../../theme/colors";
import type { FilterType } from "../../viewmodels/habit/useHabitsViewModel";
import { useHabitsViewModel } from "../../viewmodels/habit/useHabitsViewModel";

const STATUS_LABELS: Record<FilterType, string> = {
    all: "All",
    active: "Active",
    inactive: "Inactive",
};

export default function HabitsListScreen() {
    const {
        habits,
        categories,
        selectedCategoryId,
        loading,
        filter,
        deleteDialogVisible,
        habitToDelete,
        setFilter,
        handleCategorySelect,
        handleHabitPress,
        handleEdit,
        handleDelete,
        handleDisable,
        confirmDelete,
        cancelDelete,
    } = useHabitsViewModel();

    const [statusExpanded, setStatusExpanded] = useState(false);
    const statusDisplayLabel = STATUS_LABELS[filter];
    const handleStatusToggle = useCallback(() => {
        setStatusExpanded((prev) => !prev);
    }, []);
    const handleSelectStatus = useCallback(
        (value: FilterType) => {
            setFilter(value);
            setStatusExpanded(false);
        },
        [setFilter]
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading habits...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.filtersRow}>
                <View style={styles.filterItem}>
                    <CategoryFilter
                        categories={categories}
                        selectedCategoryId={selectedCategoryId}
                        onCategorySelect={handleCategorySelect}
                    />
                </View>
                <View style={styles.filterItem}>
                    <View style={styles.statusFilterContainer}>
                        <Pressable
                            style={styles.statusFilterTrigger}
                            onPress={handleStatusToggle}
                            android_ripple={{ color: colors.gray[200] }}
                        >
                            <View style={styles.statusFilterTriggerLeft}>
                                <View style={styles.statusFilterIconWrapper}>
                                    <Ionicons name="filter" size={18} color={colors.primary} />
                                </View>
                                <Text style={styles.statusFilterTriggerValue} numberOfLines={1}>
                                    {statusDisplayLabel}
                                </Text>
                            </View>
                            <Ionicons
                                name={statusExpanded ? "chevron-up" : "chevron-down"}
                                size={20}
                                color={colors.text.body}
                            />
                        </Pressable>
                        {statusExpanded && (
                            <View style={styles.statusFilterList}>
                                {(["all", "active", "inactive"] as const).map((value) => (
                                    <Pressable
                                        key={value}
                                        style={[
                                            styles.statusFilterOption,
                                            filter === value && styles.statusFilterOptionSelected,
                                        ]}
                                        onPress={() => handleSelectStatus(value)}
                                    >
                                        <Text
                                            style={[
                                                styles.statusFilterOptionText,
                                                filter === value && styles.statusFilterOptionTextSelected,
                                            ]}
                                        >
                                            {STATUS_LABELS[value]}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            </View>

            <FlatList
                data={habits}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <HabitCard
                        habit={item}
                        categoryName={categories.find((c) => c.id === item.categoryId)?.name}
                        onEdit={handleEdit}
                        onDisable={handleDisable}
                        onDelete={handleDelete}
                        onPress={() => handleHabitPress(item.id)}
                    />
                )}
                contentContainerStyle={[styles.listContent, habits.length === 0 && styles.listContentEmpty]}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="clipboard-outline" size={64} color={colors.gray[300]} />
                        <Text style={styles.emptyText}>No habits found</Text>
                        <Text style={styles.emptySubtext}>Create your first habit to get started</Text>
                    </View>
                }
            />
            <Portal>
                <Dialog visible={deleteDialogVisible} onDismiss={cancelDelete}>
                    <Dialog.Title>Delete Habit</Dialog.Title>
                    <Dialog.Content>
                        <Text>
                            Are you sure you want to delete? All the historical data will be lost."
                            {habitToDelete?.title}"?
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={cancelDelete}>Cancel</Button>
                        <Button onPress={confirmDelete} textColor={colors.error}>
                            Delete
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    filtersRow: {
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 1,
        backgroundColor: colors.background,
    },
    filterItem: {
        flex: 1,
    },
    statusFilterContainer: {
        marginBottom: 1,
        backgroundColor: colors.white,
        borderRadius: 12,
        overflow: "hidden",
    },
    statusFilterTrigger: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    statusFilterTriggerLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        minWidth: 0,
        marginRight: 8,
    },
    statusFilterIconWrapper: {
        marginRight: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    statusFilterTriggerValue: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.text.title,
        flex: 1,
    },
    statusFilterList: {
        borderTopWidth: 1,
        borderTopColor: colors.gray[200],
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    statusFilterOption: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 2,
    },
    statusFilterOptionSelected: {
        backgroundColor: colors.primaryLight,
    },
    statusFilterOptionText: {
        fontSize: 12,
        fontWeight: "500",
        color: colors.text.title,
        flex: 1,
    },
    statusFilterOptionTextSelected: {
        color: colors.primary,
        fontWeight: "600",
    },
    listContent: {
        paddingTop: 1,
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    listContentEmpty: {
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: colors.text.body,
        fontWeight: "500",
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
});
