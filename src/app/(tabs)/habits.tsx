import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Dialog, Button, Portal } from "react-native-paper";
import { RectButton } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, { SharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { HabitCard } from "../../components/HabitCard";
import { Habit } from "../../models/Habit";
import { colors } from "../../theme/colors";
import { useHabitsViewModel } from "../../viewmodels/habit/useHabitsViewModel";

export default function HabitsListScreen() {
    const {
        habits,
        loading,
        filter,
        swipeableRefs,
        deleteDialogVisible,
        habitToDelete,
        setFilter,
        handleHabitPress,
        handleEdit,
        handleDelete,
        handleDisable,
        confirmDelete,
        cancelDelete,
    } = useHabitsViewModel();

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
                        <MaterialCommunityIcons name="pencil" size={24} color="white" />
                        <Text style={styles.actionText}>Edit</Text>
                    </RectButton>
                    <RectButton
                        style={[styles.actionButton, styles.disableButton]}
                        onPress={() => handleDisable(habit)}
                    >
                        <MaterialCommunityIcons name={habit.active ? "eye-off" : "eye"} size={24} color="white" />
                        <Text style={styles.actionText}>{habit.active ? "Disable" : "Enable"}</Text>
                    </RectButton>
                    <RectButton style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(habit)}>
                        <MaterialCommunityIcons name="delete" size={24} color="white" />
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
            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                >
                    <TouchableOpacity
                        style={[styles.filterTag, filter === "all" && styles.filterTagSelected]}
                        onPress={() => setFilter("all")}
                    >
                        <Text style={[styles.filterTagText, filter === "all" && styles.filterTagTextSelected]}>
                            All
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterTag, filter === "active" && styles.filterTagSelected]}
                        onPress={() => setFilter("active")}
                    >
                        <Text style={[styles.filterTagText, filter === "active" && styles.filterTagTextSelected]}>
                            Active
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterTag, filter === "inactive" && styles.filterTagSelected]}
                        onPress={() => setFilter("inactive")}
                    >
                        <Text style={[styles.filterTagText, filter === "inactive" && styles.filterTagTextSelected]}>
                            Inactive
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
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
    listContent: {
        padding: 16,
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
    filterContainer: {
        backgroundColor: "white",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    filterScroll: {
        gap: 8,
    },
    filterTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: colors.gray[100],
        borderWidth: 2,
        borderColor: colors.gray[200],
        marginRight: 8,
    },
    filterTagSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterTagText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.text.title,
    },
    filterTagTextSelected: {
        color: "white",
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
        backgroundColor: "#F59E0B",
    },
    deleteButton: {
        backgroundColor: "#ff4444",
    },
    actionText: {
        color: "white",
        fontSize: 12,
        fontWeight: "600",
        marginTop: 4,
    },
});
