import { useFocusEffect } from "expo-router";
import moment from "moment";
import { useCallback, useMemo } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { CategoryFilter } from "../../components/CategoryFilter";
import { HabitFilter } from "../../components/HabitFilter";
import { StatisticsOverview, StatisticsOverviewData } from "../../components/StatisticsOverview";
import { StreakRecordCard } from "../../components/StreakRecordCard";
import { HabitForSelectedDate } from "../../service/stats.service";
import { colors } from "../../theme/colors";
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

    const categoryNameById = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories]);

    const overviewData: StatisticsOverviewData = useMemo(() => {
        if (!dashboardData) {
            return {
                monthlyRatePercent: 0,
                monthBestStreak: 0,
                monthCompletionCount: 0,
                monthTotalCompletions: 0,
                monthDailyAverage: 0,
            };
        }
        const {
            monthCompletionRate,
            monthCompletionCount,
            monthTotalCompletions,
            monthDailyAverage,
            monthBestStreak,
            globalTotalCompletions,
            daysInMonth,
            categoryMonthTotalCompletions,
            categoryMonthDailyAverage,
            categoryMonthBestStreak,
            habitMonthTotalCompletions,
            habitMonthDailyAverage,
            habitMonthBestStreak,
        } = dashboardData;
        // When both category and habit are selected, use habit data (habit takes precedence)
        const useHabitStats = selectedHabitId != null;
        const useCategoryStats = selectedCategoryId != null && !useHabitStats;
        const bestStreak =
            useHabitStats && habitMonthBestStreak != null
                ? habitMonthBestStreak
                : useCategoryStats && categoryMonthBestStreak != null
                  ? categoryMonthBestStreak
                  : (monthBestStreak ?? 0);
        const totalCompletions =
            useHabitStats && habitMonthTotalCompletions != null
                ? habitMonthTotalCompletions
                : useCategoryStats && categoryMonthTotalCompletions != null
                  ? categoryMonthTotalCompletions
                  : (monthTotalCompletions ?? globalTotalCompletions ?? 0);
        const rawDailyAverage =
            useHabitStats && habitMonthDailyAverage != null
                ? habitMonthDailyAverage
                : useCategoryStats && categoryMonthDailyAverage != null
                  ? categoryMonthDailyAverage
                  : monthDailyAverage;
        const monthDailyAverageFormatted =
            rawDailyAverage != null
                ? Number(rawDailyAverage.toFixed(1))
                : daysInMonth > 0 && globalTotalCompletions != null
                  ? Number((globalTotalCompletions / daysInMonth).toFixed(1))
                  : 0;
        return {
            monthlyRatePercent: Math.round(monthCompletionRate * 100),
            monthBestStreak: bestStreak,
            monthCompletionCount,
            monthTotalCompletions: totalCompletions,
            monthDailyAverage: monthDailyAverageFormatted,
        };
    }, [dashboardData, selectedCategoryId, selectedHabitId]);

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
                <StatisticsOverview data={overviewData} />
                {dashboardData && (
                    <>
                        <View style={[styles.statsCard, styles.statsCardRecords]}>
                            <View style={styles.historyTitleBanner}>
                                <Text style={styles.historyTitleText}>YOUR RECORDS</Text>
                            </View>
                            <View style={styles.streakCardsRow}>
                                <View style={[styles.streakCardItem, styles.streakCardItemFirst]}>
                                    <StreakRecordCard
                                        value={
                                            selectedHabitId != null && dashboardData.habitMonthBestStreak != null
                                                ? dashboardData.habitMonthBestStreak
                                                : (dashboardData.globalLongestStreak ?? 0)
                                        }
                                        label="Your longest streak"
                                        ringColor={colors.gold}
                                        iconName="trophy"
                                        iconColor={colors.gold}
                                    />
                                </View>
                                <View style={styles.streakCardItem}>
                                    <StreakRecordCard
                                        value={
                                            selectedHabitId != null && dashboardData.habitStreak != null
                                                ? dashboardData.habitStreak
                                                : (dashboardData.globalStreak ?? 0)
                                        }
                                        label="Your current streak"
                                        ringColor={colors.orange.base}
                                        iconName="flame"
                                        iconColor={colors.orange.base}
                                    />
                                </View>
                            </View>
                        </View>
                        {sortedHabitsForTimeline.length > 0 && (
                            <View style={[styles.statsCard, styles.historyCard]}>
                                <View style={styles.historyTitleBanner}>
                                    <Text style={styles.historyTitleText}>HISTORIC</Text>
                                </View>
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
        flex: 3,
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
    statsCardRecords: {
        marginHorizontal: 0,
    },
    historyCard: {
        paddingHorizontal: 28,
        marginTop: -20,
    },
    historyTitleBanner: {
        backgroundColor: colors.gray[100],
        borderRadius: 12,
        paddingVertical: 5,
        paddingHorizontal: 20,
        marginBottom: 16,
        alignItems: "center",
        justifyContent: "center",
        ...Platform.select({
            ios: {
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    historyTitleText: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.text.title,
        letterSpacing: 1.2,
    },
    streakCardsRow: {
        flexDirection: "row",
        width: "100%",
    },
    streakCardItem: {
        flex: 1,
        minWidth: 0,
    },
    streakCardItemFirst: {
        marginRight: -20,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text.title,
        marginBottom: 16,
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
});
