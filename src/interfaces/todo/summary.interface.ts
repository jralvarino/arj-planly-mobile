export interface CategorySummary {
    categoryId: string;
    done: number;
    skipped: number;
    pending: number;
    total: number;
}

export interface TotalSummary {
    done: number;
    skipped: number;
    pending: number;
    total: number;
}

export interface DaySummary {
    date: string;
    total: TotalSummary;
    categories: CategorySummary[];
}

export type WeekSummary = DaySummary[];
