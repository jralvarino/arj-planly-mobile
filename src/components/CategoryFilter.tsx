import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Category } from "../models/Category";
import { colors } from "../theme/colors";

interface CategoryFilterProps {
    categories: Category[];
    selectedCategoryId: string | null;
    onCategorySelect: (categoryId: string | null) => void;
}

export function CategoryFilter({ categories, selectedCategoryId, onCategorySelect }: CategoryFilterProps) {
    const handleSelectAll = useCallback(() => {
        onCategorySelect(null);
    }, [onCategorySelect]);

    const handleSelectCategory = useCallback(
        (categoryId: string) => {
            onCategorySelect(categoryId);
        },
        [onCategorySelect]
    );

    return (
        <View style={styles.filterContainer}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScrollContent}
            >
                <TouchableOpacity
                    style={[styles.filterButton, selectedCategoryId === null && styles.filterButtonActive]}
                    onPress={handleSelectAll}
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
                        onPress={() => handleSelectCategory(category.id)}
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
    );
}

const styles = StyleSheet.create({
    filterContainer: {
        paddingVertical: 3,
        paddingHorizontal: 6,
        marginBottom: 9,
        backgroundColor: colors.background,
    },
    filterScrollContent: {
        paddingRight: 0,
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 11,
        backgroundColor: colors.gray[100],
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: colors.primary,
    },
    filterButtonText: {
        fontSize: 12,
        fontWeight: "600",
        color: "gray",
    },
    filterButtonTextActive: {
        color: colors.white,
    },
});
