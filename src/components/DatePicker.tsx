import { colors } from "@/theme/colors";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DatePickerProps {
    visible: boolean;
    value: string; // Format: "YYYY-MM-DD"
    onClose: () => void;
    onConfirm: (date: string) => void;
}

export function DatePicker({ visible, value, onClose, onConfirm }: DatePickerProps) {
    // Use current date if no value provided
    const parsedDate = value ? moment(value, "YYYY-MM-DD") : moment();
    const [selectedYear, setSelectedYear] = useState(parsedDate.year());
    const [selectedMonth, setSelectedMonth] = useState(parsedDate.month() + 1); // moment months are 0-indexed
    const [selectedDay, setSelectedDay] = useState(parsedDate.date());

    // Refs for ScrollViews
    const yearScrollRef = useRef<ScrollView>(null);
    const monthScrollRef = useRef<ScrollView>(null);
    const dayScrollRef = useRef<ScrollView>(null);

    // Generate arrays for years (starting from 2026, up to current year + 10), months (1-12), days (1-31)
    const currentYear = moment().year();
    const minYear = 2026;
    const maxYear = currentYear + 10;
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    // Update state when modal opens or value changes
    useEffect(() => {
        if (visible) {
            // Always use current date if no value provided (for new habits)
            const dateToUse = value || moment().format("YYYY-MM-DD");
            const parsed = moment(dateToUse, "YYYY-MM-DD");
            setSelectedYear(parsed.year());
            setSelectedMonth(parsed.month() + 1);
            setSelectedDay(parsed.date());

            // Scroll to selected items after a short delay to ensure layout is complete
            setTimeout(() => {
                const yearIndex = years.indexOf(parsed.year());
                const monthIndex = months.indexOf(parsed.month() + 1);
                const dayIndex = days.indexOf(parsed.date());

                // Calculate scroll position based on item height (50px) and margin (2px * 2 = 4px)
                const itemHeight = 50;
                const scrollOffset = itemHeight * 0.5; // Center the selected item

                if (yearIndex >= 0 && yearScrollRef.current) {
                    yearScrollRef.current.scrollTo({ y: yearIndex * itemHeight - scrollOffset, animated: true });
                }
                if (monthIndex >= 0 && monthScrollRef.current) {
                    monthScrollRef.current.scrollTo({ y: monthIndex * itemHeight - scrollOffset, animated: true });
                }
                if (dayIndex >= 0 && dayScrollRef.current) {
                    dayScrollRef.current.scrollTo({ y: dayIndex * itemHeight - scrollOffset, animated: true });
                }
            }, 150);
        }
    }, [visible, value]);

    const handleConfirm = () => {
        const formattedDate = moment({
            year: selectedYear,
            month: selectedMonth - 1,
            day: selectedDay,
        }).format("YYYY-MM-DD");
        onConfirm(formattedDate);
        onClose();
    };

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Date</Text>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                            <Text style={styles.modalCloseText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.datePickerContainer}>
                        {/* Year */}
                        <View style={styles.dateColumn}>
                            <Text style={styles.dateColumnLabel}>Year</Text>
                            <ScrollView
                                ref={yearScrollRef}
                                style={styles.dateScrollView}
                                showsVerticalScrollIndicator={false}
                            >
                                {years.map((year) => {
                                    const isSelected = year === selectedYear;
                                    return (
                                        <TouchableOpacity
                                            key={year}
                                            onPress={() => setSelectedYear(year)}
                                            style={[styles.dateOption, isSelected && styles.dateOptionSelected]}
                                        >
                                            <Text
                                                style={[
                                                    styles.dateOptionText,
                                                    isSelected && styles.dateOptionTextSelected,
                                                ]}
                                            >
                                                {year}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        {/* Month */}
                        <View style={styles.dateColumn}>
                            <Text style={styles.dateColumnLabel}>Month</Text>
                            <ScrollView
                                ref={monthScrollRef}
                                style={styles.dateScrollView}
                                showsVerticalScrollIndicator={false}
                            >
                                {months.map((month) => {
                                    const isSelected = month === selectedMonth;
                                    return (
                                        <TouchableOpacity
                                            key={month}
                                            onPress={() => setSelectedMonth(month)}
                                            style={[styles.dateOption, isSelected && styles.dateOptionSelected]}
                                        >
                                            <Text
                                                style={[
                                                    styles.dateOptionText,
                                                    isSelected && styles.dateOptionTextSelected,
                                                ]}
                                            >
                                                {moment()
                                                    .month(month - 1)
                                                    .format("MMM")}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        {/* Day */}
                        <View style={styles.dateColumn}>
                            <Text style={styles.dateColumnLabel}>Day</Text>
                            <ScrollView
                                ref={dayScrollRef}
                                style={styles.dateScrollView}
                                showsVerticalScrollIndicator={false}
                            >
                                {days.map((day) => {
                                    const isSelected = day === selectedDay;
                                    return (
                                        <TouchableOpacity
                                            key={day}
                                            onPress={() => setSelectedDay(day)}
                                            style={[styles.dateOption, isSelected && styles.dateOptionSelected]}
                                        >
                                            <Text
                                                style={[
                                                    styles.dateOptionText,
                                                    isSelected && styles.dateOptionTextSelected,
                                                ]}
                                            >
                                                {day}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.modalSaveButton} onPress={handleConfirm}>
                        <Text style={styles.modalSaveButtonText}>Confirm</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.overlay.black,
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        width: "90%",
        maxWidth: 500,
        ...Platform.select({
            ios: {
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.text.title,
    },
    modalCloseButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.gray[100],
        alignItems: "center",
        justifyContent: "center",
    },
    modalCloseText: {
        fontSize: 18,
        color: colors.text.body,
        fontWeight: "600",
    },
    datePickerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        marginVertical: 20,
    },
    dateColumn: {
        flex: 1,
        alignItems: "center",
    },
    dateColumnLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text.body,
        marginBottom: 8,
    },
    dateScrollView: {
        maxHeight: 200,
        width: "100%",
    },
    dateOption: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginVertical: 2,
        backgroundColor: colors.gray[100],
        alignItems: "center",
        justifyContent: "center",
        minHeight: 50,
    },
    dateOptionSelected: {
        backgroundColor: colors.primary,
    },
    dateOptionText: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.text.title,
    },
    dateOptionTextSelected: {
        color: colors.white,
        fontWeight: "600",
    },
    modalSaveButton: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },
    modalSaveButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
});
