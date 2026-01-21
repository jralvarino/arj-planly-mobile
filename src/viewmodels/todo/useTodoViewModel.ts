import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { Category } from "../../models/Category";
import { TODO_STATUS, Todo, TodoStatus } from "../../models/Todo";
import { getAllCategories } from "../../service/category.service";
import { getTodosByDate, updateTodoStatus } from "../../service/todo.service";

const getTodayDate = (): string => {
    // Usa o timezone local em vez de UTC para evitar problemas de timezone
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export function useTodoViewModel() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [updating, setUpdating] = useState(false);
    const soundRef = useRef<Audio.Sound | null>(null);
    const todosRef = useRef<Todo[]>([]);

    // Carrega o som quando o componente é montado
    useEffect(() => {
        const loadSound = async () => {
            try {
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    allowsRecordingIOS: false,
                    staysActiveInBackground: false,
                });
                const { sound } = await Audio.Sound.createAsync(require("../../../assets/sounds/todo-completed.mp3"));
                soundRef.current = sound;
            } catch (err) {
                console.log("Could not load sound:", err);
            }
        };
        loadSound();

        return () => {
            // Limpa o som quando o componente é desmontado
            if (soundRef.current) {
                soundRef.current.unloadAsync().catch(() => {});
            }
        };
    }, []);

    const sortTodos = useCallback((todos: Todo[]): Todo[] => {
        // Ordena: pending primeiro, depois done e skipped no final
        return [...todos].sort((a, b) => {
            if (a.status === TODO_STATUS.PENDING && b.status !== TODO_STATUS.PENDING) return -1;
            if (a.status !== TODO_STATUS.PENDING && b.status === TODO_STATUS.PENDING) return 1;
            // Se ambos são pending ou ambos são done/skipped, mantém a ordem original
            return 0;
        });
    }, []);

    const fetchTodos = useCallback(
        async (date: string) => {
            try {
                setLoading(true);
                setError(null);
                const data = await getTodosByDate(date);
                const sortedData = sortTodos(data);
                setTodos(sortedData);
                todosRef.current = sortedData;
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch todos");
                setTodos([]);
                todosRef.current = [];
            } finally {
                setLoading(false);
            }
        },
        [sortTodos]
    );

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        const today = getTodayDate();
        try {
            setError(null);
            const data = await getTodosByDate(today);
            const sortedData = sortTodos(data);
            setTodos(sortedData);
            todosRef.current = sortedData;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch todos");
        } finally {
            setRefreshing(false);
        }
    }, [sortTodos]);

    const fetchCategories = useCallback(async () => {
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    }, []);

    const handleFocus = useCallback(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleToggleTodo = useCallback(
        async (todoId: string, currentStatus: TodoStatus, progressValue: string, notes: string = "", date?: string) => {
            const newStatus = currentStatus === TODO_STATUS.DONE ? TODO_STATUS.PENDING : TODO_STATUS.DONE;
            
            // Usa a data selecionada ou a data de hoje como padrão
            const targetDate = date || getTodayDate();
            
            // Atualiza o estado local imediatamente (otimistic update)
            setTodos((prevTodos) => {
                const updatedTodos = prevTodos.map((todo) =>
                    todo.id === todoId
                        ? { ...todo, status: newStatus, progressValue, notes }
                        : todo
                );
                const sortedData = sortTodos(updatedTodos);
                todosRef.current = sortedData;
                return sortedData;
            });

            // Toca som/haptic quando o Todo é concluído
            if (newStatus === TODO_STATUS.DONE) {
                try {
                    // Feedback háptico
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } catch (hapticError) {
                    // Se haptics falhar, ignora silenciosamente
                    console.log("Haptic feedback not available");
                }

                // Toca som customizado
                if (soundRef.current) {
                    try {
                        await soundRef.current.replayAsync();
                    } catch (soundError) {
                        console.log("Could not play sound:", soundError);
                    }
                }
            }

            // Chama o backend em background (não bloqueia a UI)
            updateTodoStatus(todoId, targetDate, newStatus, progressValue, notes)
                .then(() => {
                    // Sincroniza com o backend para garantir consistência usando a data selecionada
                    getTodosByDate(targetDate)
                        .then((data) => {
                            const sortedData = sortTodos(data);
                            setTodos(sortedData);
                            todosRef.current = sortedData;
                        })
                        .catch((err) => {
                            console.error("Error syncing todos after update:", err);
                        });
                })
                .catch((err) => {
                    console.error("Error toggling todo:", err);
                    // Reverte a mudança otimista em caso de erro
                    setTodos((prevTodos) => {
                        const revertedTodos = prevTodos.map((todo) =>
                            todo.id === todoId
                                ? { ...todo, status: currentStatus, progressValue, notes }
                                : todo
                        );
                        const sortedData = sortTodos(revertedTodos);
                        todosRef.current = sortedData;
                        return sortedData;
                    });
                    const errorMessage =
                        err instanceof Error ? err.message : "Failed to update todo status. Please try again.";
                    Alert.alert("Error", errorMessage);
                });
        },
        [sortTodos]
    );

    const handleSkipTodo = useCallback(
        async (todoId: string, progressValue: string, notes: string = "", date?: string) => {
            // Usa a data selecionada ou a data de hoje como padrão
            const targetDate = date || getTodayDate();
            
            // Atualiza o estado local imediatamente (otimistic update)
            setTodos((prevTodos) => {
                const updatedTodos = prevTodos.map((todo) =>
                    todo.id === todoId
                        ? { ...todo, status: TODO_STATUS.SKIPPED, progressValue: "0", notes }
                        : todo
                );
                const sortedData = sortTodos(updatedTodos);
                todosRef.current = sortedData;
                return sortedData;
            });

            // Chama o backend em background (não bloqueia a UI)
            updateTodoStatus(todoId, targetDate, TODO_STATUS.SKIPPED, "0", notes)
                .then(() => {
                    // Sincroniza com o backend para garantir consistência usando a data selecionada
                    getTodosByDate(targetDate)
                        .then((data) => {
                            const sortedData = sortTodos(data);
                            setTodos(sortedData);
                            todosRef.current = sortedData;
                        })
                        .catch((err) => {
                            console.error("Error syncing todos after skip:", err);
                        });
                })
                .catch((err) => {
                    console.error("Error skipping todo:", err);
                    // Reverte a mudança otimista em caso de erro
                    setTodos((prevTodos) => {
                        const currentTodo = prevTodos.find((t) => t.id === todoId);
                        if (!currentTodo) {
                            todosRef.current = prevTodos;
                            return prevTodos;
                        }
                        const revertedTodos = prevTodos.map((todo) =>
                            todo.id === todoId
                                ? { ...todo, status: TODO_STATUS.PENDING, progressValue, notes }
                                : todo
                        );
                        const sortedData = sortTodos(revertedTodos);
                        todosRef.current = sortedData;
                        return sortedData;
                    });
                    const errorMessage = err instanceof Error ? err.message : "Failed to skip todo. Please try again.";
                    Alert.alert("Error", errorMessage);
                });
        },
        [sortTodos]
    );

    const handleUndoSkip = useCallback(
        async (todoId: string, notes: string = "", date?: string) => {
            // Usa a data selecionada ou a data de hoje como padrão
            const targetDate = date || getTodayDate();
            
            // Atualiza o estado local imediatamente (otimistic update)
            setTodos((prevTodos) => {
                const updatedTodos = prevTodos.map((todo) =>
                    todo.id === todoId
                        ? { ...todo, status: TODO_STATUS.PENDING, progressValue: "0", notes }
                        : todo
                );
                const sortedData = sortTodos(updatedTodos);
                todosRef.current = sortedData;
                return sortedData;
            });

            // Chama o backend em background (não bloqueia a UI)
            updateTodoStatus(todoId, targetDate, TODO_STATUS.PENDING, "0", notes)
                .then(() => {
                    // Sincroniza com o backend para garantir consistência usando a data selecionada
                    getTodosByDate(targetDate)
                        .then((data) => {
                            const sortedData = sortTodos(data);
                            setTodos(sortedData);
                            todosRef.current = sortedData;
                        })
                        .catch((err) => {
                            console.error("Error syncing todos after undo skip:", err);
                        });
                })
                .catch((err) => {
                    console.error("Error undoing skip:", err);
                    // Reverte a mudança otimista em caso de erro
                    setTodos((prevTodos) => {
                        const updatedTodos = prevTodos.map((todo) =>
                            todo.id === todoId
                                ? { ...todo, status: TODO_STATUS.SKIPPED, progressValue: "0", notes }
                                : todo
                        );
                        const sortedData = sortTodos(updatedTodos);
                        todosRef.current = sortedData;
                        return sortedData;
                    });
                    const errorMessage = err instanceof Error ? err.message : "Failed to undo skip. Please try again.";
                    Alert.alert("Error", errorMessage);
                });
        },
        [sortTodos]
    );

    const handleSkipTodoWithConfirmation = useCallback(
        (todoId: string, todoTitle: string, currentStatus: TodoStatus, progressValue: string, notes: string = "", date?: string) => {
            // Se o status for skipped, faz undo (volta para pending)
            if (currentStatus === TODO_STATUS.SKIPPED) {
                handleUndoSkip(todoId, notes, date);
                return;
            }

            // Não permite skip se o status for done
            if (currentStatus === TODO_STATUS.DONE) {
                Alert.alert("Cannot Skip", "A completed todo cannot be skipped.");
                return;
            }

            // Só permite skip se o status for pending
            if (currentStatus !== TODO_STATUS.PENDING) {
                return;
            }

            // Faz skip diretamente
            handleSkipTodo(todoId, progressValue, notes, date);
        },
        [handleSkipTodo, handleUndoSkip]
    );

    const playCompletionSound = useCallback(async () => {
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (hapticError) {
            console.log("Haptic feedback not available");
        }

        if (soundRef.current) {
            try {
                await soundRef.current.replayAsync();
            } catch (soundError) {
                console.log("Could not play sound:", soundError);
            }
        }
    }, []);

    const handleSaveTodo = useCallback(
        async (todoId: string, status: TodoStatus, progressValue: string, notes: string = "", date?: string) => {
            // Usa a data selecionada ou a data de hoje como padrão
            const targetDate = date || getTodayDate();
            
            // Se o status for pending ou skipped, reseta progressValue para 0
            const finalProgressValue =
                status === TODO_STATUS.PENDING || status === TODO_STATUS.SKIPPED ? "0" : progressValue;

            // Salva o estado anterior usando o ref (acesso síncrono ao estado atual)
            const previousTodo = todosRef.current.find((t) => t.id === todoId);
            const previousStatus = previousTodo?.status || TODO_STATUS.PENDING;
            const previousProgressValue = previousTodo?.progressValue || "0";
            const previousNotes = previousTodo?.notes || "";

            // Atualiza o estado local imediatamente (otimistic update)
            setTodos((prevTodos) => {
                const updatedTodos = prevTodos.map((todo) =>
                    todo.id === todoId
                        ? { ...todo, status, progressValue: finalProgressValue, notes }
                        : todo
                );
                const sortedData = sortTodos(updatedTodos);
                todosRef.current = sortedData;
                return sortedData;
            });

            // Toca som/haptic quando o Todo é concluído
            if (status === TODO_STATUS.DONE) {
                await playCompletionSound();
            }

            // Chama o backend em background (não bloqueia a UI)
            updateTodoStatus(todoId, targetDate, status, finalProgressValue, notes)
                .then(() => {
                    // Sincroniza com o backend para garantir consistência usando a data selecionada
                    getTodosByDate(targetDate)
                        .then((data) => {
                            const sortedData = sortTodos(data);
                            setTodos(sortedData);
                            todosRef.current = sortedData;
                        })
                        .catch((err) => {
                            console.error("Error syncing todos after save:", err);
                        });
                })
                .catch((err) => {
                    console.error("Error saving todo:", err);
                    // Reverte a mudança otimista em caso de erro
                    setTodos((prevTodos) => {
                        const revertedTodos = prevTodos.map((todo) =>
                            todo.id === todoId
                                ? {
                                      ...todo,
                                      status: previousStatus,
                                      progressValue: previousProgressValue,
                                      notes: previousNotes,
                                  }
                                : todo
                        );
                        const sortedData = sortTodos(revertedTodos);
                        todosRef.current = sortedData;
                        return sortedData;
                    });
                    const errorMessage = err instanceof Error ? err.message : "Failed to save todo. Please try again.";
                    Alert.alert("Error", errorMessage);
                });
        },
        [sortTodos, playCompletionSound]
    );

    useEffect(() => {
        const today = getTodayDate();
        fetchTodos(today);
        fetchCategories();
    }, [fetchTodos, fetchCategories]);

    return {
        todos,
        categories,
        loading,
        error,
        refreshing,
        updating,
        handleRefresh,
        handleFocus,
        fetchTodosByDate: fetchTodos,
        handleToggleTodo,
        handleSkipTodoWithConfirmation,
        handleSaveTodo,
        playCompletionSound,
    };
}
