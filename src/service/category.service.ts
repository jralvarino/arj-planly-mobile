import { Category } from "@/models/Category";
import { planlyApiClient } from "../api/planly-api";

export const getAllCategories = async (): Promise<Category[]> => {
    const { data } = await planlyApiClient.get<any[]>("/categories");
    return data || [];
};

export const getCategoryById = async (id: string): Promise<Category> => {
    const { data } = await planlyApiClient.get<Category>(`/categories/${id}`);
    return data;
};

export const createCategory = async (categoryData: { name: string }): Promise<Category> => {
    const { data } = await planlyApiClient.post<Category>("/categories", categoryData);
    return data;
};

export const updateCategory = async (id: string, categoryData: { name: string }): Promise<Category> => {
    const { data } = await planlyApiClient.put<Category>(`/categories/${id}`, categoryData);
    return data;
};

export const deleteCategory = async (id: string): Promise<void> => {
    await planlyApiClient.delete(`/categories/${id}`);
};
