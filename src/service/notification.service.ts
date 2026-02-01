import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Habit } from "@/models/Habit";
import { PeriodType } from "@/utils/constants";

const HABIT_NOTIFICATION_PREFIX = "habit-";

/**
 * iOS only - Request notification permissions.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
    if (Platform.OS !== "ios") return false;

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync({
                ios: { allowAlert: true, allowBadge: true, allowSound: true },
            });
            finalStatus = status;
        }

        return finalStatus === "granted";
    } catch (err) {
        console.error("Error requesting notification permissions:", err);
        return false;
    }
}

/**
 * Parse reminder_time "HH:mm" to { hour, minute }.
 */
function parseReminderTime(reminderTime: string): { hour: number; minute: number } {
    const [hourStr, minuteStr] = reminderTime.split(":");
    return {
        hour: parseInt(hourStr || "9", 10) || 9,
        minute: parseInt(minuteStr || "0", 10) || 0,
    };
}

/**
 * iOS weekday mapping: 1=Sunday, 2=Monday, 3=Tuesday, ..., 7=Saturday.
 */
const WEEKDAY_MAP: Record<string, number> = {
    SUN: 1,
    MON: 2,
    TUE: 3,
    WED: 4,
    THU: 5,
    FRI: 6,
    SAT: 7,
};

/**
 * iOS only - Schedule habit reminder notifications.
 */
export async function scheduleHabitReminders(habit: Habit): Promise<void> {
    if (Platform.OS !== "ios") return;
    if (!habit.reminder_enabled || !habit.reminder_time) return;

    const { hour, minute } = parseReminderTime(habit.reminder_time);
    const title = `${habit.emoji} ${habit.title}`;
    const body = `It's time for your habit: ${habit.title}`;

    try {
        if (habit.period_type === PeriodType.EVERY_DAY) {
            await Notifications.scheduleNotificationAsync({
                identifier: `${HABIT_NOTIFICATION_PREFIX}${habit.id}-daily`,
                content: { title, body, data: { habitId: habit.id } },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DAILY,
                    hour,
                    minute,
                },
            });
        } else if (habit.period_type === PeriodType.WEEKLY && habit.period_value) {
            const days = habit.period_value.split(",").map((d) => d.trim()).filter(Boolean);
            for (const dayCode of days) {
                const weekday = WEEKDAY_MAP[dayCode.toUpperCase()];
                if (weekday >= 1 && weekday <= 7) {
                    await Notifications.scheduleNotificationAsync({
                        identifier: `${HABIT_NOTIFICATION_PREFIX}${habit.id}-${dayCode}`,
                        content: { title, body, data: { habitId: habit.id } },
                        trigger: {
                            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                            weekday,
                            hour,
                            minute,
                        },
                    });
                }
            }
        } else if (habit.period_type === PeriodType.MONTHLY && habit.period_value) {
            const days = habit.period_value.split(",").map((d) => parseInt(d.trim(), 10)).filter((d) => d >= 1 && d <= 31);
            for (const day of days) {
                await Notifications.scheduleNotificationAsync({
                    identifier: `${HABIT_NOTIFICATION_PREFIX}${habit.id}-${day}`,
                    content: { title, body, data: { habitId: habit.id } },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
                        day,
                        hour,
                        minute,
                    },
                });
            }
        }
    } catch (err) {
        console.error("Error scheduling habit reminders:", err);
    }
}

/**
 * iOS only - Cancel all notifications for a habit.
 */
export async function cancelHabitReminders(habitId: string): Promise<void> {
    if (Platform.OS !== "ios") return;

    try {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        const prefix = `${HABIT_NOTIFICATION_PREFIX}${habitId}-`;
        for (const req of scheduled) {
            if (req.identifier.startsWith(prefix)) {
                await Notifications.cancelScheduledNotificationAsync(req.identifier);
            }
        }
    } catch (err) {
        console.error("Error cancelling habit reminders:", err);
    }
}

/**
 * iOS only - Re-sync all habit reminders (cancel and reschedule).
 * Call on app open after authentication.
 */
export async function syncHabitReminders(habits: Habit[]): Promise<void> {
    if (Platform.OS !== "ios") return;

    const withReminders = habits.filter((h) => h.reminder_enabled && h.reminder_time);
    for (const habit of withReminders) {
        await cancelHabitReminders(habit.id);
        await scheduleHabitReminders(habit);
    }
}
