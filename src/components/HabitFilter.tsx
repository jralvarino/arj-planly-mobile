import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Habit } from "../models/Habit";
import { colors } from "../theme/colors";

interface HabitFilterProps {
    habits: Habit[];
    selectedHabitId: string | null;
    onHabitSelect: (habitId: string | null) => void;
}

export function HabitFilter({ habits, selectedHabitId, onHabitSelect }: HabitFilterProps) {
    const [expanded, setExpanded] = useState(false);

    const selectedHabit = habits.find((h) => h.id === selectedHabitId);
    const displayLabel = selectedHabit ? `${selectedHabit.emoji} ${selectedHabit.title}` : "All Habits";

    const handleToggleExpand = useCallback(() => {
        setExpanded((prev) => !prev);
    }, []);

    const handleSelectAll = useCallback(() => {
        onHabitSelect(null);
        setExpanded(false);
    }, [onHabitSelect]);

    const handleSelectHabit = useCallback(
        (habitId: string) => {
            onHabitSelect(habitId);
            setExpanded(false);
        },
        [onHabitSelect]
    );

    return (
        <View style={styles.container}>
            <Pressable style={styles.trigger} onPress={handleToggleExpand} android_ripple={{ color: colors.gray[200] }}>
                <View style={styles.triggerLeft}>
                    <View style={styles.iconWrapper}>
                        <Ionicons name="bag-check-sharp" size={18} color={colors.primary} />
                    </View>
                    <Text style={styles.triggerValue} numberOfLines={1}>
                        {displayLabel}
                    </Text>
                </View>
                <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color={colors.text.body} />
            </Pressable>
            {expanded && (
                <View style={styles.list}>
                    <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} style={styles.listScroll}>
                        <Pressable
                            style={[styles.option, selectedHabitId === null && styles.optionSelected]}
                            onPress={handleSelectAll}
                        >
                            <Text style={[styles.optionText, selectedHabitId === null && styles.optionTextSelected]}>
                                All habits
                            </Text>
                        </Pressable>
                        {habits.map((habit) => (
                            <Pressable
                                key={habit.id}
                                style={[styles.option, selectedHabitId === habit.id && styles.optionSelected]}
                                onPress={() => handleSelectHabit(habit.id)}
                            >
                                <Text style={styles.optionEmoji}>{habit.emoji}</Text>
                                <Text
                                    style={[
                                        styles.optionText,
                                        selectedHabitId === habit.id && styles.optionTextSelected,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {habit.title}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
        backgroundColor: colors.white,
        borderRadius: 12,
        overflow: "hidden",
    },
    trigger: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    triggerLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        minWidth: 0,
        marginRight: 8,
    },
    iconWrapper: {
        marginRight: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    triggerValue: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.text.title,
        flex: 1,
    },
    list: {
        borderTopWidth: 1,
        borderTopColor: colors.gray[200],
        paddingVertical: 4,
        paddingHorizontal: 12,
        maxHeight: 200,
    },
    listScroll: {
        maxHeight: 196,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 2,
    },
    optionSelected: {
        backgroundColor: colors.primaryLight,
    },
    optionEmoji: {
        fontSize: 14,
        marginRight: 8,
    },
    optionText: {
        fontSize: 12,
        fontWeight: "500",
        color: colors.text.title,
        flex: 1,
    },
    optionTextSelected: {
        color: colors.primary,
        fontWeight: "600",
    },
});
