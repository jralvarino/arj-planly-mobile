import { colors } from "@/theme/colors";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Emoji from "react-native-emoji";
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
}: TodoModalContentProps) {
    return (
        <>
            {isSkipped && (
                <View style={styles.modalSkippedTag}>
                    <Text style={styles.modalSkippedTagText}>skipped</Text>
                </View>
            )}
            {/* Header com Emoji e Título */}
            <View style={styles.modalHeaderContainer}>
                <View style={styles.modalHeader}>
                    <View style={styles.modalEmojiContainer}>
                        {todo.emoji ? (
                            todo.emoji.length <= 2 ? (
                                <Text style={styles.modalEmoji}>{todo.emoji}</Text>
                            ) : (
                                <Emoji name={todo.emoji} style={styles.modalEmoji} />
                            )
                        ) : (
                            <Text style={styles.modalEmoji}>📷</Text>
                        )}
                    </View>
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
                                    stroke="#10B981"
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
        paddingLeft: 12,
        paddingBottom: 9,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    modalEmojiContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    modalEmoji: {
        fontSize: 32,
    },
    modalTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "700",
        color: colors.text.title,
    },
    modalBody: {
        padding: 16,
        paddingTop: 12,
    },
    modalProgressContainer: {
        marginBottom: 10,
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
        color: "#fff",
    },
    progressButtonDisabled: {
        backgroundColor: colors.gray[300],
        opacity: 0.5,
    },
    progressButtonTextDisabled: {
        color: colors.gray[200],
    },
    modalSkippedTag: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "#FBBF24",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        zIndex: 10,
    },
    modalSkippedTagText: {
        color: "black",
        fontSize: 11,
        fontWeight: "600",
    },
});
