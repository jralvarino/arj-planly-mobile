import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { Category } from "../../models/Category";
import { TODO_STATUS, Todo, TodoStatus } from "../../models/Todo";
import { getAllCategories } from "../../service/category.service";
import { getTodosByDate, updateTodoNotes, updateTodoStatus } from "../../service/todo.service";
import { useStreakStore } from "../../stores/streakStore";

const getTodayDate = (): string => {
    // Usa o timezone local em vez de UTC para evitar problemas de timezone
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export function useTodoViewModel() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const soundRef = useRef<Audio.Sound | null>(null);
    const trumpetsSoundRef = useRef<Audio.Sound | null>(null);
    const todosRef = useRef<Todo[]>([]);

    // Carrega os sons quando o componente é montado
    useEffect(() => {
        const loadSounds = async () => {
            try {
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    allowsRecordingIOS: false,
                    staysActiveInBackground: false,
                });

                // Carrega o som padrão de todo completado
                const { sound } = await Audio.Sound.createAsync(require("../../../assets/sounds/todo-completed.mp3"));
                soundRef.current = sound;

                // Carrega o som de trombetas para quando o último todo é completado
                const { sound: trumpetsSound } = await Audio.Sound.createAsync(
                    require("../../../assets/sounds/trumpets-completed.mp3")
                );
                trumpetsSoundRef.current = trumpetsSound;
            } catch (err) {
                console.log("Could not load sound:", err);
            }
        };
        loadSounds();

        return () => {
            // Limpa os sons quando o componente é desmontado
            if (soundRef.current) {
                soundRef.current.unloadAsync().catch(() => {});
            }
            if (trumpetsSoundRef.current) {
                trumpetsSoundRef.current.unloadAsync().catch(() => {});
            }
        };
    }, []);

    const sortTodos = useCallback((todos: Todo[]): Todo[] => {
        // Ordena: 1) pending primeiro, done por último; 2) depois por period (Morning, Afternoon, Evening, Anytime)
        const periodOrder: Record<string, number> = {
            Morning: 1,
            Afternoon: 2,
            Evening: 3,
            Anytime: 4,
        };

        return [...todos].sort((a, b) => {
            // 1. Ordena por status: pending primeiro, depois skipped, done por último
            const statusOrder: Record<TodoStatus, number> = {
                [TODO_STATUS.PENDING]: 1,
                [TODO_STATUS.SKIPPED]: 2,
                [TODO_STATUS.DONE]: 3,
            };

            const statusDiff = statusOrder[a.status] - statusOrder[b.status];
            if (statusDiff !== 0) {
                return statusDiff;
            }

            // 2. Se status igual, ordena por period
            const aPeriodOrder = periodOrder[a.period] || 5; // Valores não conhecidos ficam no final
            const bPeriodOrder = periodOrder[b.period] || 5;

            return aPeriodOrder - bPeriodOrder;
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
        async (todoId: string, currentStatus: TodoStatus, progressValue: string, date?: string) => {
            const newStatus = currentStatus === TODO_STATUS.DONE ? TODO_STATUS.PENDING : TODO_STATUS.DONE;

            // Usa a data selecionada ou a data de hoje como padrão
            const targetDate = date || getTodayDate();

            // Verifica se é o último todo do dia ANTES de atualizar (quando está completando)
            let isLastTodo = false;
            if (newStatus === TODO_STATUS.DONE && currentStatus === TODO_STATUS.PENDING) {
                const pendingTodos = todosRef.current.filter((t) => t.status === TODO_STATUS.PENDING);
                isLastTodo = pendingTodos.length === 1 && pendingTodos[0].id === todoId;
            }

            // Atualiza o estado local imediatamente (otimistic update)
            setTodos((prevTodos) => {
                const updatedTodos = prevTodos.map((todo) =>
                    todo.id === todoId ? { ...todo, status: newStatus, progressValue } : todo
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

                // Toca som apropriado
                if (isLastTodo && trumpetsSoundRef.current) {
                    // Toca trombetas quando é o último todo
                    try {
                        await trumpetsSoundRef.current.replayAsync();
                    } catch (soundError) {
                        console.log("Could not play trumpets sound:", soundError);
                        // Fallback para som padrão
                        if (soundRef.current) {
                            try {
                                await soundRef.current.replayAsync();
                            } catch (fallbackError) {
                                console.log("Could not play fallback sound:", fallbackError);
                            }
                        }
                    }
                } else if (soundRef.current) {
                    // Toca som padrão para outros todos
                    try {
                        await soundRef.current.replayAsync();
                    } catch (soundError) {
                        console.log("Could not play sound:", soundError);
                    }
                }
            }

            // Chama o backend em background (não bloqueia a UI)
            updateTodoStatus(todoId, targetDate, newStatus, progressValue)
                .then(() => {
                    // Atualiza global streak quando todos completam ou quando um todo é desmarcado
                    if (isLastTodo || newStatus === TODO_STATUS.PENDING) {
                        useStreakStore.getState().fetchGlobalStreak();
                    }
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
                            todo.id === todoId ? { ...todo, status: currentStatus, progressValue } : todo
                        );
                        const sortedData = sortTodos(revertedTodos);
                        todosRef.current = sortedData;
                        return sortedData;
                    });
                    const errorMessage =
                        err instanceof Error ? err.message : "Failed to update todo status. Please try again.";
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: errorMessage,
                    });
                });
        },
        [sortTodos]
    );

    const handleSkipTodo = useCallback(
        async (todoId: string, progressValue: string, date?: string) => {
            // Usa a data selecionada ou a data de hoje como padrão
            const targetDate = date || getTodayDate();

            // Atualiza o estado local imediatamente (otimistic update)
            setTodos((prevTodos) => {
                const updatedTodos = prevTodos.map((todo) =>
                    todo.id === todoId ? { ...todo, status: TODO_STATUS.SKIPPED, progressValue: "0" } : todo
                );
                const sortedData = sortTodos(updatedTodos);
                todosRef.current = sortedData;
                return sortedData;
            });

            // Chama o backend em background (não bloqueia a UI)
            updateTodoStatus(todoId, targetDate, TODO_STATUS.SKIPPED, "0")
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
                            todo.id === todoId ? { ...todo, status: TODO_STATUS.PENDING, progressValue } : todo
                        );
                        const sortedData = sortTodos(revertedTodos);
                        todosRef.current = sortedData;
                        return sortedData;
                    });
                    const errorMessage = err instanceof Error ? err.message : "Failed to skip todo. Please try again.";
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: errorMessage,
                    });
                });
        },
        [sortTodos]
    );

    const handleUndoSkip = useCallback(
        async (todoId: string, date?: string) => {
            // Usa a data selecionada ou a data de hoje como padrão
            const targetDate = date || getTodayDate();

            // Atualiza o estado local imediatamente (otimistic update)
            setTodos((prevTodos) => {
                const updatedTodos = prevTodos.map((todo) =>
                    todo.id === todoId ? { ...todo, status: TODO_STATUS.PENDING, progressValue: "0" } : todo
                );
                const sortedData = sortTodos(updatedTodos);
                todosRef.current = sortedData;
                return sortedData;
            });

            // Chama o backend em background (não bloqueia a UI)
            updateTodoStatus(todoId, targetDate, TODO_STATUS.PENDING, "0")
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
                            todo.id === todoId ? { ...todo, status: TODO_STATUS.SKIPPED, progressValue: "0" } : todo
                        );
                        const sortedData = sortTodos(updatedTodos);
                        todosRef.current = sortedData;
                        return sortedData;
                    });
                    const errorMessage = err instanceof Error ? err.message : "Failed to undo skip. Please try again.";
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: errorMessage,
                    });
                });
        },
        [sortTodos]
    );

    const handleSkipTodoWithConfirmation = useCallback(
        (todoId: string, todoTitle: string, currentStatus: TodoStatus, progressValue: string, date?: string) => {
            // Se o status for skipped, faz undo (volta para pending)
            if (currentStatus === TODO_STATUS.SKIPPED) {
                handleUndoSkip(todoId, date);
                return;
            }

            // Não permite skip se o status for done
            if (currentStatus === TODO_STATUS.DONE) {
                Toast.show({
                    type: "info",
                    text1: "Cannot Skip",
                    text2: "A completed todo cannot be skipped.",
                });
                return;
            }

            // Só permite skip se o status for pending
            if (currentStatus !== TODO_STATUS.PENDING) {
                return;
            }

            // Faz skip diretamente
            handleSkipTodo(todoId, progressValue, date);
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
        async (todoId: string, status: TodoStatus, progressValue: string, date?: string) => {
            // Usa a data selecionada ou a data de hoje como padrão
            const targetDate = date || getTodayDate();

            // Se o status for skipped, reseta progressValue para 0
            // Para PENDING, mantém o progressValue (permite salvar progresso parcial)
            const finalProgressValue = status === TODO_STATUS.SKIPPED ? "0" : progressValue;

            // Salva o estado anterior usando o ref (acesso síncrono ao estado atual)
            const previousTodo = todosRef.current.find((t) => t.id === todoId);
            const previousStatus = previousTodo?.status || TODO_STATUS.PENDING;
            const previousProgressValue = previousTodo?.progressValue || "0";

            // Verifica se é o último todo do dia ANTES de atualizar (quando está completando)
            let isLastTodo = false;
            if (status === TODO_STATUS.DONE && previousStatus !== TODO_STATUS.DONE) {
                const pendingTodos = todosRef.current.filter((t) => t.status === TODO_STATUS.PENDING);
                isLastTodo = pendingTodos.length === 1 && pendingTodos[0].id === todoId;
            }

            // Atualiza o estado local imediatamente (otimistic update)
            setTodos((prevTodos) => {
                const updatedTodos = prevTodos.map((todo) =>
                    todo.id === todoId ? { ...todo, status, progressValue: finalProgressValue } : todo
                );
                const sortedData = sortTodos(updatedTodos);
                todosRef.current = sortedData;
                return sortedData;
            });

            // Toca som/haptic quando o Todo é concluído
            if (status === TODO_STATUS.DONE) {
                if (isLastTodo && trumpetsSoundRef.current) {
                    // Toca trombetas quando é o último todo
                    try {
                        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        await trumpetsSoundRef.current.replayAsync();
                    } catch (soundError) {
                        console.log("Could not play trumpets sound:", soundError);
                        // Fallback para som padrão
                        await playCompletionSound();
                    }
                } else {
                    // Toca som padrão para outros todos
                    await playCompletionSound();
                }
            }

            // Chama o backend em background (não bloqueia a UI)
            updateTodoStatus(todoId, targetDate, status, finalProgressValue)
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
                                  }
                                : todo
                        );
                        const sortedData = sortTodos(revertedTodos);
                        todosRef.current = sortedData;
                        return sortedData;
                    });
                    const errorMessage = err instanceof Error ? err.message : "Failed to save todo. Please try again.";
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: errorMessage,
                    });
                });
        },
        [sortTodos, playCompletionSound]
    );

    const handleSaveNotes = useCallback(
        async (todoId: string, notes: string, date?: string) => {
            // Usa a data selecionada ou a data de hoje como padrão
            const targetDate = date || getTodayDate();

            // Salva o estado anterior usando o ref
            const previousTodo = todosRef.current.find((t) => t.id === todoId);
            const previousNotes = previousTodo?.notes || "";

            // Atualiza o estado local imediatamente (otimistic update)
            setTodos((prevTodos) => {
                const updatedTodos = prevTodos.map((todo) => (todo.id === todoId ? { ...todo, notes } : todo));
                const sortedData = sortTodos(updatedTodos);
                todosRef.current = sortedData;
                return sortedData;
            });

            // Chama o backend em background (não bloqueia a UI)
            updateTodoNotes(todoId, targetDate, notes)
                .then(() => {
                    // Sincroniza com o backend para garantir consistência usando a data selecionada
                    getTodosByDate(targetDate)
                        .then((data) => {
                            const sortedData = sortTodos(data);
                            setTodos(sortedData);
                            todosRef.current = sortedData;
                        })
                        .catch((err) => {
                            console.error("Error syncing todos after save notes:", err);
                        });
                })
                .catch((err) => {
                    console.error("Error saving notes:", err);
                    // Reverte a mudança otimista em caso de erro
                    setTodos((prevTodos) => {
                        const revertedTodos = prevTodos.map((todo) =>
                            todo.id === todoId ? { ...todo, notes: previousNotes } : todo
                        );
                        const sortedData = sortTodos(revertedTodos);
                        todosRef.current = sortedData;
                        return sortedData;
                    });
                    const errorMessage = err instanceof Error ? err.message : "Failed to save notes. Please try again.";
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: errorMessage,
                    });
                });
        },
        [sortTodos]
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
        handleRefresh,
        handleFocus,
        fetchTodosByDate: fetchTodos,
        handleToggleTodo,
        handleSkipTodoWithConfirmation,
        handleSaveTodo,
        handleSaveNotes,
        playCompletionSound,
    };
}
