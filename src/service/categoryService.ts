import { getDatabase } from "../database/database";
import { Category } from "../models/Category";
import { getAuthToken } from "./auth.service";

const API_URL = "http://localhost:3000/categories";

// Cores disponíveis para categorias
const CATEGORY_COLORS = [
    "#f3eafe",
    "#D8FFFB",
    "#d6fce9",
    "#ffe4e6",
    "#fff4e6",
    "#e6f3ff",
    "#f0e6ff",
    "#ffe6f0",
    "#e6ffe6",
    "#fff9e6",
];

// Gerar cor automaticamente baseada no nome (sem banco de dados)
const generateColorFromName = (name: string): string => {
    // Usar hash do nome para escolher uma cor de forma consistente
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
};

// Converter resultado do banco para Category
const rowToCategory = (row: any): Category => ({
    id: row.id,
    name: row.name,
});

// Buscar todas as categorias
export const getAllCategories = async (): Promise<Category[]> => {
    const token = await getAuthToken();

    if (!token) {
        throw new Error("No authentication token found");
    }

    const response = await fetch(API_URL, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch categories: ${response.status} - ${errorText}`);
    }

    const apiResponse = await response.json();

    // Mapear a resposta da API para o formato Category
    return apiResponse
        .map((item: any) => ({
            id: item.pk,
            name: item.name,
        }))
        .sort((a: Category, b: Category) => a.name.localeCompare(b.name));
};

// Buscar categoria por ID
export const getCategoryById = async (id: string): Promise<Category | null> => {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>("SELECT * FROM categories WHERE id = ?", [id]);
    return row ? rowToCategory(row) : null;
};

// Criar categoria
export const createCategory = async (name: string): Promise<Category> => {
    const token = await getAuthToken();

    if (!token) {
        throw new Error("No authentication token found");
    }

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            name: name.trim(),
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create category: ${response.status} - ${errorText}`);
    }

    const apiResponse = await response.json();

    // Mapear a resposta da API para o formato Category
    return {
        id: apiResponse.pk || `cat_${Date.now()}`,
        name: apiResponse.name || name.trim(),
    };
};

// Atualizar categoria
export const updateCategory = async (id: string, updates: { name?: string }): Promise<Category> => {
    const db = await getDatabase();
    const updatesList: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
        updatesList.push("name = ?");
        values.push(updates.name);
    }

    if (updatesList.length === 0) {
        const category = await getCategoryById(id);
        if (!category) {
            throw new Error("Category not found");
        }
        return category;
    }

    updatesList.push('updated_at = datetime("now")');
    values.push(id);

    await db.runAsync(`UPDATE categories SET ${updatesList.join(", ")} WHERE id = ?`, values);

    const category = await getCategoryById(id);
    if (!category) {
        throw new Error("Category not found");
    }

    return category;
};

// Deletar categoria
export const deleteCategory = async (id: string): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM categories WHERE id = ?", [id]);
};
