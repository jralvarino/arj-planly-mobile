import { useCallback, useMemo, useState } from "react";
import { TODO_STATUS, Todo } from "../../models/Todo";
import { getTodayDate } from "../../utils/dateUtils";

interface UseHomeScreenViewModelProps {
    todos: Todo[];
}

export function useHomeScreenViewModel({ todos }: UseHomeScreenViewModelProps) {
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());

    // Filtra os todos baseado na categoria selecionada
    const filteredTodos = useMemo(() => {
        if (!selectedCategoryId) {
            return todos;
        }
        return todos.filter((todo) => todo.categoryId === selectedCategoryId);
    }, [todos, selectedCategoryId]);

    // Verifica se todos os TODOS estão done ou skipped
    const allTodosDoneOrSkipped = useMemo(() => {
        if (filteredTodos.length === 0) return false;
        return filteredTodos.every(
            (todo) => todo.status === TODO_STATUS.DONE || todo.status === TODO_STATUS.SKIPPED
        );
    }, [filteredTodos]);

    // Verifica se todos os TODOS estão done (não skipped)
    const allTodosDone = useMemo(() => {
        if (filteredTodos.length === 0) return false;
        return filteredTodos.every((todo) => todo.status === TODO_STATUS.DONE);
    }, [filteredTodos]);

    // Calcula informações de separadores para cada item
    const getItemSeparatorInfo = useCallback(
        (item: Todo, index: number) => {
            // Verifica se este é o primeiro Todo com status "done"
            const isFirstDone =
                !allTodosDone &&
                !allTodosDoneOrSkipped &&
                item.status === TODO_STATUS.DONE &&
                (index === 0 || filteredTodos[index - 1].status !== TODO_STATUS.DONE);

            // Verifica se este é o primeiro Todo com status "skipped"
            const isFirstSkipped =
                !allTodosDone &&
                !allTodosDoneOrSkipped &&
                item.status === TODO_STATUS.SKIPPED &&
                (index === 0 || filteredTodos[index - 1].status !== TODO_STATUS.SKIPPED);

            // Mostra o separador "Congratulations, all done" apenas no primeiro item quando todos estão done
            const showCongratulations = allTodosDone && index === 0;

            return {
                isFirstDone,
                isFirstSkipped,
                showCongratulations,
            };
        },
        [filteredTodos, allTodosDone, allTodosDoneOrSkipped]
    );

    return {
        selectedCategoryId,
        setSelectedCategoryId,
        selectedDate,
        setSelectedDate,
        filteredTodos,
        getItemSeparatorInfo,
    };
}
