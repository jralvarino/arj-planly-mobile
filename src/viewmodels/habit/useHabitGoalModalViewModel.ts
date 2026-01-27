import { useCallback, useMemo, useState } from "react";
import BottomSheetModal from "@gorhom/bottom-sheet";
import { UNIT_OPTIONS, UnitType } from "../../utils/constants";

interface UseHabitGoalModalViewModelProps {
    modalRef: React.RefObject<BottomSheetModal | null>;
    initialValue: string;
    initialUnit: UnitType;
    onConfirm: (value: string, unit: UnitType) => void;
    onDismiss?: () => void;
}

export function useHabitGoalModalViewModel({
    modalRef,
    initialValue,
    initialUnit,
    onConfirm,
    onDismiss,
}: UseHabitGoalModalViewModelProps) {
    const [tempValue, setTempValue] = useState(initialValue);
    const [tempUnit, setTempUnit] = useState<UnitType>(initialUnit);

    // Data sources for wheel pickers
    const quantityDataSource = useMemo(() => Array.from({ length: 100 }, (_, i) => (i + 1).toString()), []);

    const unitDataSource = useMemo(() => UNIT_OPTIONS.map((opt) => opt.label), []);

    // Selected indices for wheel pickers
    const quantityIndex = useMemo(() => Math.max(0, parseInt(initialValue) - 1), [initialValue]);
    const unitIndex = useMemo(() => {
        const index = UNIT_OPTIONS.findIndex((opt) => opt.code === initialUnit);
        return index >= 0 ? index : 0;
    }, [initialUnit]);

    const [selectedQuantityIndex, setSelectedQuantityIndex] = useState(quantityIndex);
    const [selectedUnitIndex, setSelectedUnitIndex] = useState(unitIndex);

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
        onConfirm(tempValue, tempUnit);
        handleDismiss();
    }, [tempValue, tempUnit, onConfirm, handleDismiss]);

    const handleQuantitySelect = useCallback((quantity: number) => {
        const quantityString = quantity.toString();
        setSelectedQuantityIndex(quantity - 1);
        setTempValue(quantityString);
    }, []);

    const handleUnitSelect = useCallback((unitIndex: number) => {
        setSelectedUnitIndex(unitIndex);
        const selectedOption = UNIT_OPTIONS[unitIndex];
        if (selectedOption) {
            setTempUnit(selectedOption.code);
        }
    }, []);

    // Convert quantityDataSource to numbers array
    const quantities = useMemo(() => Array.from({ length: 100 }, (_, i) => i + 1), []);

    // Convert unitDataSource to array of unit objects
    const units = useMemo(() => UNIT_OPTIONS, []);

    return {
        tempValue,
        tempUnit,
        selectedQuantityIndex,
        selectedUnitIndex,
        quantities,
        units,
        handleDismiss,
        handleConfirm,
        handleQuantitySelect,
        handleUnitSelect,
    };
}
