import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import { Category } from "../../models/Category";
import { deleteCategory, getAllCategories } from "../../service/category.service";

export function useCategoryViewModel() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

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
            Toast.show({
                type: "error",
                text1: "Error",
                text2: errorMessage,
            });
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
        (category: Category) => {
            setCategoryToDelete(category);
            setDeleteDialogVisible(true);
        },
        []
    );

    const confirmDelete = useCallback(async () => {
        if (!categoryToDelete) return;
        
        setDeleteDialogVisible(false);
        try {
            await deleteCategory(categoryToDelete.id);
            await fetchCategories();
            setCategoryToDelete(null);
        } catch (err: any) {
            console.error("Error deleting category:", err);
            let errorMessage = "Failed to delete category. Please try again.";

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }

            Toast.show({
                type: "error",
                text1: "Error",
                text2: errorMessage,
            });
        }
    }, [categoryToDelete, fetchCategories]);

    const cancelDelete = useCallback(() => {
        setDeleteDialogVisible(false);
        setCategoryToDelete(null);
    }, []);

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
        deleteDialogVisible,
        categoryToDelete,

        // Actions
        fetchCategories,
        handleEdit,
        handleDelete,
        confirmDelete,
        cancelDelete,
    };
}
