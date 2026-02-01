import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { headerTitleComponent } from "../../utils/dateUtils";
import { useStatisticsViewModel } from "../../viewmodels/statistics/useStatisticsViewModel";

export default function StatisticsScreen() {
    const insets = useSafeAreaInsets();
    const { selectedDate, loading, markedDates, dashboardData, handleDayPress, handleMonthChange, refetchDashboard } =
        useStatisticsViewModel();

    useFocusEffect(
        useCallback(() => {
            refetchDashboard();
        }, [refetchDashboard])
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.calendarWrapper}>
                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    )}
                    <Calendar
                        markingType="period"
                        initialDate={selectedDate}
                        onDayPress={handleDayPress}
                        onMonthChange={handleMonthChange}
                        markedDates={markedDates}
                        enableSwipeMonths
                        hideExtraDays
                        monthFormat="MMMM yyyy"
                        theme={{
                            backgroundColor: colors.white,
                            calendarBackground: colors.white,
                            textSectionTitleColor: colors.text.body,
                            selectedDayBackgroundColor: colors.orange.base,
                            selectedDayTextColor: colors.white,
                            todayTextColor: colors.orange.base,
                            dayTextColor: colors.text.title,
                            textDisabledColor: colors.gray[300],
                            arrowColor: colors.primary,
                            monthTextColor: colors.text.title,
                            textDayHeaderFontWeight: "500" as const,
                            textMonthFontWeight: "700" as const,
                        }}
                        style={styles.calendar}
                    />
                </View>
                {dashboardData && (
                    <>
                        <View style={styles.statsCard}>
                            <Text style={styles.statsTitle}>Month Summary</Text>
                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: colors.success }]}>
                                        {dashboardData.monthCompletionCount}
                                    </Text>
                                    <Text style={styles.statLabel}>Completed Days</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: colors.primary }]}>
                                        {Math.round(dashboardData.monthCompletionRate * 100)}%
                                    </Text>
                                    <Text style={styles.statLabel}>Completion Rate</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: colors.text.title }]}>
                                        {dashboardData.daysInMonth}
                                    </Text>
                                    <Text style={styles.statLabel}>Days in Month</Text>
                                </View>
                            </View>
                        </View>
                        {(dashboardData.globalStreak > 0 ||
                            dashboardData.globalLongestStreak > 0 ||
                            dashboardData.globalTotalCompletions > 0) && (
                            <View style={styles.statsCard}>
                                <Text style={styles.statsTitle}>Global Streaks</Text>
                                <View style={styles.statsRow}>
                                    <View style={styles.statItem}>
                                        <Ionicons name="flame" size={24} color={colors.orange.base} />
                                        <Text style={[styles.statValue, { color: colors.orange.base }]}>
                                            {dashboardData.globalStreak}
                                        </Text>
                                        <Text style={styles.statLabel}>Current</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Ionicons name="trophy" size={24} color={colors.gold} />
                                        <Text style={[styles.statValue, { color: colors.gold }]}>
                                            {dashboardData.globalLongestStreak}
                                        </Text>
                                        <Text style={styles.statLabel}>Longest</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={[styles.statValue, { color: colors.primary }]}>
                                            {dashboardData.globalTotalCompletions}
                                        </Text>
                                        <Text style={styles.statLabel}>Total</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                        {(dashboardData.categoryStreak !== undefined ||
                            dashboardData.categoryLongestStreak !== undefined ||
                            dashboardData.categoryTotalCompletions !== undefined) && (
                            <View style={styles.statsCard}>
                                <Text style={styles.statsTitle}>Category Streaks</Text>
                                <View style={styles.statsRow}>
                                    {dashboardData.categoryStreak !== undefined && (
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: colors.orange.base }]}>
                                                {dashboardData.categoryStreak}
                                            </Text>
                                            <Text style={styles.statLabel}>Current</Text>
                                        </View>
                                    )}
                                    {dashboardData.categoryLongestStreak !== undefined && (
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: colors.gold }]}>
                                                {dashboardData.categoryLongestStreak}
                                            </Text>
                                            <Text style={styles.statLabel}>Longest</Text>
                                        </View>
                                    )}
                                    {dashboardData.categoryTotalCompletions !== undefined && (
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: colors.primary }]}>
                                                {dashboardData.categoryTotalCompletions}
                                            </Text>
                                            <Text style={styles.statLabel}>Total</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}
                        {dashboardData.habitsForSelectedDate && dashboardData.habitsForSelectedDate.length > 0 && (
                            <View style={styles.statsCard}>
                                <Text style={styles.statsTitle}>{headerTitleComponent(selectedDate)}</Text>
                                {dashboardData.habitsForSelectedDate.map((habit) => (
                                    <View key={habit.id} style={styles.habitRow}>
                                        <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                                        <View style={styles.habitInfo}>
                                            <Text style={styles.habitTitle}>{habit.title}</Text>
                                            {habit.progressValue != null && habit.targetValue != null && (
                                                <Text style={styles.habitProgress}>
                                                    {habit.progressValue} / {habit.targetValue}
                                                </Text>
                                            )}
                                        </View>
                                        {habit.status && (
                                            <View
                                                style={[
                                                    styles.statusBadge,
                                                    habit.status === "done" && styles.statusDone,
                                                    habit.status === "skipped" && styles.statusSkipped,
                                                    habit.status === "pending" && styles.statusPending,
                                                ]}
                                            >
                                                <Text style={styles.statusText}>{habit.status}</Text>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: colors.text.title,
        marginTop: 16,
        marginBottom: 20,
    },
    calendarWrapper: {
        backgroundColor: colors.white,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
    },
    loadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.overlay.white90,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
        borderRadius: 16,
    },
    calendar: {
        borderRadius: 16,
    },
    statsCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        paddingTop: 12,
        paddingBottom: 20,
        paddingHorizontal: 20,
        marginTop: 16,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text.title,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "700",
    },
    statLabel: {
        fontSize: 12,
        color: colors.text.body,
        marginTop: 4,
    },
    habitRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    habitEmoji: {
        fontSize: 24,
        marginRight: 12,
    },
    habitInfo: {
        flex: 1,
    },
    habitTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text.title,
    },
    habitProgress: {
        fontSize: 12,
        color: colors.text.body,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusDone: {
        backgroundColor: colors.success + "20",
    },
    statusSkipped: {
        backgroundColor: colors.orange.light,
    },
    statusPending: {
        backgroundColor: colors.gray[100],
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.text.body,
        textTransform: "capitalize",
    },
});
