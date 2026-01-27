import { colors } from "@/theme/colors";
import BottomSheetModal, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { UnitType } from "@/utils/constants";
import { useHabitGoalModalViewModel } from "../../viewmodels/habit/useHabitGoalModalViewModel";

interface HabitGoalModalProps {
    modalRef: React.RefObject<BottomSheetModal | null>;
    initialValue: string;
    initialUnit: UnitType;
    onConfirm: (value: string, unit: UnitType) => void;
    onDismiss?: () => void;
}

export function HabitGoalModal({ modalRef, initialValue, initialUnit, onConfirm, onDismiss }: HabitGoalModalProps) {
    const {
        selectedQuantityIndex,
        selectedUnitIndex,
        quantities,
        units,
        handleDismiss,
        handleConfirm,
        handleQuantitySelect,
        handleUnitSelect,
    } = useHabitGoalModalViewModel({
        modalRef,
        initialValue,
        initialUnit,
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
                <BottomSheetBackdrop
                    {...props}
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    onPress={handleDismiss}
                />
            )}
        >
            <BottomSheetView style={styles.modalContent}>
                {/* Header */}
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={handleDismiss} style={styles.modalCancelButton}>
                        <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Set Goal</Text>
                    <TouchableOpacity onPress={handleConfirm} style={styles.modalDoneButton}>
                        <Text style={styles.modalDoneText}>Done</Text>
                    </TouchableOpacity>
                </View>

                {/* Picker */}
                <View style={styles.pickerContainer}>
                    {/* Quantity Picker */}
                    <View style={styles.pickerColumn}>
                        <Text style={styles.pickerColumnLabel}>Quantity</Text>
                        <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                            {quantities.map((quantity) => {
                                const isSelected = quantity - 1 === selectedQuantityIndex;
                                return (
                                    <TouchableOpacity
                                        key={quantity}
                                        onPress={() => handleQuantitySelect(quantity)}
                                        style={[styles.pickerOption, isSelected && styles.pickerOptionSelected]}
                                    >
                                        <Text
                                            style={[styles.pickerOptionText, isSelected && styles.pickerOptionTextSelected]}
                                        >
                                            {quantity.toString()}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Unit Picker */}
                    <View style={styles.pickerColumn}>
                        <Text style={styles.pickerColumnLabel}>Unit</Text>
                        <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                            {units.map((unit, index) => {
                                const isSelected = index === selectedUnitIndex;
                                return (
                                    <TouchableOpacity
                                        key={unit.code}
                                        onPress={() => handleUnitSelect(index)}
                                        style={[styles.pickerOption, isSelected && styles.pickerOptionSelected]}
                                    >
                                        <Text
                                            style={[styles.pickerOptionText, isSelected && styles.pickerOptionTextSelected]}
                                        >
                                            {unit.label}
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
    pickerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        marginVertical: 20,
        paddingHorizontal: 20,
    },
    pickerColumn: {
        flex: 1,
        alignItems: "center",
    },
    pickerColumnLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text.body,
        marginBottom: 8,
    },
    pickerScrollView: {
        maxHeight: 200,
        width: "100%",
    },
    pickerOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginVertical: 2,
        backgroundColor: colors.gray[100],
        alignItems: "center",
        justifyContent: "center",
    },
    pickerOptionSelected: {
        backgroundColor: colors.primary,
    },
    pickerOptionText: {
        fontSize: 16,
        fontWeight: "500",
        color: colors.text.title,
    },
    pickerOptionTextSelected: {
        color: colors.white,
        fontWeight: "600",
    },
});
