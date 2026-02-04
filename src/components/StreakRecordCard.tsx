import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

const RING_SIZE = 64;
const RING_BORDER = 4;

interface StreakRecordCardProps {
    value: number;
    label: string;
    ringColor: string;
    iconName: keyof typeof Ionicons.glyphMap;
    iconColor: string;
}

export function StreakRecordCard({ value, label, ringColor, iconName, iconColor }: StreakRecordCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.contentRow}>
                <View style={[styles.ringWrapper, { borderColor: ringColor }]}>
                    <Text style={styles.ringValue}>{value}</Text>
                    <Text style={styles.ringUnit}>Days</Text>
                </View>
                <View style={styles.iconWrapper}>
                    <Ionicons name={iconName} size={32} color={iconColor} />
                </View>
            </View>
            <Text style={styles.label} numberOfLines={2}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingVertical: 18,
        paddingHorizontal: 18,
        alignItems: "center",
        alignSelf: "stretch",
        minHeight: 145,
        maxWidth: "100%",
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    contentRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
    },
    ringWrapper: {
        width: RING_SIZE,
        height: RING_SIZE,
        borderRadius: RING_SIZE / 2,
        borderWidth: RING_BORDER,
        backgroundColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    ringValue: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.text.title,
    },
    ringUnit: {
        fontSize: 10,
        color: colors.text.body,
        marginTop: 1,
    },
    iconWrapper: {
        alignItems: "center",
        justifyContent: "center",
    },
    label: {
        fontSize: 12,
        fontWeight: "500",
        color: colors.text.title,
        textAlign: "center",
        alignSelf: "stretch",
        minHeight: 40,
        paddingHorizontal: 4,
    },
});
