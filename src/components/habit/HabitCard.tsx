import { colors } from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Habit } from "../../models/Habit";
import { useHabitCardViewModel } from "../../viewmodels/habit/useHabitCardViewModel";

interface HabitCardProps {
    habit: Habit;
    onEdit?: (habit: Habit) => void;
    onDisable?: (habit: Habit) => void;
    onDelete?: (habit: Habit) => void;
    onPress?: () => void;
}

export function HabitCard({ habit, onEdit, onDisable, onDelete, onPress }: HabitCardProps) {
    const router = useRouter();
    const swipeableRef = useRef<Swipeable>(null);
    const moreButtonRef = useRef<View>(null);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    const { formattedPeriodType, formattedSelectedDates, formattedStartDate, formattedEndDate, goalText, isInactive } =
        useHabitCardViewModel({ habit });

    const handleToggleMenu = useCallback(() => {
        if (!isMenuVisible && moreButtonRef.current) {
            moreButtonRef.current.measure((_x, _y, _width, height, _pageX, pageY) => {
                setMenuPosition({ x: 0, y: pageY + height });
                setIsMenuVisible(true);
            });
        } else {
            setIsMenuVisible(false);
        }
    }, [isMenuVisible]);

    const handleCloseMenu = useCallback(() => {
        setIsMenuVisible(false);
        swipeableRef.current?.close();
    }, []);

    const handleMenuOptionEdit = useCallback(() => {
        handleCloseMenu();
        onEdit?.(habit);
    }, [habit, onEdit, handleCloseMenu]);

    const handleMenuOptionDisable = useCallback(() => {
        handleCloseMenu();
        onDisable?.(habit);
    }, [habit, onDisable, handleCloseMenu]);

    const handleMenuOptionStatistics = useCallback(() => {
        handleCloseMenu();
        router.push({
            pathname: "/(tabs)/statistics",
            params: { habitId: habit.id },
        });
    }, [habit.id, router, handleCloseMenu]);

    const handleMenuOptionDelete = useCallback(() => {
        handleCloseMenu();
        onDelete?.(habit);
    }, [habit, onDelete, handleCloseMenu]);

    const renderRightActions = useCallback(() => {
        return (
            <View style={styles.rightAction}>
                <View ref={moreButtonRef} collapsable={false} style={styles.moreButtonContainer}>
                    <Pressable style={styles.moreButton} onPress={handleToggleMenu}>
                        <Ionicons name="ellipsis-horizontal" size={24} color={colors.text.body} />
                        <Text style={styles.moreButtonText}>Options</Text>
                    </Pressable>
                </View>
            </View>
        );
    }, [handleToggleMenu]);

    const cardContent = (
        <View style={[styles.card, { borderLeftColor: habit.color }]}>
            {isInactive && (
                <View style={styles.inactiveBadge}>
                    <Text style={styles.inactiveText}>Inactive</Text>
                </View>
            )}
            <View style={styles.header}>
                <View style={styles.emojiContainer}>{<Text style={styles.emoji}>{habit.emoji}</Text>}</View>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{habit.title}</Text>
                    {habit.description && <Text style={styles.description}>{habit.description}</Text>}
                </View>
            </View>
            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Goal:</Text>
                    <Text style={styles.detailValue}>{goalText}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Repeat:</Text>
                    <Text style={styles.detailValue}>
                        {formattedPeriodType}
                        {formattedSelectedDates ? ` (${formattedSelectedDates})` : ""}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Time:</Text>
                    <Text style={styles.detailValue}>{habit.period}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Start Date:</Text>
                    <Text style={styles.detailValue}>{formattedStartDate ?? "undefined"}</Text>
                    <Text style={styles.detailSeparator}> → </Text>
                    <Text style={styles.detailValue}>{formattedEndDate ?? "undefined"}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <>
            <Swipeable
                ref={swipeableRef}
                renderRightActions={renderRightActions}
                enabled={true}
                overshootRight={false}
                overshootLeft={false}
                rightThreshold={40}
                friction={2}
            >
                <Pressable onPress={onPress}>{cardContent}</Pressable>
            </Swipeable>

            <Modal visible={isMenuVisible} transparent={true} animationType="fade" onRequestClose={handleCloseMenu}>
                <Pressable style={styles.dropdownOverlay} onPress={handleCloseMenu}>
                    <View style={[styles.dropdownMenu, { top: menuPosition.y, right: 10 }]}>
                        <Pressable
                            style={({ pressed }) => [styles.dropdownItem, pressed && styles.dropdownItemPressed]}
                            onPress={handleMenuOptionEdit}
                        >
                            <Text style={styles.dropdownItemText}>Edit</Text>
                            <Ionicons name="create-outline" size={18} color={colors.text.body} />
                        </Pressable>

                        <View style={styles.dropdownDivider} />

                        <Pressable
                            style={({ pressed }) => [styles.dropdownItem, pressed && styles.dropdownItemPressed]}
                            onPress={handleMenuOptionDisable}
                        >
                            <Text style={styles.dropdownItemText}>{habit.active ? "Disable" : "Enable"}</Text>
                            <Ionicons
                                name={habit.active ? "eye-off-outline" : "eye-outline"}
                                size={18}
                                color={colors.text.body}
                            />
                        </Pressable>

                        <View style={styles.dropdownDivider} />

                        <Pressable
                            style={({ pressed }) => [styles.dropdownItem, pressed && styles.dropdownItemPressed]}
                            onPress={handleMenuOptionStatistics}
                        >
                            <Text style={styles.dropdownItemText}>Statistics</Text>
                            <Ionicons name="stats-chart-outline" size={18} color={colors.text.body} />
                        </Pressable>

                        {onDelete && (
                            <>
                                <View style={styles.dropdownDivider} />
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.dropdownItem,
                                        pressed && styles.dropdownItemPressed,
                                    ]}
                                    onPress={handleMenuOptionDelete}
                                >
                                    <Text style={styles.dropdownItemText}>Delete</Text>
                                    <Ionicons name="trash-outline" size={18} color={colors.text.body} />
                                </Pressable>
                            </>
                        )}
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        position: "relative",
        ...Platform.select({
            ios: {
                shadowColor: colors.shadow,
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
        alignItems: "flex-start",
        marginBottom: 12,
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
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: colors.text.body,
    },
    inactiveBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: colors.warning.light,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.warning.medium,
        zIndex: 10,
    },
    inactiveText: {
        fontSize: 10,
        fontWeight: "600",
        color: colors.warning.text,
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
        minWidth: 60,
    },
    detailValue: {
        fontSize: 12,
        color: colors.text.title,
    },
    detailSeparator: {
        fontSize: 12,
        color: colors.text.body,
        marginHorizontal: 4,
    },
    rightAction: {
        width: 80,
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "stretch",
        marginBottom: 12,
    },
    moreButtonContainer: {
        alignSelf: "stretch",
    },
    moreButton: {
        backgroundColor: colors.gray[200],
        justifyContent: "center",
        alignItems: "center",
        width: 80,
        paddingHorizontal: 12,
        borderRadius: 12,
        height: "100%",
    },
    moreButtonText: {
        color: colors.text.body,
        fontSize: 12,
        fontWeight: "500",
        marginTop: 4,
    },
    dropdownOverlay: {
        flex: 1,
        backgroundColor: colors.overlay.backdrop,
    },
    dropdownMenu: {
        position: "absolute",
        backgroundColor: colors.white,
        borderRadius: 12,
        minWidth: 200,
        paddingVertical: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    dropdownItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: colors.white,
    },
    dropdownItemPressed: {
        backgroundColor: colors.gray[100],
    },
    dropdownItemText: {
        fontSize: 12,
        fontWeight: "500",
        color: colors.text.title,
        flex: 1,
    },
    dropdownDivider: {
        height: 1,
        backgroundColor: colors.gray[100],
        marginHorizontal: 8,
        marginVertical: 0,
    },
});
