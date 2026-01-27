import { colors } from "@/theme/colors";
import BottomSheetModal, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useHabitDateRangeModalViewModel } from "../../viewmodels/habit/useHabitDateRangeModalViewModel";

interface HabitDateRangeModalProps {
    modalRef: React.RefObject<BottomSheetModal | null>;
    initialValue: string;
    onConfirm: (date: string) => void;
    onDismiss?: () => void;
}

export function HabitDateRangeModal({ modalRef, initialValue, onConfirm, onDismiss }: HabitDateRangeModalProps) {
    const {
        selectedYear,
        selectedMonth,
        selectedDay,
        years,
        months,
        days,
        handleDismiss,
        handleConfirm,
        handleYearSelect,
        handleMonthSelect,
        handleDaySelect,
    } = useHabitDateRangeModalViewModel({
        modalRef,
        initialValue,
        onConfirm,
        onDismiss,
    });

    return (
        <BottomSheetModal
            ref={modalRef}
            index={-1}
            snapPoints={["50%"]}
            enablePanDownToClose={true}
            backgroundStyle={styles.modalBackground}
            handleIndicatorStyle={styles.modalIndicator}
            backdropComponent={(props) => (
                <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} onPress={handleDismiss} />
            )}
        >
            <BottomSheetView style={styles.modalContent}>
                {/* Header */}
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={handleDismiss} style={styles.modalCancelButton}>
                        <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Select Date</Text>
                    <TouchableOpacity onPress={handleConfirm} style={styles.modalDoneButton}>
                        <Text style={styles.modalDoneText}>Done</Text>
                    </TouchableOpacity>
                </View>

                {/* Date Picker */}
                <View style={styles.datePickerContainer}>
                    {/* Year */}
                    <View style={styles.dateColumn}>
                        <Text style={styles.dateColumnLabel}>Year</Text>
                        <ScrollView style={styles.dateScrollView} showsVerticalScrollIndicator={false}>
                            {years.map((year) => {
                                const isSelected = year === selectedYear;
                                return (
                                    <TouchableOpacity
                                        key={year}
                                        onPress={() => handleYearSelect(year)}
                                        style={[styles.dateOption, isSelected && styles.dateOptionSelected]}
                                    >
                                        <Text
                                            style={[styles.dateOptionText, isSelected && styles.dateOptionTextSelected]}
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
                        <ScrollView style={styles.dateScrollView} showsVerticalScrollIndicator={false}>
                            {months.map((month) => {
                                const isSelected = month === selectedMonth;
                                return (
                                    <TouchableOpacity
                                        key={month}
                                        onPress={() => handleMonthSelect(month)}
                                        style={[styles.dateOption, isSelected && styles.dateOptionSelected]}
                                    >
                                        <Text
                                            style={[styles.dateOptionText, isSelected && styles.dateOptionTextSelected]}
                                        >
                                            {month.toString().padStart(2, "0")}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Day */}
                    <View style={styles.dateColumn}>
                        <Text style={styles.dateColumnLabel}>Day</Text>
                        <ScrollView style={styles.dateScrollView} showsVerticalScrollIndicator={false}>
                            {days.map((day) => {
                                const isSelected = day === selectedDay;
                                return (
                                    <TouchableOpacity
                                        key={day}
                                        onPress={() => handleDaySelect(day)}
                                        style={[styles.dateOption, isSelected && styles.dateOptionSelected]}
                                    >
                                        <Text
                                            style={[styles.dateOptionText, isSelected && styles.dateOptionTextSelected]}
                                        >
                                            {day.toString().padStart(2, "0")}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
}

const styles = StyleSheet.create({
    modalBackground: {
        backgroundColor: colors.gray[100],
    },
    modalIndicator: {
        backgroundColor: colors.gray[200],
        width: 40,
        height: 4,
    },
    modalContent: {
        flex: 1,
        padding: 0,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        paddingTop: 0,
    },
    modalCancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    modalCancelText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.primary,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text.title,
        flex: 1,
        textAlign: "center",
    },
    modalDoneButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    modalDoneText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.white,
    },
    datePickerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        marginVertical: 20,
        paddingHorizontal: 20,
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
});
