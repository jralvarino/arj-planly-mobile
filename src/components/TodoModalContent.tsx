import { colors } from "@/theme/colors";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { TODO_STATUS, Todo, TodoStatus } from "../models/Todo";

interface TodoModalContentProps {
    todo: Todo;
    modalStatus: TodoStatus;
    modalProgressValue: string;
    setModalStatus: (status: TodoStatus) => void;
    setModalProgressValue: (value: string) => void;
    isSkipped: boolean;
    isFutureDate: boolean;
    onDecrement: () => void;
    onIncrement: () => void;
    modalProgress: number;
    onClose?: () => void;
}

export function TodoModalContent({
    todo,
    modalStatus,
    modalProgressValue,
    isSkipped,
    isFutureDate,
    onDecrement,
    onIncrement,
    modalProgress,
    onClose,
}: TodoModalContentProps) {
    return (
        <>
            {/* Header com Título */}
            <View style={styles.modalHeaderContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{todo.title}</Text>
                </View>
            </View>

            {/* Conteúdo do Modal */}
            <View style={styles.modalBody}>
                {/* Progress Controls */}
                <View style={styles.modalProgressContainer}>
                    <View style={styles.circularProgressContainer}>
                        <Pressable
                            style={[
                                styles.progressButton,
                                styles.progressButtonLeft,
                                (isSkipped || isFutureDate) && styles.progressButtonDisabled,
                            ]}
                            onPress={onDecrement}
                            disabled={isSkipped || isFutureDate}
                        >
                            <Text
                                style={[
                                    styles.progressButtonText,
                                    (isSkipped || isFutureDate) && styles.progressButtonTextDisabled,
                                ]}
                            >
                                -
                            </Text>
                        </Pressable>
                        <View style={styles.circularProgressWrapper}>
                            <Svg width={120} height={120} style={styles.circularProgressSvg}>
                                <Circle
                                    cx="60"
                                    cy="60"
                                    r="54"
                                    stroke={colors.gray[200]}
                                    strokeWidth="12"
                                    fill="none"
                                />
                                <Circle
                                    cx="60"
                                    cy="60"
                                    r="54"
                                    stroke={colors.success}
                                    strokeWidth="12"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 54}`}
                                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - Math.min(modalProgress, 100) / 100)}`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 60 60)"
                                />
                            </Svg>
                            <View style={styles.circularProgressInner}>
                                <Text style={styles.circularProgressText}>
                                    {modalProgressValue} / {todo.targetValue}
                                </Text>
                                {todo.unit !== "count" && (
                                    <Text style={styles.circularProgressUnit}>{todo.unit}</Text>
                                )}
                            </View>
                        </View>
                        <Pressable
                            style={[
                                styles.progressButton,
                                styles.progressButtonRight,
                                (isSkipped || isFutureDate) && styles.progressButtonDisabled,
                            ]}
                            onPress={onIncrement}
                            disabled={isSkipped || isFutureDate}
                        >
                            <Text
                                style={[
                                    styles.progressButtonText,
                                    (isSkipped || isFutureDate) && styles.progressButtonTextDisabled,
                                ]}
                            >
                                +
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    modalHeaderContainer: {
        padding: 0,
        paddingLeft: 20,
        paddingRight: 12,
        paddingBottom: 0,
        paddingTop: 7,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[100],
        position: "relative",
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text.title,
        textAlign: "center",
    },
    modalBody: {
        padding: 16,
        paddingTop: 0,
    },
    modalProgressContainer: {
        marginBottom: 30,
    },
    circularProgressContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 16,
        marginBottom: 8,
        gap: 16,
    },
    circularProgressWrapper: {
        width: 120,
        height: 120,
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
    },
    circularProgressSvg: {
        position: "absolute",
    },
    circularProgressInner: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
    circularProgressText: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.text.title,
        textAlign: "center",
    },
    circularProgressUnit: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.text.body,
        marginTop: 2,
    },
    progressButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    progressButtonLeft: {
        marginRight: 0,
    },
    progressButtonRight: {
        marginLeft: 0,
    },
    progressButtonText: {
        fontSize: 24,
        fontWeight: "700",
        color: colors.white,
    },
    progressButtonDisabled: {
        backgroundColor: colors.gray[300],
        opacity: 0.5,
    },
    progressButtonTextDisabled: {
        color: colors.gray[200],
    },
});
