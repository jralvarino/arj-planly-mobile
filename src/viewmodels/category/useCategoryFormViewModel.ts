import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { createCategory, getCategoryById, updateCategory } from "../../service/category.service";

export function useCategoryFormViewModel() {
    const router = useRouter();
    const params = useLocalSearchParams<{ id?: string }>();
    const isEditMode = !!params.id;

    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);

    // Load category data if editing
    useFocusEffect(
        useCallback(() => {
            if (isEditMode && params.id) {
                loadCategory(params.id);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isEditMode, params.id])
    );

    const loadCategory = useCallback(
        async (categoryId: string) => {
            setInitialLoading(true);
            try {
                const category = await getCategoryById(categoryId);
                setName(category.name);
            } catch (err: any) {
                console.error("Error loading category:", err);
                let errorMessage = "Failed to load category. Please try again.";

                if (err.response?.data?.message) {
                    errorMessage = err.response.data.message;
                } else if (err.message) {
                    errorMessage = err.message;
                }

                Alert.alert("Error", errorMessage);
                router.back();
            } finally {
                setInitialLoading(false);
            }
        },
        [router]
    );

    const handleSubmit = useCallback(async () => {
        // Validation
        if (!name.trim()) {
            Alert.alert("Validation Error", "Please enter a category name.");
            return;
        }

        setLoading(true);
        try {
            if (isEditMode && params.id) {
                await updateCategory(params.id, { name: name.trim() });
                Alert.alert("Success", "Category updated successfully.", [
                    {
                        text: "OK",
                        onPress: () => router.back(),
                    },
                ]);
            } else {
                await createCategory({ name: name.trim() });
                Alert.alert("Success", "Category created successfully.", [
                    {
                        text: "OK",
                        onPress: () => router.back(),
                    },
                ]);
            }
        } catch (err: any) {
            console.error("Error saving category:", err);
            let errorMessage = isEditMode
                ? "Failed to update category. Please try again."
                : "Failed to create category. Please try again.";

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }

            Alert.alert("Error", errorMessage);
        } finally {
            setLoading(false);
        }
    }, [name, isEditMode, params.id, router]);

    return {
        // State
        name,
        loading,
        initialLoading,
        isEditMode,

        // Actions
        setName,
        handleSubmit,
    };
}
