export interface Todo {
    id: string;
    title: string;
    description: string;
    color: string;
    emoji: string;
    unit: string;
    targetValue: string;
    period: string;
    active: boolean;
    categoryId: string;
    status: "done" | "pending" | "skipped";
    progressValue: string;
    skiped: boolean;
    notes?: string;
    currentStreak: string;
}
