import { colors } from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetTextInput,
    BottomSheetView,
    useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import * as Progress from "react-native-progress";
import Toast from "react-native-toast-message";
import { Category } from "../models/Category";
import { TODO_STATUS, Todo, TodoStatus } from "../models/Todo";
import { getTodayDate } from "../utils/dateUtils";
import { TodoModalContent } from "./TodoModalContent";
import { IconCheck } from "./icons/IconCheck";

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
    const notesBottomSheetModalRef = useRef<BottomSheetModal>(null);
    const { dismissAll } = useBottomSheetModal();
    const { height: screenHeight } = useWindowDimensions();
    const snapPoints = useMemo(() => [screenHeight * 0.4], [screenHeight]);
    const notesSnapPoints = useMemo(() => [screenHeight * 0.5], [screenHeight]);
    const [modalStatus, setModalStatus] = useState<TodoStatus>(todo.status);
    const [modalProgressValue, setModalProgressValue] = useState(todo.progressValue);
    const [modalNotes, setModalNotes] = useState(todo.notes || "");
    // Estado local do todo para atualizar a UI imediatamente
    const [localTodo, setLocalTodo] = useState(todo);
    const prevStatusRef = useRef<TodoStatus>(todo.status);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    // Atualiza o estado local quando o todo prop muda
    useEffect(() => {
        setLocalTodo(todo);
        setModalStatus(todo.status);
        setModalProgressValue(todo.progressValue);
    }, [todo.id, todo.status, todo.progressValue]);

    const progress = localTodo.targetValue
        ? parseFloat(localTodo.progressValue || "0") / parseFloat(localTodo.targetValue)
        : 0;

    const modalProgress = localTodo.targetValue
        ? (parseFloat(modalProgressValue || "0") / parseFloat(localTodo.targetValue)) * 100
        : 0;

    const isDone = localTodo.status === TODO_STATUS.DONE;
    const isSkipped = localTodo.status === TODO_STATUS.SKIPPED;
    const category = categories.find((cat) => cat.id === localTodo.categoryId);

    // Define thickness como 0 quando status é done ou targetValue é 1
    const progressThickness = isDone || localTodo.targetValue === "1" ? 0 : 1;

    // Verifica se a data selecionada é futura (usa timezone local)
    const todayDate = getTodayDate();
    const normalizedSelectedDate = selectedDate ? selectedDate.split("T")[0] : todayDate;
    const isFutureDate = normalizedSelectedDate > todayDate;

    // Usa a cor original do todo
    const cardColor = localTodo.color;

    // Anima quando o status muda para DONE
    useEffect(() => {
        const prevStatus = prevStatusRef.current;
        const currentStatus = localTodo.status;

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
    }, [localTodo.status, scaleAnim, opacityAnim]);

    const handleOpenModal = () => {
        if (isFutureDate) {
            Toast.show({
                type: "info",
                text1: "Data Futura",
                text2: "Itens futuros não podem ser alterados.",
            });
            return;
        }
        // Fecha todos os modais abertos antes de abrir um novo
        dismissAll();
        setModalStatus(todo.status);
        setModalProgressValue(todo.progressValue);
        // Pequeno delay para garantir que os outros modais foram fechados
        setTimeout(() => {
            bottomSheetModalRef.current?.present();
        }, 100);
    };

    const handleCloseModal = useCallback(() => {
        // Verifica se houve alterações antes de fechar (compara com valores originais do prop)
        const hasStatusChanged = modalStatus !== todo.status;
        const hasProgressChanged = modalProgressValue !== todo.progressValue;

        if (hasStatusChanged || hasProgressChanged) {
            // Salva as alterações no backend
            onSave?.(todo.id, modalStatus, modalProgressValue, selectedDate);
            // Atualiza o estado local com os novos valores do modal (não reseta)
            setLocalTodo({ ...localTodo, status: modalStatus, progressValue: modalProgressValue });
        }

        bottomSheetModalRef.current?.dismiss();
        // Reset modal state to original values from prop (para o próximo uso do modal)
        setModalStatus(todo.status);
        setModalProgressValue(todo.progressValue);
    }, [todo.status, todo.progressValue, todo.id, modalStatus, modalProgressValue, localTodo, selectedDate, onSave]);

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
        if (modalStatus === TODO_STATUS.DONE && newValue !== localTodo.targetValue) {
            newStatus = TODO_STATUS.PENDING;
            const finalValue = "0";
            setModalProgressValue(finalValue);
            setModalStatus(newStatus);
            // Atualiza o estado local do todo
            setLocalTodo({ ...localTodo, status: newStatus, progressValue: finalValue });
            return;
        }

        setModalProgressValue(newValue);
        setModalStatus(newStatus);
        // Atualiza o estado local do todo
        setLocalTodo({ ...localTodo, status: newStatus, progressValue: newValue });
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
        const maxValue = parseFloat(localTodo.targetValue) || 1;
        const newValue = Math.min(maxValue, numValue + 1).toString();
        let newStatus = modalStatus;

        // Se atingir o valor máximo, define status como done
        if (newValue === localTodo.targetValue) {
            newStatus = TODO_STATUS.DONE;
        }

        setModalProgressValue(newValue);
        setModalStatus(newStatus);
        // Atualiza o estado local do todo
        setLocalTodo({ ...localTodo, status: newStatus, progressValue: newValue });
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
        onSkip?.(localTodo.id, localTodo.title, localTodo.status, localTodo.progressValue, selectedDate);
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
        setModalNotes(localTodo.notes || "");
        dismissAll();
        setTimeout(() => {
            notesBottomSheetModalRef.current?.present();
        }, 100);
        swipeableRef.current?.close();
    };

    const handleCloseNotesModal = useCallback(() => {
        notesBottomSheetModalRef.current?.dismiss();
        setModalNotes(localTodo.notes || "");
    }, [localTodo.notes]);

    const handleSaveNotes = () => {
        onSaveNotes?.(localTodo.id, modalNotes, selectedDate);
        notesBottomSheetModalRef.current?.dismiss();
        // Atualiza o estado local com as novas notas
        setLocalTodo({ ...localTodo, notes: modalNotes });
    };

    const renderRightActions = () => {
        const isSkippedStatus = localTodo.status === TODO_STATUS.SKIPPED;
        return (
            <View style={styles.rightAction}>
                <Pressable style={styles.notesButton} onPress={handleOpenNotesModal}>
                    <Ionicons name="document-text-outline" size={24} color={colors.white} />
                    <Text style={styles.notesButtonText}>Notes</Text>
                </Pressable>
                <Pressable style={styles.skipButton} onPress={handleSkip}>
                    <Ionicons
                        name={isSkippedStatus ? "play-back-outline" : "play-forward-outline"}
                        size={24}
                        color={colors.black}
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
                                <View style={styles.circleBackground} />
                                <Progress.Circle
                                    progress={progress}
                                    size={45}
                                    thickness={progressThickness}
                                    borderWidth={0.01}
                                    color={colors.success}
                                    showsText={false}
                                />
                                <View style={styles.emojiWrapper}>
                                    <Text style={styles.emoji}>{localTodo.emoji}</Text>
                                </View>
                            </View>
                            <View style={styles.titleContainer}>
                                <Text style={[styles.title, (isDone || isSkipped) && styles.titleDone]}>
                                    {localTodo.title}
                                </Text>
                                <View style={styles.tagsContainer}>
                                    {Boolean(localTodo.streak && String(localTodo.streak) !== "0") && (
                                        <View style={styles.streakTag}>
                                            <Ionicons name="flame" size={12} color={colors.orange.base} />
                                            <Text style={styles.streakTagText}>{localTodo.streak}</Text>
                                        </View>
                                    )}
                                    <View style={styles.tag}>
                                        <Text style={styles.tagText}>
                                            {localTodo.progressValue} / {localTodo.targetValue}
                                            {localTodo.unit !== "count" ? ` ${localTodo.unit}` : ""}
                                        </Text>
                                    </View>
                                    {category && (
                                        <View style={styles.tag}>
                                            <Text style={styles.tagText}>{category.name}</Text>
                                        </View>
                                    )}
                                    {localTodo.period && (
                                        <View style={styles.tag}>
                                            <Text style={styles.tagText}>{localTodo.period}</Text>
                                        </View>
                                    )}
                                    {isSkipped && (
                                        <View style={styles.skippedTag}>
                                            <Text style={styles.skippedTagText}>skipped</Text>
                                        </View>
                                    )}
                                    {!localTodo.active && (
                                        <View style={styles.inactiveTag}>
                                            <Text style={styles.inactiveTagText}>Inactive</Text>
                                        </View>
                                    )}
                                    {localTodo.notes && localTodo.notes.trim() !== "" && (
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
                                    onToggle?.(localTodo.id, localTodo.status, localTodo.progressValue, selectedDate);
                                }}
                                style={[styles.checkButton, isDone && styles.checkButtonDone]}
                                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                                disabled={isSkipped}
                            >
                                {isSkipped ? (
                                    <Ionicons name="play-forward-outline" size={28} color={colors.warning.base} />
                                ) : isDone ? (
                                    <IconCheck size={24} color={colors.success} />
                                ) : (
                                    <Ionicons name="checkmark-circle-outline" size={28} color={colors.gray[300]} />
                                )}
                            </Pressable>
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
                backdropComponent={(props) => (
                    <BottomSheetBackdrop
                        {...props}
                        disappearsOnIndex={-1}
                        appearsOnIndex={0}
                        onPress={handleCloseModal}
                    />
                )}
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
                        onClose={handleCloseModal}
                    />
                </BottomSheetView>
            </BottomSheetModal>

            <BottomSheetModal
                ref={notesBottomSheetModalRef}
                snapPoints={notesSnapPoints}
                enablePanDownToClose={true}
                enableContentPanningGesture={false}
                android_keyboardInputMode="adjustResize"
                backgroundStyle={styles.bottomSheetBackground}
                handleIndicatorStyle={styles.bottomSheetIndicator}
                onDismiss={handleCloseNotesModal}
                backdropComponent={(props) => (
                    <BottomSheetBackdrop
                        {...props}
                        disappearsOnIndex={-1}
                        appearsOnIndex={0}
                        onPress={handleCloseNotesModal}
                    />
                )}
            >
                <BottomSheetView style={styles.modalContent}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.notesModalKeyboardAvoid}
                    >
                        <View style={styles.notesModalHeader}>
                            <Pressable onPress={handleCloseNotesModal} style={styles.notesModalCancelButton}>
                                <Text style={styles.notesModalCancelText}>Cancel</Text>
                            </Pressable>
                            <Text style={styles.notesModalTitle}>Notes</Text>
                            <Pressable onPress={handleSaveNotes} style={styles.notesModalDoneButton}>
                                <Text style={styles.notesModalDoneText}>Done</Text>
                            </Pressable>
                        </View>
                        <View style={styles.notesModalBody}>
                            <BottomSheetTextInput
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
                    </KeyboardAvoidingView>
                </BottomSheetView>
            </BottomSheetModal>
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        paddingVertical: 13,
        paddingHorizontal: 9,
        marginBottom: 10,
        borderLeftWidth: 4,
        position: "relative",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
    },
    emojiContainer: {
        marginRight: 12,
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
    },
    circleBackground: {
        position: "absolute",
        width: 47,
        height: 47,
        borderRadius: 22.5,
        backgroundColor: colors.overlay.white,
    },
    emojiWrapper: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    emoji: {
        fontSize: 26,
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
        gap: 3,
        marginTop: 4, //espaço entre o titulo e as tags para separar melhor
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
    streakTag: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        backgroundColor: colors.orange.light,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 7,
    },
    streakTagText: {
        fontSize: 10,
        fontWeight: "600",
        color: colors.orange.base,
    },
    tag: {
        backgroundColor: colors.gray[100],
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 7,
    },
    tagText: {
        fontSize: 10,
        fontWeight: "500",
        color: colors.text.body,
    },
    notesIconContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 3,
        marginTop: 2,
    },
    checkButton: {
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginRight: 4, //espaço entre o titulo e o botão de check
    },
    checkButtonDone: {
        // Estilo adicional quando está marcado
    },
    checkImage: {
        width: 24,
        height: 24,
    },
    notesButton: {
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        width: 100,
        paddingHorizontal: 16,
    },
    notesButtonText: {
        color: colors.white,
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
        backgroundColor: colors.warning.base,
        justifyContent: "center",
        alignItems: "center",
        width: 100,
        paddingHorizontal: 16,
    },
    skipButtonText: {
        color: colors.black,
        fontSize: 14,
        fontWeight: "600",
        marginTop: 4,
    },
    skippedTag: {
        backgroundColor: colors.warning.base,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 7,
    },
    skippedTagText: {
        color: colors.black,
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
    notesModalKeyboardAvoid: {
        flex: 1,
    },
    notesModalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        paddingTop: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    notesModalCancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    notesModalCancelText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.white,
    },
    notesModalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text.title,
        flex: 1,
        textAlign: "center",
    },
    notesModalDoneButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    notesModalDoneText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.white,
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
