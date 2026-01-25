import { colors } from "@/theme/colors";
import React, { useState } from "react";
import {
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface TimePickerProps {
    visible: boolean;
    value: string; // Format: "HH:MM"
    onClose: () => void;
    onConfirm: (time: string) => void;
}

export function TimePicker({ visible, value, onClose, onConfirm }: TimePickerProps) {
    // Parse current value or default to 09:00
    const [selectedHour, setSelectedHour] = useState(() => {
        if (value && value.includes(":")) {
            return parseInt(value.split(":")[0], 10) || 9;
        }
        return 9;
    });

    const [selectedMinute, setSelectedMinute] = useState(() => {
        if (value && value.includes(":")) {
            return parseInt(value.split(":")[1], 10) || 0;
        }
        return 0;
    });

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    const handleConfirm = () => {
        const formattedTime = `${selectedHour.toString().padStart(2, "0")}:${selectedMinute.toString().padStart(2, "0")}`;
        onConfirm(formattedTime);
        onClose();
    };

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Time</Text>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                            <Text style={styles.modalCloseText}>✕</Text>
                        </TouchableOpacity>
                    </View>

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
                                            onPress={() => setSelectedHour(hour)}
                                            style={[styles.timeOption, isSelected && styles.timeOptionSelected]}
                                        >
                                            <Text
                                                style={[
                                                    styles.timeOptionText,
                                                    isSelected && styles.timeOptionTextSelected,
                                                ]}
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
                                            onPress={() => setSelectedMinute(minute)}
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
        width: "85%",
        maxWidth: 400,
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
    timePickerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        marginVertical: 20,
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
