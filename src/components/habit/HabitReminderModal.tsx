import { colors } from "@/theme/colors";
import BottomSheetModal, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useHabitReminderModalViewModel } from "../../viewmodels/habit/useHabitReminderModalViewModel";

interface HabitReminderModalProps {
    modalRef: React.RefObject<BottomSheetModal | null>;
    initialValue: string;
    onConfirm: (time: string) => void;
    onDismiss?: () => void;
}

export function HabitReminderModal({ modalRef, initialValue, onConfirm, onDismiss }: HabitReminderModalProps) {
    const {
        selectedHour,
        selectedMinute,
        hours,
        minutes,
        handleDismiss,
        handleConfirm,
        handleHourSelect,
        handleMinuteSelect,
    } = useHabitReminderModalViewModel({
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
                    <Text style={styles.modalTitle}>Select Time</Text>
                    <TouchableOpacity onPress={handleConfirm} style={styles.modalDoneButton}>
                        <Text style={styles.modalDoneText}>Done</Text>
                    </TouchableOpacity>
                </View>

                {/* Time Picker */}
                <View style={styles.timePickerContainer}>
                    {/* Hours */}
                    <View style={styles.timeColumn}>
                        <Text style={styles.timeColumnLabel}>Hour</Text>
                        <ScrollView style={styles.timeScrollView} showsVerticalScrollIndicator={false}>
                            {hours.map((hour) => {
                                const isSelected = hour === selectedHour;
                                return (
                                    <TouchableOpacity
                                        key={hour}
                                        onPress={() => handleHourSelect(hour)}
                                        style={[styles.timeOption, isSelected && styles.timeOptionSelected]}
                                    >
                                        <Text
                                            style={[styles.timeOptionText, isSelected && styles.timeOptionTextSelected]}
                                        >
                                            {hour.toString().padStart(2, "0")}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    <Text style={styles.timeSeparator}>:</Text>

                    {/* Minutes */}
                    <View style={styles.timeColumn}>
                        <Text style={styles.timeColumnLabel}>Minute</Text>
                        <ScrollView style={styles.timeScrollView} showsVerticalScrollIndicator={false}>
                            {minutes.map((minute) => {
                                const isSelected = minute === selectedMinute;
                                return (
                                    <TouchableOpacity
                                        key={minute}
                                        onPress={() => handleMinuteSelect(minute)}
                                        style={[styles.timeOption, isSelected && styles.timeOptionSelected]}
                                    >
                                        <Text
                                            style={[
                                                styles.timeOptionText,
                                                isSelected && styles.timeOptionTextSelected,
                                            ]}
                                        >
                                            {minute.toString().padStart(2, "0")}
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
    timePickerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        marginVertical: 20,
        paddingHorizontal: 20,
    },
    timeColumn: {
        flex: 1,
        alignItems: "center",
    },
    timeColumnLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text.body,
        marginBottom: 8,
    },
    timeScrollView: {
        maxHeight: 200,
        width: "100%",
    },
    timeOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginVertical: 2,
        backgroundColor: colors.gray[100],
        alignItems: "center",
        justifyContent: "center",
    },
    timeOptionSelected: {
        backgroundColor: colors.primary,
    },
    timeOptionText: {
        fontSize: 16,
        fontWeight: "500",
        color: colors.text.title,
    },
    timeOptionTextSelected: {
        color: colors.white,
        fontWeight: "600",
    },
    timeSeparator: {
        fontSize: 32,
        fontWeight: "700",
        color: colors.text.title,
        marginTop: 30,
    },
});
