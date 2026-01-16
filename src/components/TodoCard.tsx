import { colors } from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Emoji from "react-native-emoji";
import { Swipeable } from "react-native-gesture-handler";
import { Category } from "../models/Category";
import { TODO_STATUS, Todo, TodoStatus } from "../models/Todo";
import { makeColorStronger } from "../utils/colorUtils";

interface TodoCardProps {
    todo: Todo;
    categories?: Category[];
    onToggle?: (todoId: string, currentStatus: TodoStatus, progressValue: string, notes: string) => void;
    onSkip?: (
        todoId: string,
        todoTitle: string,
        currentStatus: TodoStatus,
        progressValue: string,
        notes: string
    ) => void;
    onSave?: (todoId: string, status: TodoStatus, progressValue: string, notes: string) => void;
    onPlayCompletionSound?: () => void;
}

export function TodoCard({ todo, categories = [], onToggle, onSkip, onSave, onPlayCompletionSound }: TodoCardProps) {
    const swipeableRef = useRef<Swipeable>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalStatus, setModalStatus] = useState<TodoStatus>(todo.status);
    const [modalProgressValue, setModalProgressValue] = useState(todo.progressValue);
    const [modalNotes, setModalNotes] = useState(todo.notes || "");
    const [showNotes, setShowNotes] = useState(false);

    const progress = todo.targetValue
        ? (parseFloat(todo.progressValue || "0") / parseFloat(todo.targetValue)) * 100
        : 0;

    const modalProgress = todo.targetValue
        ? (parseFloat(modalProgressValue || "0") / parseFloat(todo.targetValue)) * 100
        : 0;

    const isDone = todo.status === TODO_STATUS.DONE;
    const isSkipped = todo.status === TODO_STATUS.SKIPPED;
    const category = categories.find((cat) => cat.id === todo.categoryId);

    // Usa cor mais forte quando o Todo está concluído
    const cardColor = isDone ? makeColorStronger(todo.color) : todo.color;

    const handleOpenModal = () => {
        setModalStatus(todo.status);
        setModalProgressValue(todo.progressValue);
        setModalNotes(todo.notes || "");
        setShowNotes(!!todo.notes);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        // Reset to original values
        setModalStatus(todo.status);
        setModalProgressValue(todo.progressValue);
        setModalNotes(todo.notes || "");
    };

    const handleSave = () => {
        onSave?.(todo.id, modalStatus, modalProgressValue, modalNotes);
        setModalVisible(false);
    };

    const handleProgressChange = (value: string) => {
        const numValue = parseFloat(value) || 0;
        const maxValue = parseFloat(todo.targetValue) || 1;
        const clampedValue = Math.min(Math.max(0, numValue), maxValue).toString();
        setModalProgressValue(clampedValue);
    };

    const handleDecrementProgress = () => {
        const numValue = parseFloat(modalProgressValue) || 0;
        const newValue = Math.max(0, numValue - 1).toString();
        setModalProgressValue(newValue);

        // Se estava done mas não está mais no máximo, volta para pending e reseta progressValue
        if (modalStatus === TODO_STATUS.DONE && newValue !== todo.targetValue) {
            setModalStatus(TODO_STATUS.PENDING);
            setModalProgressValue("0");
        }
    };

    const handleIncrementProgress = () => {
        const numValue = parseFloat(modalProgressValue) || 0;
        const maxValue = parseFloat(todo.targetValue) || 1;
        const newValue = Math.min(maxValue, numValue + 1).toString();
        setModalProgressValue(newValue);

        // Se atingir o valor máximo, define status como done e toca som
        if (newValue === todo.targetValue) {
            setModalStatus(TODO_STATUS.DONE);
        }
    };

    const handleSkip = () => {
        onSkip?.(todo.id, todo.title, todo.status, todo.progressValue, todo.notes || "");
        swipeableRef.current?.close();
    };

    const renderRightActions = () => {
        const isSkippedStatus = todo.status === TODO_STATUS.SKIPPED;
        return (
            <View style={styles.rightAction}>
                <Pressable style={styles.skipButton} onPress={handleSkip}>
                    <Ionicons
                        name={isSkippedStatus ? "play-back-outline" : "play-forward-outline"}
                        size={24}
                        color="#000"
                    />
                    <Text style={styles.skipButtonText}>{isSkippedStatus ? "Undo" : "Skip"}</Text>
                </Pressable>
            </View>
        );
    };

    return (
        <>
            <Swipeable ref={swipeableRef} renderRightActions={renderRightActions}>
                <Pressable onPress={handleOpenModal}>
                    <View style={[styles.card, { backgroundColor: cardColor, borderLeftColor: cardColor }]}>
                        <View style={styles.header}>
                            <View style={styles.emojiContainer}>
                                {todo.emoji ? (
                                    todo.emoji.length <= 2 ? (
                                        <Text style={styles.emoji}>{todo.emoji}</Text>
                                    ) : (
                                        <Emoji name={todo.emoji} style={styles.emoji} />
                                    )
                                ) : (
                                    <Text style={styles.emoji}>📷</Text>
                                )}
                            </View>
                            <View style={styles.titleContainer}>
                                <Text style={[styles.title, (isDone || isSkipped) && styles.titleDone]}>
                                    {todo.title}
                                </Text>
                                <View style={styles.tagsContainer}>
                                    <View style={styles.tag}>
                                        <Text style={styles.tagText}>
                                            {todo.progressValue} / {todo.targetValue}
                                            {todo.unit !== "count" ? ` ${todo.unit}` : ""}
                                        </Text>
                                    </View>
                                    {category && (
                                        <View style={styles.tag}>
                                            <Text style={styles.tagText}>{category.name}</Text>
                                        </View>
                                    )}
                                    {todo.period && (
                                        <View style={styles.tag}>
                                            <Text style={styles.tagText}>{todo.period}</Text>
                                        </View>
                                    )}
                                    {isSkipped && (
                                        <View style={styles.skippedTag}>
                                            <Text style={styles.skippedTagText}>skipped</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                            <Pressable
                                onPress={() => onToggle?.(todo.id, todo.status, todo.progressValue, todo.notes || "")}
                                style={[styles.checkButton, isDone && styles.checkButtonDone]}
                                disabled={isSkipped}
                            >
                                <Ionicons
                                    name={
                                        isSkipped
                                            ? "play-forward-outline"
                                            : isDone
                                              ? "checkmark-circle"
                                              : "checkmark-circle-outline"
                                    }
                                    size={28}
                                    color={isSkipped ? "#FBBF24" : isDone ? "#10B981" : colors.gray[300]}
                                />
                            </Pressable>
                        </View>
                        <View style={styles.details}>
                            {todo.targetValue !== "1" && (
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressBarContainer}>
                                        <View style={styles.progressBarBackground}>
                                            <View
                                                style={[
                                                    styles.progressBarFill,
                                                    { width: `${Math.min(progress, 100)}%` },
                                                ]}
                                            />
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                </Pressable>
            </Swipeable>

            <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={handleCloseModal}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {isSkipped && (
                            <View style={styles.modalSkippedTag}>
                                <Text style={styles.modalSkippedTagText}>skipped</Text>
                            </View>
                        )}
                        <Text style={styles.modalTitle}>{todo.title}</Text>

                        {/* Progress Controls */}
                        <View style={styles.modalProgressContainer}>
                            <View style={styles.progressControls}>
                                <Pressable
                                    style={[styles.progressButton, isSkipped && styles.progressButtonDisabled]}
                                    onPress={handleDecrementProgress}
                                    disabled={isSkipped}
                                >
                                    <Text
                                        style={[
                                            styles.progressButtonText,
                                            isSkipped && styles.progressButtonTextDisabled,
                                        ]}
                                    >
                                        -
                                    </Text>
                                </Pressable>
                                <View style={styles.progressValueContainer}>
                                    <Text style={styles.progressValueText}>{modalProgressValue}</Text>
                                </View>
                                <Pressable
                                    style={[styles.progressButton, isSkipped && styles.progressButtonDisabled]}
                                    onPress={handleIncrementProgress}
                                    disabled={isSkipped}
                                >
                                    <Text
                                        style={[
                                            styles.progressButtonText,
                                            isSkipped && styles.progressButtonTextDisabled,
                                        ]}
                                    >
                                        +
                                    </Text>
                                </Pressable>
                            </View>
                            <Text style={styles.modalProgressLabel}>
                                Progress: {modalProgressValue} / {todo.targetValue}
                                {todo.unit !== "count" ? ` ${todo.unit}` : ""}
                            </Text>
                            <View style={styles.modalProgressBarBackground}>
                                <View
                                    style={[styles.modalProgressBarFill, { width: `${Math.min(modalProgress, 100)}%` }]}
                                />
                            </View>
                        </View>

                        {/* Notes */}
                        <View style={styles.modalNotesContainer}>
                            <Pressable style={styles.notesToggleButton} onPress={() => setShowNotes(!showNotes)}>
                                <Ionicons
                                    name={showNotes ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color={colors.text.body}
                                />
                                <Text style={styles.notesToggleText}>{showNotes ? "Hide Notes" : "Add Notes"}</Text>
                            </Pressable>
                            {showNotes && (
                                <TextInput
                                    style={styles.modalNotesInput}
                                    value={modalNotes}
                                    onChangeText={setModalNotes}
                                    multiline
                                    numberOfLines={4}
                                    placeholder="Add notes..."
                                />
                            )}
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.modalActions}>
                            <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={handleCloseModal}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, styles.saveButton, isSkipped && styles.saveButtonDisabled]}
                                onPress={handleSave}
                                disabled={isSkipped}
                            >
                                <Text style={[styles.saveButtonText, isSkipped && styles.saveButtonTextDisabled]}>
                                    Save
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        position: "relative",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    emojiContainer: {
        marginRight: 12,
    },
    emoji: {
        fontSize: 32,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text.title,
        marginBottom: 2,
    },
    titleDone: {
        textDecorationLine: "line-through",
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
        marginTop: 2,
    },
    metaContainer: {
        position: "absolute",
        top: 8,
        right: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        zIndex: 10,
    },
    tag: {
        backgroundColor: colors.gray[100],
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 7,
    },
    tagText: {
        fontSize: 11,
        fontWeight: "500",
        color: colors.text.body,
    },
    details: {
        gap: 6,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.text.body,
        marginRight: 8,
        minWidth: 70,
    },
    detailValue: {
        fontSize: 12,
        color: colors.text.title,
    },
    streakContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    streakValue: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text.title,
    },
    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    progressBarContainer: {
        flex: 1,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: colors.gray[200],
        borderRadius: 4,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "#10B981",
        borderRadius: 4,
    },
    progressValue: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.text.title,
    },
    checkButton: {
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
        marginTop: 12,
    },
    checkButtonDone: {
        // Estilo adicional quando está marcado
    },
    notesContainer: {
        marginTop: 4,
        padding: 8,
        backgroundColor: colors.gray[100],
        borderRadius: 6,
    },
    notesLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.text.body,
        marginBottom: 4,
    },
    notesText: {
        fontSize: 12,
        color: colors.text.title,
    },
    rightAction: {
        justifyContent: "center",
        alignItems: "flex-end",
        marginBottom: 12,
        borderRadius: 12,
        overflow: "hidden",
        minHeight: 80,
    },
    skipButton: {
        backgroundColor: "#FBBF24",
        justifyContent: "center",
        alignItems: "center",
        width: 100,
        flex: 1,
        paddingHorizontal: 16,
    },
    skipButtonText: {
        color: "#000",
        fontSize: 14,
        fontWeight: "600",
        marginTop: 4,
    },
    skippedTag: {
        backgroundColor: "#FBBF24",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 7,
    },
    skippedTagText: {
        color: "#000",
        fontSize: 11,
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 10,
        width: "90%",
        maxWidth: 400,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text.title,
        marginBottom: 6,
        textAlign: "center",
    },
    modalProgressContainer: {
        marginBottom: 10,
    },
    modalProgressLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.text.title,
        marginTop: 12,
        textAlign: "center",
    },
    modalProgressBarBackground: {
        height: 10,
        backgroundColor: colors.gray[200],
        borderRadius: 5,
        overflow: "hidden",
        marginTop: 16,
    },
    modalProgressBarFill: {
        height: "100%",
        backgroundColor: "#10B981",
        borderRadius: 6,
    },
    progressControls: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
    },
    progressButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    progressButtonText: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
    },
    progressValueContainer: {
        minWidth: 80,
        alignItems: "center",
        justifyContent: "center",
    },
    progressValueText: {
        fontSize: 30,
        fontWeight: "700",
        color: colors.text.title,
    },
    modalNotesContainer: {
        marginBottom: 10,
    },
    notesToggleButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 6,
    },
    notesToggleText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.text.body,
    },
    modalNotesLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text.title,
        marginBottom: 8,
    },
    modalNotesInput: {
        borderWidth: 1,
        borderColor: colors.gray[300],
        borderRadius: 8,
        padding: 8,
        fontSize: 12,
        color: colors.text.title,
        backgroundColor: colors.gray[100],
        minHeight: 50,
        textAlignVertical: "top",
    },
    modalActions: {
        flexDirection: "row",
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: colors.gray[200],
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text.body,
    },
    saveButton: {
        backgroundColor: colors.primary,
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
    },
    saveButtonDisabled: {
        backgroundColor: colors.gray[300],
        opacity: 0.5,
    },
    saveButtonTextDisabled: {
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
    modalStreakTag: {
        position: "absolute",
        top: 10,
        right: 15,
        backgroundColor: colors.gray[100],
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        zIndex: 10,
    },
    modalStreakTagText: {
        color: "black",
        fontSize: 16,
        fontWeight: "600",
    },
    progressButtonDisabled: {
        backgroundColor: colors.gray[300],
        opacity: 0.5,
    },
    progressButtonTextDisabled: {
        color: colors.gray[200],
    },
});
