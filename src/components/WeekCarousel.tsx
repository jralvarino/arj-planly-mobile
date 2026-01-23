import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WeekSummary } from "../interfaces/todo/summary.interface";
import { colors } from "../theme/colors";

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
    isComplete: boolean;
    dayColor: string;
    isSelected: boolean;
    isToday: boolean;
    onDateSelect: (date: string) => void;
}

function DayItem({ date, dateString, isComplete, dayColor, isSelected, isToday, onDateSelect }: DayItemProps) {
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

    const weekday = moment(date).format("ddd");
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
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(52); // Começa no índice 52 (semana atual, meio do array)

    // Gera semanas: [-52, ..., -1, 0, 1, ..., 52] semanas a partir de hoje
    const weeks = useMemo(() => {
        const today = moment();
        // Garante que começa na segunda-feira
        const dayOfWeek = today.day(); // 0 = domingo, 1 = segunda, ..., 6 = sábado
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const startOfCurrentWeek = today.clone().subtract(daysToMonday, "days").startOf("day");

        return Array.from({ length: 105 }, (_, i) => {
            const weekOffset = i - 52; // -52 a 52 semanas
            const weekStart = startOfCurrentWeek.clone().add(weekOffset, "weeks");
            return Array.from({ length: 7 }, (_, dayIndex) => {
                const date = weekStart.clone().add(dayIndex, "day");
                return {
                    date: date.toDate(),
                    dateString: date.format("YYYY-MM-DD"),
                    weekday: date.format("ddd"),
                };
            });
        });
    }, []);

    const isDayComplete = useCallback(
        (dateString: string): boolean => {
            const d = weekSummary.find((day) => day.date === dateString);
            if (!d) return false;
            if (selectedCategoryId) {
                const c = d.categories.find((cat) => cat.categoryId === selectedCategoryId);
                return c ? c.done === c.total && c.total > 0 : false;
            }
            return d.total.done === d.total.total && d.total.total > 0;
        },
        [weekSummary, selectedCategoryId]
    );

    const getDayColor = useCallback(
        (dateString: string): string => {
            const d = weekSummary.find((day) => day.date === dateString);
            if (!d) return colors.gray[100];
            let done: number, total: number;
            if (selectedCategoryId) {
                const c = d.categories.find((cat) => cat.categoryId === selectedCategoryId);
                if (!c) return colors.gray[100];
                done = c.done;
                total = c.total;
            } else {
                done = d.total.done;
                total = d.total.total;
            }
            if (total === 0 || done === 0) return colors.gray[100];
            if (done === total && total > 0) return colors.orange.base;
            if (done === 1) return colors.orange.light;
            // Gradiente entre light e base
            const p = (done - 1) / (total - 1);
            const s = { r: 255, g: 237, b: 213 }; // orange.light em RGB
            const e = { r: 255, g: 152, b: 0 }; // orange.base em RGB (aproximado)
            const r = Math.round(s.r + (e.r - s.r) * p);
            const g = Math.round(s.g + (e.g - s.g) * p);
            const b = Math.round(s.b + (e.b - s.b) * p);
            return `rgb(${r}, ${g}, ${b})`;
        },
        [weekSummary, selectedCategoryId]
    );

    const isToday = (date: Date) => moment(date).isSame(moment(), "day");

    // Calcula o range da semana atual para notificar o parent
    useEffect(() => {
        const currentWeek = weeks[currentIndex];
        if (currentWeek && currentWeek.length > 0) {
            const startDate = currentWeek[0].dateString;
            const endDate = currentWeek[6].dateString;
            onWeekChange(startDate, endDate);
        }
    }, [currentIndex, weeks, onWeekChange]);

    // Handler quando o scroll termina
    const handleMomentumScrollEnd = useCallback(
        (event: any) => {
            const offsetX = event.nativeEvent.contentOffset.x;
            const newIndex = Math.round(offsetX / SCREEN_WIDTH);
            setCurrentIndex(newIndex);
        },
        []
    );

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
                                    isComplete={isDayComplete(item.dateString)}
                                    dayColor={getDayColor(item.dateString)}
                                    isSelected={isActive}
                                    isToday={itemIsToday}
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

    // Scroll para a semana atual quando o componente monta
    useEffect(() => {
        if (flatListRef.current && weeks.length > 0) {
            const initialOffset = SCREEN_WIDTH * 52;
            setTimeout(() => {
                flatListRef.current?.scrollToOffset({ offset: initialOffset, animated: false });
            }, 100);
        }
    }, [weeks.length]);

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
