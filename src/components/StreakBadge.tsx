import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

interface StreakBadgeProps {
    globalStreak: string;
}

function parseStreak(globalStreak: string): { number: string; suffix: string } {
    const match = globalStreak.match(/^(\d+)\s*(.*)$/);
    if (match) return { number: match[1], suffix: match[2] ? ` ${match[2]}` : "" };
    return { number: globalStreak, suffix: "" };
}

export function StreakBadge({ globalStreak }: StreakBadgeProps) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const prevStreakRef = useRef<string | null>(null);
    const { number: streakNumber, suffix: streakSuffix } = parseStreak(globalStreak);

    useEffect(() => {
        if (prevStreakRef.current === null) {
            prevStreakRef.current = globalStreak;
            return;
        }
        if (prevStreakRef.current === globalStreak) return;

        prevStreakRef.current = globalStreak;

        Animated.sequence([
            Animated.spring(scaleAnim, {
                toValue: 1.25,
                useNativeDriver: true,
                speed: 80,
                bounciness: 8,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                speed: 60,
                bounciness: 6,
            }),
        ]).start();
    }, [globalStreak, scaleAnim]);

    return (
        <View style={styles.streakTag}>
            <Ionicons name="flame" size={16} color={colors.orange.base} />
            <View style={styles.streakTextRow}>
                <Animated.Text style={[styles.streakText, { transform: [{ scale: scaleAnim }] }]}>
                    {streakNumber}
                </Animated.Text>
                {streakSuffix ? <Text style={styles.streakText}>{streakSuffix}</Text> : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    streakTag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.orange.light,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 16,
        gap: 4,
        borderWidth: 1,
        borderColor: colors.orange.base,
    },
    streakTextRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    streakText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.orange.base,
    },
});
