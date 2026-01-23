import { colors } from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import Emoji from "react-native-emoji";
import { Swipeable } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { Category } from "../models/Category";
import { TODO_STATUS, Todo, TodoStatus } from "../models/Todo";
import { getTodayDate } from "../utils/dateUtils";
import { TodoModalContent } from "./TodoModalContent";

interface TodoCardProps {
    todo: Todo;
    categories?: Category[];
    selectedDate?: string;
    onToggle?: (todoId: string, currentStatus: TodoStatus, progressValue: string, date?: string) => void;
    onSkip?: (
        todoId: string,
        todoTitle: string,
        currentStatus: TodoStatus,
        progressValue: string,
        date?: string
    ) => void;
    onSave?: (todoId: string, status: TodoStatus, progressValue: string, date?: string) => void;
    onSaveNotes?: (todoId: string, notes: string, date?: string) => void;
}

export function TodoCard({
    todo,
    categories = [],
    selectedDate,
    onToggle,
    onSkip,
    onSave,
    onSaveNotes,
}: TodoCardProps) {
    const swipeableRef = useRef<Swipeable>(null);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const [notesModalVisible, setNotesModalVisible] = useState(false);
    const { height: screenHeight } = useWindowDimensions();
    const snapPoints = useMemo(() => [screenHeight * 0.4], [screenHeight]);
    const [modalStatus, setModalStatus] = useState<TodoStatus>(todo.status);
    const [modalProgressValue, setModalProgressValue] = useState(todo.progressValue);
    const [modalNotes, setModalNotes] = useState(todo.notes || "");
    const prevStatusRef = useRef<TodoStatus>(todo.status);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const progress = todo.targetValue
        ? (parseFloat(todo.progressValue || "0") / parseFloat(todo.targetValue)) * 100
        : 0;

    const modalProgress = todo.targetValue
        ? (parseFloat(modalProgressValue || "0") / parseFloat(todo.targetValue)) * 100
        : 0;

    const isDone = todo.status === TODO_STATUS.DONE;
    const isSkipped = todo.status === TODO_STATUS.SKIPPED;
    const category = categories.find((cat) => cat.id === todo.categoryId);

    // Verifica se a data selecionada é futura (usa timezone local)
    const todayDate = getTodayDate();
    const normalizedSelectedDate = selectedDate ? selectedDate.split("T")[0] : todayDate;
    const isFutureDate = normalizedSelectedDate > todayDate;

    // Usa a cor original do todo
    const cardColor = todo.color;

    // Anima quando o status muda para DONE
    useEffect(() => {
        const prevStatus = prevStatusRef.current;
        const currentStatus = todo.status;

        // Se mudou de não-DONE para DONE, anima o card
        if (prevStatus !== TODO_STATUS.DONE && currentStatus === TODO_STATUS.DONE) {
            // Animação de "pulso" quando concluído
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(scaleAnim, {
                        toValue: 1.05,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0.9,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        }

        // Atualiza o status anterior
        prevStatusRef.current = currentStatus;
    }, [todo.status, scaleAnim, opacityAnim]);

    const handleOpenModal = () => {
        if (isFutureDate) {
            Toast.show({
                type: "info",
                text1: "Data Futura",
                text2: "Itens futuros não podem ser alterados.",
            });
            return;
        }
        setModalStatus(todo.status);
        setModalProgressValue(todo.progressValue);
        bottomSheetModalRef.current?.present();
    };

    const handleCloseModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
        // Reset to original values
        setModalStatus(todo.status);
        setModalProgressValue(todo.progressValue);
    }, [todo.status, todo.progressValue]);

    const handleDecrementProgress = () => {
        if (isFutureDate) {
            Toast.show({
                type: "info",
                text1: "Data Futura",
                text2: "Itens futuros não podem ser alterados.",
            });
            return;
        }
        const numValue = parseFloat(modalProgressValue) || 0;
        const newValue = Math.max(0, numValue - 1).toString();
        let newStatus = modalStatus;

        // Se estava done mas não está mais no máximo, volta para pending e reseta progressValue
        if (modalStatus === TODO_STATUS.DONE && newValue !== todo.targetValue) {
            newStatus = TODO_STATUS.PENDING;
            const finalValue = "0";
            setModalProgressValue(finalValue);
            setModalStatus(newStatus);
            onSave?.(todo.id, newStatus, finalValue, selectedDate);
            return;
        }

        setModalProgressValue(newValue);
        onSave?.(todo.id, newStatus, newValue, selectedDate);
    };

    const handleIncrementProgress = () => {
        if (isFutureDate) {
            Toast.show({
                type: "info",
                text1: "Data Futura",
                text2: "Itens futuros não podem ser alterados.",
            });
            return;
        }
        const numValue = parseFloat(modalProgressValue) || 0;
        const maxValue = parseFloat(todo.targetValue) || 1;
        const newValue = Math.min(maxValue, numValue + 1).toString();
        let newStatus = modalStatus;

        // Se atingir o valor máximo, define status como done
        if (newValue === todo.targetValue) {
            newStatus = TODO_STATUS.DONE;
        }

        setModalProgressValue(newValue);
        setModalStatus(newStatus);
        onSave?.(todo.id, newStatus, newValue, selectedDate);
    };

    const handleSkip = () => {
        if (isFutureDate) {
            Toast.show({
                type: "info",
                text1: "Data Futura",
                text2: "Itens futuros não podem ser alterados.",
            });
            swipeableRef.current?.close();
            return;
        }
        onSkip?.(todo.id, todo.title, todo.status, todo.progressValue, selectedDate);
        swipeableRef.current?.close();
    };

    const handleOpenNotesModal = () => {
        if (isFutureDate) {
            Toast.show({
                type: "info",
                text1: "Data Futura",
                text2: "Itens futuros não podem ser alterados.",
            });
            swipeableRef.current?.close();
            return;
        }
        setModalNotes(todo.notes || "");
        setNotesModalVisible(true);
        swipeableRef.current?.close();
    };

    const handleCloseNotesModal = useCallback(() => {
        setNotesModalVisible(false);
        setModalNotes(todo.notes || "");
    }, [todo.notes]);

    const handleSaveNotes = () => {
        onSaveNotes?.(todo.id, modalNotes, selectedDate);
        setNotesModalVisible(false);
    };

    const renderRightActions = () => {
        const isSkippedStatus = todo.status === TODO_STATUS.SKIPPED;
        return (
            <View style={styles.rightAction}>
                <Pressable style={styles.notesButton} onPress={handleOpenNotesModal}>
                    <Ionicons name="document-text-outline" size={24} color="#fff" />
                    <Text style={styles.notesButtonText}>Notes</Text>
                </Pressable>
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
            <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} enabled={true}>
                <Pressable onPress={handleOpenModal}>
                    <Animated.View
                        style={[
                            styles.card,
                            {
                                backgroundColor: cardColor,
                                borderLeftColor: cardColor,
                                transform: [{ scale: scaleAnim }],
                                opacity: opacityAnim,
                            },
                        ]}
                    >
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
                                    {!todo.active && (
                                        <View style={styles.inactiveTag}>
                                            <Text style={styles.inactiveTagText}>Inactive</Text>
                                        </View>
                                    )}
                                    {todo.notes && todo.notes.trim() !== "" && (
                                        <View style={styles.notesIconContainer}>
                                            <Ionicons
                                                name="chatbox-ellipses-outline"
                                                size={15}
                                                color={colors.primary}
                                            />
                                        </View>
                                    )}
                                </View>
                            </View>
                            <Pressable
                                onPress={() => {
                                    if (isFutureDate) {
                                        Toast.show({
                                            type: "info",
                                            text1: "Data Futura",
                                            text2: "Itens futuros não podem ser alterados.",
                                        });
                                        return;
                                    }
                                    if (isSkipped) {
                                        return;
                                    }
                                    onToggle?.(todo.id, todo.status, todo.progressValue, selectedDate);
                                }}
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
                    </Animated.View>
                </Pressable>
            </Swipeable>

            <BottomSheetModal
                ref={bottomSheetModalRef}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                backgroundStyle={styles.bottomSheetBackground}
                handleIndicatorStyle={styles.bottomSheetIndicator}
                onDismiss={handleCloseModal}
            >
                <BottomSheetView style={styles.modalContent}>
                    <TodoModalContent
                        todo={todo}
                        modalStatus={modalStatus}
                        modalProgressValue={modalProgressValue}
                        setModalStatus={setModalStatus}
                        setModalProgressValue={setModalProgressValue}
                        isSkipped={isSkipped}
                        isFutureDate={isFutureDate}
                        onDecrement={handleDecrementProgress}
                        onIncrement={handleIncrementProgress}
                        modalProgress={modalProgress}
                    />
                </BottomSheetView>
            </BottomSheetModal>

            <Modal
                visible={notesModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={handleCloseNotesModal}
            >
                <View style={styles.notesModalContainer}>
                    <View style={styles.notesModalHeader}>
                        <Pressable onPress={handleCloseNotesModal} style={styles.notesModalCloseButton}>
                            <Text style={styles.notesModalCloseText}>Cancel</Text>
                        </Pressable>
                        <Text style={styles.notesModalTitle}>Notes</Text>
                        <Pressable onPress={handleSaveNotes} style={styles.notesModalSaveButton}>
                            <Text style={styles.notesModalSaveText}>Save</Text>
                        </Pressable>
                    </View>
                    <View style={styles.notesModalBody}>
                        <TextInput
                            style={styles.notesInput}
                            value={modalNotes}
                            onChangeText={setModalNotes}
                            placeholder="Add your notes here..."
                            placeholderTextColor={colors.text.body}
                            multiline
                            textAlignVertical="top"
                            autoFocus
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 9,
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
    notesIconContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 3,
        marginTop: 2,
    },
    details: {
        gap: 6,
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
    checkButton: {
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
        marginTop: 12,
    },
    checkButtonDone: {
        // Estilo adicional quando está marcado
    },
    notesButton: {
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        width: 100,
        paddingHorizontal: 16,
    },
    notesButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        marginTop: 4,
    },
    rightAction: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "stretch",
        marginBottom: 12,
        borderRadius: 12,
        overflow: "hidden",
    },
    skipButton: {
        backgroundColor: "#FBBF24",
        justifyContent: "center",
        alignItems: "center",
        width: 100,
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
    inactiveTag: {
        backgroundColor: colors.gray[300],
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 7,
    },
    inactiveTagText: {
        color: colors.text.body,
        fontSize: 11,
        fontWeight: "600",
    },
    modalContent: {
        flex: 1,
        padding: 0,
    },
    bottomSheetBackground: {
        backgroundColor: colors.gray[100],
    },
    bottomSheetIndicator: {
        backgroundColor: colors.gray[300],
        width: 40,
        height: 4,
    },
    notesModalContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    notesModalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        paddingTop: Platform.OS === "ios" ? 60 : 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    notesModalCloseButton: {
        padding: 8,
    },
    notesModalCloseText: {
        fontSize: 16,
        color: colors.text.body,
    },
    notesModalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text.title,
    },
    notesModalSaveButton: {
        padding: 8,
    },
    notesModalSaveText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.primary,
    },
    notesModalBody: {
        flex: 1,
        padding: 16,
    },
    notesInput: {
        flex: 1,
        fontSize: 16,
        color: colors.text.title,
        backgroundColor: colors.gray[100],
        borderRadius: 8,
        padding: 12,
        textAlignVertical: "top",
    },
});
