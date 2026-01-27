
export const WEEK_DAYS = [
    { code: "MON", label: "Monday" },
    { code: "TUE", label: "Tuesday" },
    { code: "WED", label: "Wednesday" },
    { code: "THU", label: "Thursday" },
    { code: "FRI", label: "Friday" },
    { code: "SAT", label: "Saturday" },
    { code: "SUN", label: "Sunday" },
];

export type UnitType = "count" | "pg" | "km" | "ml" | "min";

export const UNIT_OPTIONS: Array<{ code: UnitType; label: string }> = [
    { code: "count", label: "Count" },
    { code: "pg", label: "Pages" },
    { code: "km", label: "Km" },
    { code: "ml", label: "ML" },
    { code: "min", label: "Minutes" },
];

export type PeriodTypeValue = "every_day" | "specific_days_week" | "specific_days_month";

export const PeriodType = {
    EVERY_DAY: "every_day" as PeriodTypeValue,
    WEEKLY: "specific_days_week" as PeriodTypeValue,
    MONTHLY: "specific_days_month" as PeriodTypeValue,
} as const;

export const PERIOD_TYPE_OPTIONS: Array<{ code: PeriodTypeValue; label: string }> = [
    { code: PeriodType.EVERY_DAY, label: "Every Day" },
    { code: PeriodType.WEEKLY, label: "Weekly" },
    { code: PeriodType.MONTHLY, label: "Monthly" },
];

// Export type alias for backward compatibility
export type PeriodType = PeriodTypeValue;
