import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { Category } from "../../models/Category";
import { deleteCategory, getAllCategories } from "../../service/category.service";

export function useCategoryViewModel() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (err: any) {
            console.error("Error fetching categories:", err);

            // Get error message - can come from backend or be a generic message
            let errorMessage = "Failed to load categories. Please try again.";

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            Alert.alert("Error", errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleEdit = useCallback(
        (category: Category) => {
            router.push(`/categories/${category.id}`);
        },
        [router]
    );

    const handleDelete = useCallback(
        async (category: Category) => {
            Alert.alert("Delete Category", `Are you sure you want to delete "${category.name}"?`, [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteCategory(category.id);
                            // Refresh categories after deletion
                            await fetchCategories();
                        } catch (err: any) {
                            console.error("Error deleting category:", err);
                            let errorMessage = "Failed to delete category. Please try again.";

                            if (err.response?.data?.message) {
                                errorMessage = err.response.data.message;
                            } else if (err.message) {
                                errorMessage = err.message;
                            }

                            Alert.alert("Error", errorMessage);
                        }
                    },
                },
            ]);
        },
        [fetchCategories]
    );

    // Refresh categories whenever the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchCategories();
        }, [fetchCategories])
    );

    return {
        // State
        categories,
        loading,
        error,

        // Actions
        fetchCategories,
        handleEdit,
        handleDelete,
    };
}
