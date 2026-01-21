export const TODO_STATUS = {
    DONE: "done",
    PENDING: "pending",
    SKIPPED: "skipped",
} as const;

export type TodoStatus = (typeof TODO_STATUS)[keyof typeof TODO_STATUS];

export interface Todo {
    id: string;
    title: string;
    color: string;
    emoji: string;
    unit: string;
    targetValue: string;
    period: string;
    active: boolean;
    categoryId: string;
    status: TodoStatus;
    progressValue: string;
    skiped: boolean;
    notes?: string;
}
