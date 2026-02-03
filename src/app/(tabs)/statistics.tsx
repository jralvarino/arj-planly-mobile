import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import moment from "moment";
import { useCallback, useMemo } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { CategoryFilter } from "../../components/CategoryFilter";
import { HabitFilter } from "../../components/HabitFilter";
import { HabitForSelectedDate } from "../../service/stats.service";
import { colors } from "../../theme/colors";
import { headerTitleComponent } from "../../utils/dateUtils";
import { useStatisticsViewModel } from "../../viewmodels/statistics/useStatisticsViewModel";

function formatCompletedAtForHistory(completedAt: string | undefined, selectedDate: string): string {
    if (!completedAt) return "—";
    const m = moment(completedAt);
    if (!m.isValid()) return "—";
    const completedDateStr = m.format("YYYY-MM-DD");
    if (completedDateStr === selectedDate) {
        return m.format("HH:mm");
    }
    return m.format("DD/MM/YY HH:mm");
}

function isCompletedAtDifferentDate(completedAt: string | undefined, selectedDate: string): boolean {
    if (!completedAt) return false;
    const m = moment(completedAt);
    if (!m.isValid()) return false;
    return m.format("YYYY-MM-DD") !== selectedDate;
}

function sortHabitsByCompletedAt(habits: HabitForSelectedDate[]): HabitForSelectedDate[] {
    return [...habits].sort((a, b) => {
        const aTime = a.completedAt ?? "";
        const bTime = b.completedAt ?? "";
        if (!aTime && !bTime) return 0;
        if (!aTime) return 1;
        if (!bTime) return -1;
        return aTime.localeCompare(bTime);
    });
}

const MEDAL_SOURCES = [
    require("../../../assets/images/medal_3.png"),
    require("../../../assets/images/medal_4.png"),
    require("../../../assets/images/medal_5.png"),
    require("../../../assets/images/medal_6.png"),
    require("../../../assets/images/medal_7.png"),
    require("../../../assets/images/medal_8.png"),
    require("../../../assets/images/medal_9.png"),
];

export default function StatisticsScreen() {
    const {
        selectedDate,
        selectedCategoryId,
        selectedHabitId,
        categories,
        habits,
        loading,
        markedDates,
        dashboardData,
        handleDayPress,
        handleMonthChange,
        handleCategorySelect,
        handleHabitSelect,
        refetchDashboard,
    } = useStatisticsViewModel();

    const sortedHabitsForTimeline = useMemo(
        () =>
            dashboardData?.habitsForSelectedDate ? sortHabitsByCompletedAt(dashboardData.habitsForSelectedDate) : [],
        [dashboardData?.habitsForSelectedDate]
    );

    const categoryNameById = useMemo(
        () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
        [categories]
    );

    useFocusEffect(
        useCallback(() => {
            refetchDashboard();
        }, [refetchDashboard])
    );

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.filtersRow}>
                    <View style={styles.filterItemHabit}>
                        <HabitFilter
                            habits={habits}
                            selectedHabitId={selectedHabitId}
                            onHabitSelect={handleHabitSelect}
                        />
                    </View>
                    <View style={styles.filterItemCategory}>
                        <CategoryFilter
                            categories={categories}
                            selectedCategoryId={selectedCategoryId}
                            onCategorySelect={handleCategorySelect}
                        />
                    </View>
                </View>
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
                {selectedHabitId != null && (
                    <View style={styles.statsCard}>
                        <Text style={styles.statsTitle}>Medalhas</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.medalsRow}
                        >
                            {MEDAL_SOURCES.map((source, index) => (
                                <View key={index} style={styles.medalItem}>
                                    <Image source={source} style={styles.medalImage} resizeMode="contain" />
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}
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
                        {sortedHabitsForTimeline.length > 0 && (
                            <View style={[styles.statsCard, styles.historyCard]}>
                                <Text style={styles.historyTitle}>Historic</Text>
                                <View style={styles.timeline}>
                                    {sortedHabitsForTimeline.map((habit, index) => (
                                        <View key={habit.id} style={styles.timelineRow}>
                                            <View style={styles.timelineLeft}>
                                                <Text
                                                    style={[
                                                        styles.timelineTime,
                                                        isCompletedAtDifferentDate(habit.completedAt, selectedDate) &&
                                                            styles.timelineTimeFullDate,
                                                    ]}
                                                >
                                                    {formatCompletedAtForHistory(habit.completedAt, selectedDate)}
                                                </Text>
                                                <View style={styles.timelineDot} />
                                                {index < sortedHabitsForTimeline.length - 1 && (
                                                    <View style={styles.timelineLine} />
                                                )}
                                            </View>
                                            <View style={styles.habitRow}>
                                                <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                                                <View style={styles.habitInfo}>
                                                    <Text style={styles.habitTitle}>{habit.title}</Text>
                                                    {categoryNameById[habit.categoryId] != null && (
                                                        <Text style={styles.habitCategory}>
                                                            #{categoryNameById[habit.categoryId]}
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
                                        </View>
                                    ))}
                                </View>
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
        paddingBottom: 100,
    },
    filtersRow: {
        flexDirection: "row",
        gap: 0,
        marginBottom: 0,
        paddingHorizontal: 10,
    },
    filterItemHabit: {
        flex: 3,
    },
    filterItemCategory: {
        flex: 2,
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
        paddingHorizontal: 10,
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
        marginHorizontal: -5,
    },
    historyCard: {
        paddingHorizontal: 28,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text.title,
        marginBottom: 16,
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text.title,
        marginBottom: 10,
        textAlign: "center",
    },
    historySubtitle: {
        fontSize: 12,
        color: colors.text.body,
        marginBottom: 12,
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
    timeline: {
        marginTop: 4,
    },
    timelineRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        minHeight: 40,
    },
    timelineLeft: {
        width: 48,
        alignItems: "center",
        marginRight: 10,
        paddingTop: 2,
    },
    timelineTime: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.text.body,
        marginBottom: 6,
        textAlign: "center",
    },
    timelineTimeFullDate: {
        fontSize: 10,
    },
    timelineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    timelineLine: {
        width: 2,
        height: 24,
        marginTop: 4,
        backgroundColor: colors.gray[200],
    },
    habitRow: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingLeft: 0,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    habitEmoji: {
        fontSize: 18,
        marginRight: 10,
    },
    habitInfo: {
        flex: 1,
    },
    habitTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.text.title,
    },
    habitCategory: {
        fontSize: 10,
        color: colors.text.body,
        marginTop: 2,
    },
    habitProgress: {
        fontSize: 11,
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
        fontSize: 11,
        fontWeight: "600",
        color: colors.text.body,
        textTransform: "capitalize",
    },
    medalsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        paddingRight: 4,
    },
    medalItem: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: colors.gray[50],
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: colors.gray[200],
    },
    medalEmoji: {
        fontSize: 28,
    },
    medalImage: {
        width: 32,
        height: 32,
    },
});
