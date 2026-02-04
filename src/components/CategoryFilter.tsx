import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Category } from "../models/Category";
import { colors } from "../theme/colors";

interface CategoryFilterProps {
    categories: Category[];
    selectedCategoryId: string | null;
    onCategorySelect: (categoryId: string | null) => void;
}

export function CategoryFilter({
    categories,
    selectedCategoryId,
    onCategorySelect,
}: CategoryFilterProps) {
    const [expanded, setExpanded] = useState(false);

    const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
    const displayLabel = selectedCategory ? selectedCategory.name : "All Categories";

    const handleToggleExpand = useCallback(() => {
        setExpanded((prev) => !prev);
    }, []);

    const handleSelectAll = useCallback(() => {
        onCategorySelect(null);
        setExpanded(false);
    }, [onCategorySelect]);

    const handleSelectCategory = useCallback(
        (categoryId: string) => {
            onCategorySelect(categoryId);
            setExpanded(false);
        },
        [onCategorySelect]
    );

    return (
        <View style={styles.container}>
            <Pressable
                style={styles.trigger}
                onPress={handleToggleExpand}
                android_ripple={{ color: colors.gray[200] }}
            >
                <Text style={styles.triggerValue} numberOfLines={1}>
                    {displayLabel}
                </Text>
                <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={colors.text.body}
                />
            </Pressable>
            {expanded && (
                <View style={styles.list}>
                    <ScrollView
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                        style={styles.listScroll}
                    >
                        <Pressable
                            style={[
                                styles.option,
                                selectedCategoryId === null && styles.optionSelected,
                            ]}
                            onPress={handleSelectAll}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    selectedCategoryId === null && styles.optionTextSelected,
                                ]}
                            >
                                All categories
                            </Text>
                        </Pressable>
                        {categories.map((category) => (
                            <Pressable
                                key={category.id}
                                style={[
                                    styles.option,
                                    selectedCategoryId === category.id && styles.optionSelected,
                                ]}
                                onPress={() => handleSelectCategory(category.id)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        selectedCategoryId === category.id &&
                                            styles.optionTextSelected,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {category.name}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
        backgroundColor: colors.white,
        borderRadius: 12,
        overflow: "hidden",
    },
    trigger: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    triggerValue: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.text.title,
        flex: 1,
        marginRight: 8,
    },
    list: {
        borderTopWidth: 1,
        borderTopColor: colors.gray[200],
        paddingVertical: 4,
        paddingHorizontal: 12,
        maxHeight: 200,
    },
    listScroll: {
        maxHeight: 196,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 2,
    },
    optionSelected: {
        backgroundColor: colors.primaryLight,
    },
    optionText: {
        fontSize: 12,
        fontWeight: "500",
        color: colors.text.title,
        flex: 1,
    },
    optionTextSelected: {
        color: colors.primary,
        fontWeight: "600",
    },
});
