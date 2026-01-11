import { colors } from "@/theme/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRef } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import Swipeable, { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, { SharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Category } from "../../models/Category";
import { useCategoryViewModel } from "../../viewmodels/category/useCategoryViewModel";

export default function CategoriesScreen() {
    const { categories, loading, handleEdit, handleDelete } = useCategoryViewModel();
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
                        <MaterialCommunityIcons name="pencil" size={24} color="white" />
                        <Text style={styles.actionText}>Edit</Text>
                    </RectButton>
                    <RectButton
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => {
                            swipeableRefs.current[category.id]?.close();
                            handleDelete(category);
                        }}
                    >
                        <MaterialCommunityIcons name="delete" size={24} color="white" />
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
        backgroundColor: "#ff4444",
    },
    actionText: {
        color: "white",
        fontSize: 12,
        fontWeight: "600",
        marginTop: 4,
    },
});
