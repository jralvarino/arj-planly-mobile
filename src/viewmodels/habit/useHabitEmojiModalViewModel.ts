import BottomSheetModal from "@gorhom/bottom-sheet";
import { useCallback, useMemo } from "react";
import { Dimensions } from "react-native";

interface UseHabitEmojiModalViewModelProps {
    modalRef: React.RefObject<BottomSheetModal | null>;
    onEmojiSelected: (emoji: string) => void;
    onDismiss?: () => void;
}

export function useHabitEmojiModalViewModel({
    modalRef,
    onEmojiSelected,
    onDismiss,
}: UseHabitEmojiModalViewModelProps) {
    // Calculate available height for emoji selector
    const emojiSelectorHeight = useMemo(() => {
        const screenHeight = Dimensions.get("window").height;
        const modalHeight = screenHeight * 0.95; // 95% snapPoint
        const headerHeight = 60; // Approximate header height
        const padding = 100; // Increased padding to ensure last row is visible
        return modalHeight - headerHeight - padding;
    }, []);

    const handleDismiss = useCallback(() => {
        const ref = modalRef.current as any;
        if (ref) {
            if (ref.forceClose) {
                ref.forceClose();
            } else if (ref.close) {
                ref.close();
            } else if (ref.snapToIndex) {
                ref.snapToIndex(-1);
            }
        }
        onDismiss?.();
    }, [modalRef, onDismiss]);

    const handleEmojiSelected = useCallback(
        (emojiChar: string) => {
            onEmojiSelected(emojiChar);
            handleDismiss();
        },
        [onEmojiSelected, handleDismiss]
    );

    return {
        emojiSelectorHeight,
        handleDismiss,
        handleEmojiSelected,
    };
}
