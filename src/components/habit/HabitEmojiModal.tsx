import { colors } from "@/theme/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import BottomSheetModal, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import EmojiSelector, { Categories } from "react-native-emoji-selector";
import { useHabitEmojiModalViewModel } from "../../viewmodels/habit/useHabitEmojiModalViewModel";

interface HabitEmojiModalProps {
    modalRef: React.RefObject<BottomSheetModal | null>;
    visible: boolean;
    onEmojiSelected: (emoji: string) => void;
    onDismiss?: () => void;
}

export function HabitEmojiModal({ modalRef, visible, onEmojiSelected, onDismiss }: HabitEmojiModalProps) {
    const { emojiSelectorHeight, handleDismiss, handleEmojiSelected } = useHabitEmojiModalViewModel({
        modalRef,
        onEmojiSelected,
        onDismiss,
    });

    return (
        <BottomSheetModal
            ref={modalRef}
            index={-1}
            snapPoints={["95%"]}
            enablePanDownToClose={true}
            backgroundStyle={styles.modalBackground}
            handleIndicatorStyle={styles.modalIndicator}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
            android_keyboardInputMode="adjustResize"
            backdropComponent={(props) => (
                <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} onPress={handleDismiss} />
            )}
        >
            <BottomSheetView style={styles.modalContent}>
                {visible ? (
                    <View style={styles.modalContainer}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={handleDismiss} style={styles.modalCancelButton}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Select Emoji</Text>
                        </View>
                        <View style={[styles.emojiSelectorContainer, { height: emojiSelectorHeight }]}>
                            <EmojiSelector
                                onEmojiSelected={handleEmojiSelected}
                                theme={colors.primary}
                                showTabs={true}
                                showSearchBar={true}
                                showHistory={false}
                                columns={8}
                                category={Categories.emotion}
                                showSectionTitles={false}
                            />
                        </View>
                    </View>
                ) : null}
            </BottomSheetView>
        </BottomSheetModal>
    );
}

const styles = StyleSheet.create({
    modalBackground: {
        backgroundColor: colors.gray[100],
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalIndicator: {
        backgroundColor: colors.gray[300],
        width: 40,
    },
    modalContent: {
        flex: 1,
        padding: 0,
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        paddingTop: 0,
    },
    modalCancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    modalCancelText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.primary,
    },
    modalTitle: {
        fontSize: 18,
        marginRight: 60,
        fontWeight: "700",
        color: colors.text.title,
        flex: 1,
        textAlign: "center",
    },
    emojiSelectorContainer: {
        width: "100%",
        paddingBottom: 80,
    },
});
