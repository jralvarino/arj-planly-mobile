import { colors } from "@/theme/colors";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Habit } from "../../models/Habit";
import { useHabitCardViewModel } from "../../viewmodels/habit/useHabitCardViewModel";

interface HabitCardProps {
    habit: Habit;
}

export function HabitCard({ habit }: HabitCardProps) {
    const { formattedPeriodType, formattedStartDate, goalText, isInactive } = useHabitCardViewModel({ habit });

    return (
        <View style={[styles.card, { borderLeftColor: habit.color }]}>
            {isInactive && (
                <View style={styles.inactiveBadge}>
                    <Text style={styles.inactiveText}>Inactive</Text>
                </View>
            )}
            <View style={styles.header}>
                <View style={styles.emojiContainer}>
                    {<Text style={styles.emoji}>{habit.emoji}</Text>}
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{habit.title}</Text>
                    {habit.description && <Text style={styles.description}>{habit.description}</Text>}
                </View>
            </View>
            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Goal:</Text>
                    <Text style={styles.detailValue}>{goalText}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Repeat:</Text>
                    <Text style={styles.detailValue}>{formattedPeriodType}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Time:</Text>
                    <Text style={styles.detailValue}>{habit.period}</Text>
                </View>
                {formattedStartDate && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Start:</Text>
                        <Text style={styles.detailValue}>{formattedStartDate}</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        position: "relative",
        ...Platform.select({
            ios: {
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    emojiContainer: {
        marginRight: 12,
    },
    emoji: {
        fontSize: 32,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text.title,
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: colors.text.body,
    },
    inactiveBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: colors.warning.light,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.warning.medium,
        zIndex: 10,
    },
    inactiveText: {
        fontSize: 10,
        fontWeight: "600",
        color: colors.warning.text,
    },
    details: {
        gap: 6,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.text.body,
        marginRight: 8,
        minWidth: 60,
    },
    detailValue: {
        fontSize: 12,
        color: colors.text.title,
    },
});
