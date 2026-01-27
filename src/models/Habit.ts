import { PeriodType, UnitType } from "../utils/constants";

export interface Habit {
    id: string;
    userId: string;
    title: string;
    description?: string;
    color: string;
    emoji: string;
    unit: UnitType;
    value: string;
    period_type: PeriodType;
    period_value?: string;
    categoryId: string;
    period: "Anytime" | "Morning" | "Afternoon" | "Evening";
    reminder_enabled: boolean;
    reminder_time?: string;
    start_date: string;
    end_date?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}
