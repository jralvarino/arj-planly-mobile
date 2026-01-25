import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import moment from "moment";
import React, { useCallback, useEffect, useRef } from "react";
import { Animated, Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WeekSummary } from "../interfaces/todo/summary.interface";
import { colors } from "../theme/colors";
import { useWeekCarouselViewModel } from "../viewmodels/weekCarousel/useWeekCarouselViewModel";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PADDING_HORIZONTAL = 6; // 3 de cada lado
const GAP_BETWEEN_ITEMS = 5;
const TOTAL_GAPS = GAP_BETWEEN_ITEMS * 6; // 6 gaps entre 7 itens
const DAY_ITEM_WIDTH = (SCREEN_WIDTH - PADDING_HORIZONTAL - TOTAL_GAPS) / 7;

interface WeekCarouselProps {
    selectedDate: string;
    onDateSelect: (date: string) => void;
    weekSummary: WeekSummary;
    onWeekChange: (startDate: string, endDate: string) => void;
    selectedCategoryId?: string | null;
}

interface DayItemProps {
    date: Date;
    dateString: string;
    weekday: string;
    isComplete: boolean;
    dayColor: string;
    isSelected: boolean;
    onDateSelect: (date: string) => void;
}

function DayItem({ date, dateString, weekday, isComplete, dayColor, isSelected, onDateSelect }: DayItemProps) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const prevIsCompleteRef = useRef(isComplete);

    useEffect(() => {
        // Detecta quando o troféu aparece (muda de false para true)
        if (isComplete && !prevIsCompleteRef.current) {
            scaleAnim.setValue(0);
            rotateAnim.setValue(0);

            Animated.parallel([
                Animated.sequence([
                    Animated.spring(scaleAnim, {
                        toValue: 1.3,
                        friction: 3,
                        tension: 40,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scaleAnim, {
                        toValue: 1,
                        friction: 4,
                        tension: 40,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(rotateAnim, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateAnim, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        }
        prevIsCompleteRef.current = isComplete;
    }, [isComplete, scaleAnim, rotateAnim]);

    const isLightBackground = dayColor === colors.orange.light || dayColor === colors.gray[100];
    const textColor = isLightBackground ? colors.text.body : colors.white;
    const numberColor = isLightBackground ? colors.text.title : colors.white;

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "15deg"],
    });

    const dayNumber = moment(date).format("D");

    return (
        <>
            <View style={styles.crownContainer}>
                {isComplete ? (
                    <Animated.View
                        style={{
                            transform: [{ scale: scaleAnim }, { rotate: rotate }],
                        }}
                    >
                        <MaterialIcons name="emoji-events" size={14} color={colors.gold} />
                    </Animated.View>
                ) : null}
            </View>
            <TouchableOpacity
                style={[
                    styles.item,
                    {
                        backgroundColor: dayColor,
                        borderColor: isSelected ? colors.orange.border : dayColor,
                    },
                    isSelected && styles.itemSelected,
                ]}
                onPress={() => onDateSelect(dateString)}
            >
                <Text style={[styles.itemWeekday, { color: textColor }]}>{weekday}</Text>
                <Text style={[styles.itemDate, { color: numberColor }]}>{dayNumber}</Text>
            </TouchableOpacity>
        </>
    );
}

export function WeekCarousel({
    selectedDate,
    onDateSelect,
    weekSummary,
    onWeekChange,
    selectedCategoryId,
}: WeekCarouselProps) {
    const {
        weeks,
        flatListRef,
        isDayComplete,
        getDayColor,
        isToday,
        handleMomentumScrollEnd,
    } = useWeekCarouselViewModel({
        weekSummary,
        onWeekChange,
        selectedCategoryId,
    });

    // Renderiza uma semana
    const renderWeek = useCallback(
        ({ item: weekDays }: { item: typeof weeks[0] }) => {
            return (
                <View style={styles.itemRow}>
                    {weekDays.map((item, dateIndex) => {
                        const isActive = selectedDate === item.dateString;
                        const isLast = dateIndex === weekDays.length - 1;
                        const itemIsToday = isToday(item.date);
                        return (
                            <View
                                key={dateIndex}
                                style={[
                                    styles.itemContainer,
                                    isLast && { marginRight: 0 },
                                ]}
                            >
                                <DayItem
                                    date={item.date}
                                    dateString={item.dateString}
                                    weekday={item.weekday}
                                    isComplete={isDayComplete(item.dateString)}
                                    dayColor={getDayColor(item.dateString)}
                                    isSelected={isActive}
                                    onDateSelect={onDateSelect}
                                />
                                {itemIsToday && <View style={styles.todayIndicator} />}
                            </View>
                        );
                    })}
                </View>
            );
        },
        [selectedDate, isDayComplete, getDayColor, onDateSelect, isToday]
    );

    return (
        <View style={styles.picker}>
            <FlatList
                ref={flatListRef}
                data={weeks}
                renderItem={renderWeek}
                keyExtractor={(_, index) => `week-${index}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                getItemLayout={(_, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index,
                })}
                initialNumToRender={3}
                windowSize={5}
                removeClippedSubviews={false}
                onScrollToIndexFailed={(info) => {
                    // Fallback se o scroll falhar
                    setTimeout(() => {
                        flatListRef.current?.scrollToOffset({ offset: SCREEN_WIDTH * 52, animated: false });
                    }, 100);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    picker: {
        height: 100,
        paddingTop: 5,
        paddingBottom: 2,
        marginBottom: 0,
        backgroundColor: colors.background,
    },
    itemContainer: {
        position: "relative",
        width: DAY_ITEM_WIDTH,
        alignItems: "center",
        marginRight: GAP_BETWEEN_ITEMS,
    },
    itemRow: {
        width: SCREEN_WIDTH,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        paddingHorizontal: 3,
        height: 80,
    },
    crownContainer: {
        height: 13,
        justifyContent: "flex-end",
        alignItems: "center",
        marginBottom: 4,
    },
    item: {
        position: "relative",
        width: "100%",
        height: 53,
        paddingVertical: 6,
        paddingHorizontal: 4,
        borderWidth: 1,
        borderRadius: 8,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    itemSelected: {
        borderWidth: 2,
        borderColor: colors.orange.border,
        shadowColor: colors.orange.border,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 8,
    },
    todayIndicator: {
        position: "absolute",
        top: 77, // Abaixo do item (altura do item 52 + margin do crown 8)
        alignSelf: "center",
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.gray[300],
    },
    itemWeekday: {
        fontSize: 11,
        fontWeight: "600",
        marginBottom: 4,
    },
    itemDate: {
        fontSize: 16,
        fontWeight: "700",
    },
});
