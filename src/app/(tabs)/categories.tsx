import { colors } from "@/theme/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRef } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Dialog, Button, Portal } from "react-native-paper";
import { RectButton } from "react-native-gesture-handler";
import Swipeable, { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, { SharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Category } from "../../models/Category";
import { useCategoryViewModel } from "../../viewmodels/category/useCategoryViewModel";

export default function CategoriesScreen() {
    const {
        categories,
        loading,
        deleteDialogVisible,
        categoryToDelete,
        handleEdit,
        handleDelete,
        confirmDelete,
        cancelDelete,
    } = useCategoryViewModel();
    const swipeableRefs = useRef<{ [id: string]: SwipeableMethods | null }>({});

    const renderRightActions = (category: Category, progress: SharedValue<number>) => {
        const animatedStyle = useAnimatedStyle(() => {
            const translateX = (1 - progress.value) * 100;
            return {
                transform: [{ translateX: withSpring(translateX) }],
            };
        });

        return (
            <View style={styles.rightActions}>
                <Reanimated.View style={[styles.actionContainer, animatedStyle]}>
                    <RectButton
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => {
                            swipeableRefs.current[category.id]?.close();
                            handleEdit(category);
                        }}
                    >
                        <MaterialCommunityIcons name="pencil" size={24} color={colors.white} />
                        <Text style={styles.actionText}>Edit</Text>
                    </RectButton>
                    <RectButton
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => {
                            swipeableRefs.current[category.id]?.close();
                            handleDelete(category);
                        }}
                    >
                        <MaterialCommunityIcons name="delete" size={24} color={colors.white} />
                        <Text style={styles.actionText}>Delete</Text>
                    </RectButton>
                </Reanimated.View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {categories.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="folder-outline" size={64} color={colors.gray[300]} />
                    <Text style={styles.emptyText}>No categories found</Text>
                    <Text style={styles.emptySubtext}>Create your first category to get started</Text>
                </View>
            ) : (
                <ScrollView style={styles.content}>
                    {categories.map((category) => (
                        <Swipeable
                            key={category.id}
                            // @ts-expect-error - ReanimatedSwipeable ref accepts callback function
                            ref={(ref: SwipeableMethods | null) => {
                                swipeableRefs.current[category.id] = ref;
                            }}
                            renderRightActions={(progress) => renderRightActions(category, progress)}
                            overshootRight={false}
                        >
                            <View style={styles.categoryCard}>
                                <View style={styles.categoryInfo}>
                                    <View style={styles.categoryDetails}>
                                        <Text style={styles.categoryName}>{category.name}</Text>
                                    </View>
                                </View>
                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={24}
                                    color={colors.text.body}
                                    style={styles.chevronIcon}
                                />
                            </View>
                        </Swipeable>
                    ))}
                </ScrollView>
            )}
            <Portal>
                <Dialog visible={deleteDialogVisible} onDismiss={cancelDelete}>
                    <Dialog.Title>Delete Category</Dialog.Title>
                    <Dialog.Content>
                        <Text>
                            Are you sure you want to delete "{categoryToDelete?.name}"?
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
        padding: 16,
    },
    categoryCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.gray[100],
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    categoryInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    categoryDetails: {
        flex: 1,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text.title,
    },
    chevronIcon: {
        marginLeft: 8,
        opacity: 0.5,
    },
    rightActions: {
        width: 180,
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
    deleteButton: {
        backgroundColor: colors.error,
    },
    actionText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: "600",
        marginTop: 4,
    },
    emptyContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
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
