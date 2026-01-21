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
    selectedCategoryId?: string | null;
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
            const isComplete = isDayComplete(item.dateString);
            const dayColor = getDayColor(item.dateString);
            const isSelected = selectedDate === item.dateString;
            

            
            // Determina se o texto deve ser branco ou escuro baseado na cor de fundo
            // A cor de fundo sempre reflete o progresso, não muda quando selecionado
            const isColoredBackground = dayColor !== colors.gray[100];
            const textColor = isColoredBackground ? "#fff" : colors.text.body;
            const numberColor = isColoredBackground ? "#fff" : colors.text.title;

            return (
                <View style={{ alignItems: "center", width: dayItemWidth, marginRight: gapBetweenItems }}>
                    { (
                        <View style={styles.crownContainer}>
                            {isComplete ? (
                                <MaterialIcons name="emoji-events" size={14} color="#FFD700" />
                            ) : null}
                        </View>
                    )}
                    <TouchableOpacity
                        style={[
                            styles.dayButton,
                            { 
                                width: dayItemWidth,
                                backgroundColor: dayColor, // Sempre usa a cor do progresso
                            },
                            item.isToday && !isSelected && styles.dayButtonToday,
                            isSelected && styles.dayButtonSelected, // Borda destacada quando selecionado
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
