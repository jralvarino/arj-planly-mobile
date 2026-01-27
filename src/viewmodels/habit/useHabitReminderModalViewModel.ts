import { useCallback, useMemo, useState } from "react";
import BottomSheetModal from "@gorhom/bottom-sheet";

interface UseHabitReminderModalViewModelProps {
    modalRef: React.RefObject<BottomSheetModal | null>;
    initialValue: string;
    onConfirm: (time: string) => void;
    onDismiss?: () => void;
}

export function useHabitReminderModalViewModel({
    modalRef,
    initialValue,
    onConfirm,
    onDismiss,
}: UseHabitReminderModalViewModelProps) {
    // Parse current value or default to 09:00
    const parseInitialValue = useCallback((value: string) => {
        if (value && value.includes(":")) {
            const [hour, minute] = value.split(":");
            return {
                hour: parseInt(hour, 10) || 9,
                minute: parseInt(minute, 10) || 0,
            };
        }
        return { hour: 9, minute: 0 };
    }, []);

    const initialTime = useMemo(() => parseInitialValue(initialValue), [initialValue, parseInitialValue]);

    const [selectedHour, setSelectedHour] = useState(initialTime.hour);
    const [selectedMinute, setSelectedMinute] = useState(initialTime.minute);

    const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
    const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

    const handleDismiss = useCallback(() => {
        const ref = modalRef.current as any;
        if (ref) {
            if (typeof ref.dismiss === "function") {
                ref.dismiss();
            } else if (typeof ref.close === "function") {
                ref.close();
            } else if (typeof ref.collapse === "function") {
                ref.collapse();
            }
        }
        onDismiss?.();
    }, [modalRef, onDismiss]);

    const handleConfirm = useCallback(() => {
        const formattedTime = `${selectedHour.toString().padStart(2, "0")}:${selectedMinute.toString().padStart(2, "0")}`;
        onConfirm(formattedTime);
        handleDismiss();
    }, [selectedHour, selectedMinute, onConfirm, handleDismiss]);

    const handleHourSelect = useCallback((hour: number) => {
        setSelectedHour(hour);
    }, []);

    const handleMinuteSelect = useCallback((minute: number) => {
        setSelectedMinute(minute);
    }, []);

    return {
        selectedHour,
        selectedMinute,
        hours,
        minutes,
        handleDismiss,
        handleConfirm,
        handleHourSelect,
        handleMinuteSelect,
    };
}
