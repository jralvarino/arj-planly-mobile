import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "../theme/colors";

const RING_SIZE = 140;
const RING_STROKE = 10;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_CX = RING_SIZE / 2;
const RING_CY = RING_SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RING_R;

export interface StatisticsOverviewData {
    monthlyRatePercent: number;
    monthBestStreak: number;
    monthCompletionCount: number;
    monthTotalCompletions: number;
    monthDailyAverage: number;
}

interface StatisticsOverviewProps {
    data: StatisticsOverviewData;
}

function MonthlyRing({ percent }: { percent: number }) {
    const strokeDashoffset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
    return (
        <View style={styles.ringWrapper}>
            <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
                <Circle
                    cx={RING_CX}
                    cy={RING_CY}
                    r={RING_R}
                    stroke={colors.primaryLight}
                    strokeWidth={RING_STROKE}
                    fill="none"
                    opacity={0.6}
                />
                <Circle
                    cx={RING_CX}
                    cy={RING_CY}
                    r={RING_R}
                    stroke={colors.primary}
                    strokeWidth={RING_STROKE}
                    fill="none"
                    strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${RING_CX} ${RING_CY})`}
                />
            </Svg>
            <View style={styles.ringCenter} pointerEvents="none">
                <Text style={styles.ringPercent}>{Math.round(percent)}%</Text>
                <Text style={styles.ringLabel}>Monthly Rate</Text>
                <Ionicons name="swap-horizontal" size={14} color={colors.text.body} style={styles.ringIcon} />
            </View>
        </View>
    );
}

interface StatTileProps {
    iconBg: string;
    iconName: keyof typeof Ionicons.glyphMap;
    value: string | number;
    unit?: string;
    label: string;
}

function StatTile({ iconBg, iconName, value, unit, label }: StatTileProps) {
    return (
        <View style={styles.tile}>
            <View style={[styles.tileIconBg, { backgroundColor: iconBg }]}>
                <Ionicons name={iconName} size={20} color={colors.white} />
            </View>
            <View style={styles.tileValueRow}>
                <Text style={styles.tileValue}>{value}</Text>
                {unit != null && <Text style={styles.tileUnit}> {unit}</Text>}
            </View>
            <Text style={styles.tileLabel}>{label}</Text>
        </View>
    );
}

export function StatisticsOverview({ data }: StatisticsOverviewProps) {
    return (
        <View style={styles.container}>
            <MonthlyRing percent={data.monthlyRatePercent} />
            <View style={styles.grid}>
                <View style={styles.gridRow}>
                    <StatTile
                        iconBg={colors.orange.light}
                        iconName="time"
                        value={data.monthBestStreak}
                        unit="Day"
                        label="Best Streaks"
                    />
                    <StatTile
                        iconBg={colors.habitColors[5]}
                        iconName="calendar"
                        value={data.monthCompletionCount}
                        unit="Day"
                        label="Perfect Days"
                    />
                </View>
                <View style={[styles.gridRow, styles.gridRowSecond]}>
                    <StatTile
                        iconBg={colors.successLight}
                        iconName="checkbox"
                        value={data.monthTotalCompletions}
                        label="Habits Done"
                    />
                    <StatTile
                        iconBg={colors.primaryLight}
                        iconName="stats-chart"
                        value={data.monthDailyAverage}
                        label="Daily Average"
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 12,
        paddingBottom: 20,
        paddingHorizontal: 20,
        marginTop: 16,
        marginHorizontal: -5,
        alignItems: "center",
    },
    ringWrapper: {
        position: "relative",
        marginBottom: 24,
    },
    ringSvg: {
        alignSelf: "center",
    },
    ringCenter: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "center",
    },
    ringPercent: {
        fontSize: 28,
        fontWeight: "700",
        color: colors.text.title,
    },
    ringLabel: {
        fontSize: 13,
        color: colors.text.body,
        marginTop: 4,
    },
    ringIcon: {
        marginTop: 6,
    },
    grid: {
        width: "100%",
    },
    gridRow: {
        flexDirection: "row",
        alignItems: "stretch",
        marginBottom: 16,
    },
    gridRowSecond: {
        marginTop: 12,
    },
    tile: {
        flex: 1,
        marginHorizontal: 4,
        alignItems: "center",
        minHeight: 88,
    },
    tileIconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    tileValueRow: {
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "center",
    },
    tileValue: {
        fontSize: 22,
        fontWeight: "700",
        color: colors.text.title,
    },
    tileUnit: {
        fontSize: 13,
        fontWeight: "500",
        color: colors.text.body,
        marginLeft: 2,
    },
    tileLabel: {
        fontSize: 12,
        color: colors.text.body,
        marginTop: 2,
        textAlign: "center",
    },
});
