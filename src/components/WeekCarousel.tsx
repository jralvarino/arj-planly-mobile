import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCallback, useEffect, useRef } from "react";
import { Animated, FlatList, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { WeekSummary } from "../interfaces/todo/summary.interface";
import { colors } from "../theme/colors";
import { useWeekCarouselViewModel } from "../viewmodels/weekCarousel/useWeekCarouselViewModel";

interface WeekCarouselProps {
    selectedDate: string;
    onDateSelect: (date: string) => void;
    weekSummary: WeekSummary;
    onWeekChange: (startDate: string, endDate: string) => void;
    selectedCategoryId?: string | null;
}

interface DayItemProps {
    item: {
        dateString: string;
        dayName: string;
        dayNumber: string;
        isToday: boolean;
    };
    isComplete: boolean;
    dayColor: string;
    isSelected: boolean;
    onDateSelect: (date: string) => void;
    dayItemWidth: number;
    gapBetweenItems: number;
}

function DayItem({ item, isComplete, dayColor, isSelected, onDateSelect, dayItemWidth, gapBetweenItems }: DayItemProps) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const prevIsCompleteRef = useRef(isComplete);

    useEffect(() => {
        // Detecta quando o troféu aparece (muda de false para true)
        if (isComplete && !prevIsCompleteRef.current) {
            // Reseta os valores
            scaleAnim.setValue(0);
            rotateAnim.setValue(0);

            // Animações em paralelo
            Animated.parallel([
                // Animação de escala com bounce
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
                // Animação de rotação
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

    // Determina se o texto deve ser branco ou escuro baseado na cor de fundo
    const isColoredBackground = dayColor !== colors.gray[100];
    const textColor = isColoredBackground ? "#fff" : colors.text.body;
    const numberColor = isColoredBackground ? "#fff" : colors.text.title;

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "15deg"],
    });

    return (
        <View style={{ alignItems: "center", width: dayItemWidth, marginRight: gapBetweenItems }}>
            <View style={styles.crownContainer}>
                {isComplete ? (
                    <Animated.View
                        style={{
                            transform: [
                                { scale: scaleAnim },
                                { rotate: rotate },
                            ],
                        }}
                    >
                        <MaterialIcons name="emoji-events" size={14} color="#FFD700" />
                    </Animated.View>
                ) : null}
            </View>
            <TouchableOpacity
                style={[
                    styles.dayButton,
                    { 
                        width: dayItemWidth,
                        backgroundColor: dayColor,
                    },
                    item.isToday && !isSelected && styles.dayButtonToday,
                    isSelected && styles.dayButtonSelected,
                ]}
                onPress={() => onDateSelect(item.dateString)}
            >
                <Text style={[styles.dayNameText, { color: textColor }]}>
                    {item.dayName}
                </Text>
                <Text
                    style={[styles.dayNumberText, { color: numberColor }]}
                >
                    {item.dayNumber}
                </Text>
            </TouchableOpacity>
            {item.isToday && (
                <View style={styles.todayIndicator} />
            )}
        </View>
    );
}

export function WeekCarousel({ selectedDate, onDateSelect, weekSummary, onWeekChange, selectedCategoryId }: WeekCarouselProps) {
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
        getDayColor,
    } = useWeekCarouselViewModel({
        selectedDate,
        weekSummary,
        onDateSelect,
        onWeekChange,
        screenWidth,
        selectedCategoryId,
    });

    const renderDayItem = useCallback(
        ({ item }: { item: (typeof daysList)[0] }) => {
            return (
                <DayItem
                    item={item}
                    isComplete={isDayComplete(item.dateString)}
                    dayColor={getDayColor(item.dateString)}
                    isSelected={selectedDate === item.dateString}
                    onDateSelect={onDateSelect}
                    dayItemWidth={dayItemWidth}
                    gapBetweenItems={gapBetweenItems}
                />
            );
        },
        [selectedDate, isDayComplete, getDayColor, onDateSelect, dayItemWidth, gapBetweenItems]
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
        paddingVertical: 3,
        paddingHorizontal: 3,
        backgroundColor: colors.background,
    },
    weekCarouselContent: {
        paddingHorizontal: 0,
    },
    crownContainer: {
        height: 13, // Altura fixa para manter todos os botões alinhados
        justifyContent: "flex-end",
        alignItems: "center",
        marginBottom: 4,
    },
    crownIcon: {
        // Removido marginBottom para evitar desalinhamento
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
        borderWidth: 0,
        borderColor: colors.primary,
    },
    dayButtonSelected: {
        borderWidth: 2,
        borderColor: colors.primary,
        // Adiciona uma sombra para destacar ainda mais quando selecionado
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 5, // Para Android
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
    todayIndicator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.gray[300],
        marginTop: 5,
    },
});
