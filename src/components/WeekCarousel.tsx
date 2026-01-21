import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCallback } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { WeekSummary } from "../interfaces/todo/summary.interface";
import { colors } from "../theme/colors";
import { useWeekCarouselViewModel } from "../viewmodels/weekCarousel/useWeekCarouselViewModel";

interface WeekCarouselProps {
    selectedDate: string;
    onDateSelect: (date: string) => void;
    weekSummary: WeekSummary;
    onWeekChange: (startDate: string, endDate: string) => void;
}

export function WeekCarousel({ selectedDate, onDateSelect, weekSummary, onWeekChange }: WeekCarouselProps) {
    const { width: screenWidth } = useWindowDimensions();

    const {
        daysList,
        weekDaysListRef,
        hasScrolledToWeek,
        dayItemWidth,
        itemWidthWithGap,
        weekWidth,
        gapBetweenItems,
        scrollToCurrentWeek,
        handleScroll,
        handleScrollEnd,
        isDayComplete,
    } = useWeekCarouselViewModel({
        selectedDate,
        weekSummary,
        onDateSelect,
        onWeekChange,
        screenWidth,
    });

    const renderDayItem = useCallback(
        ({ item }: { item: (typeof daysList)[0] }) => {
            const isComplete = isDayComplete(item.dateString);

            return (
                <View style={{ alignItems: "center", width: dayItemWidth, marginRight: gapBetweenItems }}>
                    {isComplete && (
                        <MaterialIcons name="emoji-events" size={14} color="#FFD700" style={styles.crownIcon} />
                    )}
                    <TouchableOpacity
                        style={[
                            styles.dayButton,
                            { width: dayItemWidth },
                            selectedDate === item.dateString && styles.dayButtonActive,
                            item.isToday && styles.dayButtonToday,
                        ]}
                        onPress={() => onDateSelect(item.dateString)}
                    >
                        <Text style={[styles.dayNameText, selectedDate === item.dateString && styles.dayNameTextActive]}>
                            {item.dayName}
                        </Text>
                        <Text
                            style={[styles.dayNumberText, selectedDate === item.dateString && styles.dayNumberTextActive]}
                        >
                            {item.dayNumber}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        },
        [selectedDate, isDayComplete, onDateSelect, dayItemWidth, gapBetweenItems]
    );

    return (
        <View style={styles.weekCarouselContainer}>
            <FlatList
                ref={weekDaysListRef}
                data={daysList}
                renderItem={renderDayItem}
                keyExtractor={(item) => item.dateString}
                horizontal
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                onMomentumScrollEnd={handleScrollEnd}
                scrollEventThrottle={16}
                snapToInterval={weekWidth}
                snapToAlignment="start"
                decelerationRate="fast"
                onLayout={() => {
                    if (!hasScrolledToWeek.current) {
                        setTimeout(() => {
                            scrollToCurrentWeek();
                        }, 100);
                    }
                }}
                onContentSizeChange={() => {
                    if (!hasScrolledToWeek.current && daysList.length > 0) {
                        setTimeout(() => {
                            scrollToCurrentWeek();
                        }, 150);
                    }
                }}
                getItemLayout={(data, index) => ({
                    length: itemWidthWithGap,
                    offset: itemWidthWithGap * index,
                    index,
                })}
                onScrollToIndexFailed={(info) => {
                    const offset = info.index * itemWidthWithGap;
                    setTimeout(() => {
                        weekDaysListRef.current?.scrollToOffset({
                            offset: offset,
                            animated: false,
                        });
                    }, 100);
                }}
                contentContainerStyle={styles.weekCarouselContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    weekCarouselContainer: {
        paddingVertical: 12,
        paddingHorizontal: 3,
        backgroundColor: colors.background,
    },
    weekCarouselContent: {
        paddingHorizontal: 0,
    },
    crownIcon: {
        marginBottom: 4,
    },
    dayButton: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 1,
        borderRadius: 12,
        backgroundColor: colors.gray[100],
    },
    dayButtonActive: {
        backgroundColor: colors.primary,
    },
    dayButtonToday: {
        borderWidth: 2,
        borderColor: colors.primary,
    },
    dayNameText: {
        fontSize: 11,
        fontWeight: "600",
        color: colors.text.body,
        marginBottom: 4,
    },
    dayNameTextActive: {
        color: "#fff",
    },
    dayNumberText: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.text.title,
    },
    dayNumberTextActive: {
        color: "#fff",
    },
});
