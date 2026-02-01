import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Dialog, Button, Portal } from "react-native-paper";
import { RectButton } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, { SharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { CategoryFilter } from "../../components/CategoryFilter";
import { HabitCard } from "../../components/habit/HabitCard";
import { Habit } from "../../models/Habit";
import { colors } from "../../theme/colors";
import { useHabitsViewModel } from "../../viewmodels/habit/useHabitsViewModel";
import type { FilterType } from "../../viewmodels/habit/useHabitsViewModel";

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
        swipeableRefs,
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

    const renderRightActions = (habit: Habit, progress: SharedValue<number>) => {
        const animatedStyle = useAnimatedStyle(() => {
            const translateX = (1 - progress.value) * 100;
            return {
                transform: [{ translateX: withSpring(translateX) }],
            };
        });

        return (
            <View style={styles.rightActions}>
                <Reanimated.View style={[styles.actionContainer, animatedStyle]}>
                    <RectButton style={[styles.actionButton, styles.editButton]} onPress={() => handleEdit(habit)}>
                        <MaterialCommunityIcons name="pencil" size={24} color={colors.white} />
                        <Text style={styles.actionText}>Edit</Text>
                    </RectButton>
                    <RectButton
                        style={[styles.actionButton, styles.disableButton]}
                        onPress={() => handleDisable(habit)}
                    >
                        <MaterialCommunityIcons name={habit.active ? "eye-off" : "eye"} size={24} color={colors.white} />
                        <Text style={styles.actionText}>{habit.active ? "Disable" : "Enable"}</Text>
                    </RectButton>
                    <RectButton style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(habit)}>
                        <MaterialCommunityIcons name="delete" size={24} color={colors.white} />
                        <Text style={styles.actionText}>Delete</Text>
                    </RectButton>
                </Reanimated.View>
            </View>
        );
    };

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
                            <Text style={styles.statusFilterTriggerValue} numberOfLines={1}>
                                {statusDisplayLabel}
                            </Text>
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
                    <Swipeable
                        key={item.id}
                        // @ts-expect-error - ReanimatedSwipeable ref accepts callback function
                        ref={(ref) => {
                            swipeableRefs.current[item.id] = ref;
                        }}
                        renderRightActions={(progress) => renderRightActions(item, progress)}
                        overshootRight={false}
                    >
                        <TouchableOpacity onPress={() => handleHabitPress(item.id)}>
                            <HabitCard habit={item} />
                        </TouchableOpacity>
                    </Swipeable>
                )}
                contentContainerStyle={[
                    styles.listContent,
                    habits.length === 0 && styles.listContentEmpty,
                ]}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="clipboard-list-outline" size={64} color={colors.gray[300]} />
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
                            Are you sure you want to delete? All the historical data will be lost."{habitToDelete?.title}"?
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
    statusFilterTriggerValue: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.text.title,
        flex: 1,
        marginRight: 8,
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
    rightActions: {
        width: 240,
        flexDirection: "row",
        marginBottom: 12,
        borderRadius: 12,
        overflow: "hidden",
    },
    actionContainer: {
        flex: 1,
        flexDirection: "row",
    },
    actionButton: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 16,
    },
    editButton: {
        backgroundColor: colors.primary,
    },
    disableButton: {
        backgroundColor: colors.warning.dark,
    },
    deleteButton: {
        backgroundColor: colors.error,
    },
    actionText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: "600",
        marginTop: 4,
    },
});
