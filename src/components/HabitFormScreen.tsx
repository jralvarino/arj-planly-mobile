import { colors } from "@/theme/colors";
import { COLORS_HABIT, WEEK_DAYS } from "@/utils/constants";
import Ionicons from "@expo/vector-icons/Ionicons";
import BottomSheetModal, { BottomSheetView } from "@gorhom/bottom-sheet";
import moment from "moment";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Emoji from "react-native-emoji";
import EmojiSelector, { Categories } from "react-native-emoji-selector";
import { useHabitFormViewModel } from "../viewmodels/habit/useHabitFormViewModel";
import { DatePicker } from "./DatePicker";
import { TimePicker } from "./TimePicker";

const UNIT_OPTIONS: Array<{ code: "count" | "pg" | "km" | "ml"; label: string }> = [
    { code: "count", label: "Count" },
    { code: "pg", label: "Pages" },
    { code: "km", label: "Km" },
    { code: "ml", label: "Ml" },
];

export function HabitFormScreen() {
    const [showWeekDaysModal, setShowWeekDaysModal] = useState(false);
    const [showMonthDaysModal, setShowMonthDaysModal] = useState(false);
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showEmojiModal, setShowEmojiModal] = useState(false);
    const emojiBottomSheetRef = useRef<BottomSheetModal>(null);
    const {
        title,
        description,
        color,
        emoji,
        unit,
        value,
        periodType,
        periodValue,
        categoryId,
        period,
        reminderEnabled,
        reminderTime,
        startDate,
        endDate,
        active,
        isEditMode,
        loading,
        categories,
        categoriesLoading,
        setTitle,
        setDescription,
        setColor,
        setEmoji,
        setUnit,
        setValue,
        setPeriodType,
        setPeriodValue,
        setCategoryId,
        setPeriod,
        setReminderEnabled,
        setReminderTime,
        setStartDate,
        setEndDate,
        setActive,
        handleActiveChange,
        handleSubmit,
        selectedDays,
        selectedMonthDays,
        monthDays,
        toggleDay,
        toggleMonthDay,
        handlePeriodTypeChange,
    } = useHabitFormViewModel();

    // Handler para abrir o modal de emoji
    const handlePresentEmojiModal = useCallback(() => {
        setShowEmojiModal(true);
        const ref = emojiBottomSheetRef.current as any;
        if (ref) {
            // Se tiver o método present, usa ele (BottomSheetModal)
            if (typeof ref.present === "function") {
                ref.present();
            }
            // Caso contrário, usa snapToIndex(0) para abrir (BottomSheet regular)
            else if (typeof ref.snapToIndex === "function") {
                ref.snapToIndex(0);
            }
            // Ou expand() como fallback
            else if (typeof ref.expand === "function") {
                ref.expand();
            }
        }
    }, []);

    // Handler para fechar o modal de emoji
    const handleDismissEmojiModal = useCallback(() => {
        setShowEmojiModal(false);
        const ref = emojiBottomSheetRef.current as any;
        if (ref) {
            // Tenta forceClose() primeiro (força o fechamento)
            if (ref.forceClose) {
                ref.forceClose();
            }
            // Fallback para close()
            else if (ref.close) {
                ref.close();
            }
            // Fallback para snapToIndex(-1)
            else if (ref.snapToIndex) {
                ref.snapToIndex(-1);
            }
        }
    }, []);

    // Handle period type change - open modal if specific_days_week or specific_days_month
    const handlePeriodTypeChangeWithModal = useCallback(
        (type: "every_day" | "specific_days_week" | "specific_days_month") => {
            handlePeriodTypeChange(type);
            if (type === "specific_days_week") {
                setShowWeekDaysModal(true);
            } else if (type === "specific_days_month") {
                setShowMonthDaysModal(true);
            }
        },
        [handlePeriodTypeChange]
    );

    // Memoized handlers for better performance
    const handleSetPeriod = useCallback(
        (periodValue: "Anytime" | "Morning" | "Afternoon" | "Evening") => {
            setPeriod(periodValue);
        },
        [setPeriod]
    );

    const handleSetColor = useCallback(
        (colorValue: string) => {
            setColor(colorValue);
        },
        [setColor]
    );

    const handleSetCategoryId = useCallback(
        (id: string) => {
            setCategoryId(id);
        },
        [setCategoryId]
    );

    // Memoized handler for emoji selection
    const handleEmojiSelected = useCallback(
        (emojiChar: string) => {
            setEmoji(emojiChar);
            setShowEmojiModal(false);
            const ref = emojiBottomSheetRef.current as any;
            if (ref) {
                if (ref.forceClose) {
                    ref.forceClose();
                } else if (ref.close) {
                    ref.close();
                } else if (ref.snapToIndex) {
                    ref.snapToIndex(-1);
                }
            }
        },
        [setEmoji]
    );

    // Calculate available height for emoji selector
    const emojiSelectorHeight = useMemo(() => {
        const screenHeight = Dimensions.get("window").height;
        const modalHeight = screenHeight * 0.95; // 95% snapPoint
        const headerHeight = 60; // Approximate header height
        const padding = 100; // Increased padding to ensure last row is visible
        return modalHeight - headerHeight - padding;
    }, []);

    if (categoriesLoading) {
        return (
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading categories...</Text>
                </View>
            </KeyboardAvoidingView>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                removeClippedSubviews={Platform.OS === "android"}
                scrollEventThrottle={16}
                nestedScrollEnabled={true}
            >
                {/* Inactive Warning Tag */}
                {isEditMode && !active && (
                    <View style={styles.inactiveTag}>
                        <Ionicons name="warning-outline" size={18} color="#F59E0B" />
                        <Text style={styles.inactiveTagText}>This habit is currently inactive</Text>
                    </View>
                )}

                {/* Section: Basic Information */}
                <View style={styles.sectionCard}>
                    {/* Title Input */}
                    <View style={styles.section}>
                        <View style={styles.titleRow}>
                            <TouchableOpacity
                                style={styles.emojiSelectorIcon}
                                onPress={handlePresentEmojiModal}
                                activeOpacity={0.7}
                            >
                                {emoji ? (
                                    <Text style={styles.emojiSelectorIconText}>{emoji}</Text>
                                ) : (
                                    <Text style={styles.emojiSelectorIconText}>😀</Text>
                                )}
                            </TouchableOpacity>
                            <TextInput
                                style={[styles.input, styles.titleInput]}
                                placeholder="Habit name"
                                value={title}
                                onChangeText={setTitle}
                                maxLength={100}
                                returnKeyType="next"
                                blurOnSubmit={false}
                                textContentType="none"
                                autoCorrect={false}
                            />
                        </View>
                    </View>

                    {/* Description Input */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Add a description (optional)"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            maxLength={500}
                            returnKeyType="done"
                            blurOnSubmit={true}
                            textContentType="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* Color Selector */}
                    <View style={styles.section}>
                        <View style={styles.colorRow}>
                            {COLORS_HABIT.map((colorItem) => {
                                const isSelected = color === colorItem;
                                return (
                                    <TouchableOpacity
                                        key={colorItem}
                                        onPress={() => handleSetColor(colorItem)}
                                        style={[
                                            styles.colorOption,
                                            { backgroundColor: colorItem },
                                            isSelected && styles.colorOptionSelected,
                                        ]}
                                        activeOpacity={0.7}
                                        delayPressIn={0}
                                    >
                                        {isSelected && <Text style={styles.colorCheckmark}>✓</Text>}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </View>

                {/* Category Card */}
                <View style={styles.sectionCard}>
                    <View style={styles.section}>
                        <View style={styles.goalLabelContainer}>
                            <Text style={[styles.sectionTitle, styles.repeatTitle]}>Category</Text>
                        </View>
                        {categories.length > 0 ? (
                            <View style={styles.categoryRow}>
                                {categories.map((category) => {
                                    const isSelected = categoryId === category.id;
                                    return (
                                        <TouchableOpacity
                                            key={category.id}
                                            onPress={() => handleSetCategoryId(category.id)}
                                            style={[styles.categoryTag, isSelected && styles.categoryTagSelected]}
                                            activeOpacity={0.7}
                                            delayPressIn={0}
                                        >
                                            <Text
                                                style={[
                                                    styles.categoryTagText,
                                                    isSelected && styles.categoryTagTextSelected,
                                                ]}
                                            >
                                                {category.name}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ) : (
                            <Text style={styles.emptyCategoriesText}>No categories available</Text>
                        )}
                    </View>
                </View>

                {/* Period Type Card */}
                <View style={styles.sectionCard}>
                    <View style={styles.section}>
                        <View style={styles.goalLabelContainer}>
                            <Text style={[styles.sectionTitle, styles.repeatTitle]}>Repeat</Text>
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.periodTypeScrollContainer}
                            keyboardShouldPersistTaps="handled"
                            removeClippedSubviews={true}
                        >
                            <TouchableOpacity
                                onPress={() => handlePeriodTypeChangeWithModal("every_day")}
                                style={[
                                    styles.periodTypeTag,
                                    periodType === "every_day" && styles.periodTypeTagSelected,
                                ]}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.periodTypeTagText,
                                        periodType === "every_day" && styles.periodTypeTagTextSelected,
                                    ]}
                                >
                                    Every Day
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handlePeriodTypeChangeWithModal("specific_days_week")}
                                style={[
                                    styles.periodTypeTag,
                                    periodType === "specific_days_week" && styles.periodTypeTagSelected,
                                ]}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.periodTypeTagText,
                                        periodType === "specific_days_week" && styles.periodTypeTagTextSelected,
                                    ]}
                                >
                                    Weekly
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handlePeriodTypeChangeWithModal("specific_days_month")}
                                style={[
                                    styles.periodTypeTag,
                                    periodType === "specific_days_month" && styles.periodTypeTagSelected,
                                ]}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.periodTypeTagText,
                                        periodType === "specific_days_month" && styles.periodTypeTagTextSelected,
                                    ]}
                                >
                                    Monthly
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                        {(periodType === "specific_days_week" || periodType === "specific_days_month") &&
                            periodValue && (
                                <View style={styles.selectedValuesContainer}>
                                    <View style={styles.selectedValuesChipsContainer}>
                                        {periodValue
                                            .split(",")
                                            .filter((day) => day.trim() !== "")
                                            .map((day, index) => (
                                                <View key={`${day}-${index}`} style={styles.selectedValueChip}>
                                                    <Text style={styles.selectedValueChipText}>{day.trim()}</Text>
                                                </View>
                                            ))}
                                    </View>
                                </View>
                            )}
                    </View>
                </View>

                {/* Goal Card */}
                <View style={styles.sectionCard}>
                    <View style={styles.section}>
                        {/* Goal Label */}
                        <View style={styles.goalLabelContainer}>
                            <Text style={styles.goalLabel}>Goal</Text>
                        </View>
                        {/* Value and Unit Row */}
                        <View style={styles.valueUnitRow}>
                            <View style={styles.valueContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter value"
                                    value={value}
                                    onChangeText={setValue}
                                    keyboardType="numeric"
                                    maxLength={10}
                                    returnKeyType="done"
                                    blurOnSubmit={true}
                                />
                            </View>
                            <View style={styles.unitContainer}>
                                <TouchableOpacity style={styles.unitButton} onPress={() => setShowUnitModal(true)}>
                                    <Text style={styles.unitButtonText}>
                                        {UNIT_OPTIONS.find((opt) => opt.code === unit)?.label || "Select unit"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Time Card */}
                <View style={styles.sectionCard}>
                    <View style={styles.section}>
                        <View style={styles.goalLabelContainer}>
                            <Text style={[styles.sectionTitle, styles.repeatTitle]}>Time</Text>
                        </View>
                        <View style={styles.timeTagsRow}>
                            <TouchableOpacity
                                onPress={() => handleSetPeriod("Anytime")}
                                style={[styles.timeTag, period === "Anytime" && styles.timeTagSelected]}
                                activeOpacity={0.7}
                                delayPressIn={0}
                            >
                                <Text style={[styles.timeTagText, period === "Anytime" && styles.timeTagTextSelected]}>
                                    Anytime
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleSetPeriod("Morning")}
                                style={[styles.timeTag, period === "Morning" && styles.timeTagSelected]}
                                activeOpacity={0.7}
                                delayPressIn={0}
                            >
                                <Text style={[styles.timeTagText, period === "Morning" && styles.timeTagTextSelected]}>
                                    Morning
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleSetPeriod("Afternoon")}
                                style={[styles.timeTag, period === "Afternoon" && styles.timeTagSelected]}
                                activeOpacity={0.7}
                                delayPressIn={0}
                            >
                                <Text
                                    style={[styles.timeTagText, period === "Afternoon" && styles.timeTagTextSelected]}
                                >
                                    Afternoon
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleSetPeriod("Evening")}
                                style={[styles.timeTag, period === "Evening" && styles.timeTagSelected]}
                                activeOpacity={0.7}
                                delayPressIn={0}
                            >
                                <Text style={[styles.timeTagText, period === "Evening" && styles.timeTagTextSelected]}>
                                    Evening
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Reminder Card */}
                <View style={[styles.sectionCard, !reminderEnabled && styles.sectionCardCompact]}>
                    <View style={[styles.section, !reminderEnabled && styles.sectionCompact]}>
                        <View style={styles.reminderHeader}>
                            <View style={styles.goalLabelContainer}>
                                <Text style={[styles.sectionTitle, styles.repeatTitle]}>Reminder</Text>
                            </View>
                            <Switch
                                value={reminderEnabled}
                                onValueChange={(value) => {
                                    setReminderEnabled(value);
                                    if (!value) {
                                        setReminderTime("");
                                    }
                                }}
                                trackColor={{ false: colors.gray[200], true: colors.primary }}
                                thumbColor="white"
                            />
                        </View>
                        {reminderEnabled && (
                            <View style={styles.reminderTimeContainer}>
                                <Text style={styles.reminderTimeLabel}>Time</Text>
                                <TouchableOpacity
                                    style={styles.reminderTimeButton}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <Ionicons
                                        name="time-outline"
                                        size={20}
                                        color={colors.text.body}
                                        style={styles.reminderTimeIcon}
                                    />
                                    <Text style={styles.reminderTimeButtonText}>{reminderTime || "Select time"}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {/* Date Range Card */}
                <View style={[styles.sectionCard, styles.sectionCardCompact]}>
                    <View style={[styles.section, styles.sectionCompact]}>
                        <View style={styles.reminderHeader}>
                            <View style={styles.goalLabelContainer}>
                                <Text style={[styles.sectionTitle, styles.repeatTitle]}>Date Range</Text>
                            </View>
                        </View>
                        <View style={styles.dateRangeContainer}>
                            <View style={styles.dateRangeRow}>
                                <View style={styles.dateFieldWrapper}>
                                    <Text style={styles.dateFieldLabel}>Start Date</Text>
                                    <TouchableOpacity
                                        style={styles.dateButton}
                                        onPress={() => setShowStartDatePicker(true)}
                                    >
                                        <Ionicons
                                            name="calendar-outline"
                                            size={16}
                                            color={colors.text.body}
                                            style={styles.dateButtonIcon}
                                        />
                                        <Text style={styles.dateButtonText}>
                                            {startDate
                                                ? moment(startDate, "YYYY-MM-DD").format("DD/MM/YYYY")
                                                : "Select"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.dateTimelineLine} />
                                <View style={styles.dateFieldWrapper}>
                                    <Text style={styles.dateFieldLabel}>End Date</Text>
                                    <TouchableOpacity
                                        style={styles.dateButton}
                                        onPress={() => setShowEndDatePicker(true)}
                                    >
                                        <Ionicons
                                            name="calendar-outline"
                                            size={16}
                                            color={colors.text.body}
                                            style={styles.dateButtonIcon}
                                        />
                                        <Text style={styles.dateButtonText}>
                                            {endDate ? moment(endDate, "YYYY-MM-DD").format("DD/MM/YYYY") : "Select"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Active Card - Only show in edit mode */}
                {isEditMode && (
                    <View style={[styles.sectionCard, styles.sectionCardCompact]}>
                        <View style={[styles.section, styles.sectionCompact]}>
                            <View style={styles.statusHeader}>
                                <Text style={[styles.sectionTitle, styles.repeatTitle]}>Status</Text>
                                <Switch
                                    value={active}
                                    onValueChange={handleActiveChange}
                                    trackColor={{ false: colors.gray[200], true: colors.primary }}
                                    thumbColor="white"
                                />
                            </View>
                        </View>
                    </View>
                )}

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text style={styles.saveButtonText}>
                        {loading ? "Saving..." : isEditMode ? "Update Habit" : "Create Habit"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Week Days Selection Modal */}
            <Modal
                visible={showWeekDaysModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowWeekDaysModal(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowWeekDaysModal(false)}>
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Days of the Week</Text>
                            <TouchableOpacity
                                onPress={() => setShowWeekDaysModal(false)}
                                style={styles.modalCloseButton}
                            >
                                <Text style={styles.modalCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.weekDaysRow}>
                            {WEEK_DAYS.map((day) => {
                                const isSelected = selectedDays.some(
                                    (selectedDay) => selectedDay.trim().toUpperCase() === day.code.trim().toUpperCase()
                                );
                                return (
                                    <TouchableOpacity
                                        key={day.code}
                                        onPress={() => toggleDay(day.code)}
                                        style={[styles.weekDayCircle, isSelected && styles.weekDayCircleSelected]}
                                    >
                                        <Text
                                            style={[
                                                styles.weekDayCircleText,
                                                isSelected && styles.weekDayCircleTextSelected,
                                            ]}
                                        >
                                            {day.code}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <TouchableOpacity style={styles.modalSaveButton} onPress={() => setShowWeekDaysModal(false)}>
                            <Text style={styles.modalSaveButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            {/* Month Days Selection Modal */}
            <Modal
                visible={showMonthDaysModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowMonthDaysModal(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowMonthDaysModal(false)}>
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Days of the Month</Text>
                            <TouchableOpacity
                                onPress={() => setShowMonthDaysModal(false)}
                                style={styles.modalCloseButton}
                            >
                                <Text style={styles.modalCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.monthDaysGrid}>
                            {monthDays.map((day) => {
                                const isSelected = selectedMonthDays.some(
                                    (selectedDay) => selectedDay.trim() === day.trim()
                                );
                                return (
                                    <TouchableOpacity
                                        key={day}
                                        onPress={() => toggleMonthDay(day)}
                                        style={[styles.monthDayCircle, isSelected && styles.monthDayCircleSelected]}
                                    >
                                        <Text
                                            style={[
                                                styles.monthDayCircleText,
                                                isSelected && styles.monthDayCircleTextSelected,
                                            ]}
                                        >
                                            {day}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <TouchableOpacity style={styles.modalSaveButton} onPress={() => setShowMonthDaysModal(false)}>
                            <Text style={styles.modalSaveButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            {/* Unit Selection Modal */}
            <Modal
                visible={showUnitModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowUnitModal(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowUnitModal(false)}>
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Unit</Text>
                            <TouchableOpacity onPress={() => setShowUnitModal(false)} style={styles.modalCloseButton}>
                                <Text style={styles.modalCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.unitOptionsRow}>
                            {UNIT_OPTIONS.map((option) => {
                                const isSelected = unit === option.code;
                                return (
                                    <TouchableOpacity
                                        key={option.code}
                                        onPress={() => {
                                            setUnit(option.code);
                                            setShowUnitModal(false);
                                        }}
                                        style={[styles.periodTypeTag, isSelected && styles.periodTypeTagSelected]}
                                    >
                                        <Text
                                            style={[
                                                styles.periodTypeTagText,
                                                isSelected && styles.periodTypeTagTextSelected,
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </Pressable>
            </Modal>

            {/* Time Picker */}
            <TimePicker
                visible={showTimePicker}
                value={reminderTime}
                onClose={() => setShowTimePicker(false)}
                onConfirm={(time) => setReminderTime(time)}
            />

            {/* Start Date Picker */}
            <DatePicker
                visible={showStartDatePicker}
                value={startDate}
                onClose={() => setShowStartDatePicker(false)}
                onConfirm={(date) => setStartDate(date)}
            />

            {/* End Date Picker */}
            <DatePicker
                visible={showEndDatePicker}
                value={endDate || ""}
                onClose={() => setShowEndDatePicker(false)}
                onConfirm={(date) => setEndDate(date)}
            />

            {/* Emoji Selection Bottom Sheet */}
            <BottomSheetModal
                ref={emojiBottomSheetRef}
                index={-1}
                snapPoints={["95%"]}
                enablePanDownToClose={true}
                backgroundStyle={styles.emojiBottomSheetBackground}
                handleIndicatorStyle={styles.emojiBottomSheetIndicator}
                keyboardBehavior="interactive"
                keyboardBlurBehavior="restore"
                android_keyboardInputMode="adjustResize"
            >
                <BottomSheetView style={styles.emojiBottomSheetContent}>
                    {showEmojiModal ? (
                        <View style={styles.emojiModalContainer}>
                            <View style={styles.emojiModalHeader}>
                                <Text style={styles.emojiModalTitle}>Select Emoji</Text>
                                <TouchableOpacity
                                    onPress={handleDismissEmojiModal}
                                    style={styles.emojiModalCloseButton}
                                >
                                    <Ionicons name="close" size={24} color={colors.gray[300]} />
                                </TouchableOpacity>
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
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAFAFA",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 8,
        paddingBottom: 32,
    },
    sectionCard: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.gray[200],
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    sectionCardCompact: {
        padding: 12,
    },
    sectionCompact: {
        marginBottom: 0,
    },
    statusHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text.title,
        marginBottom: 12,
    },
    repeatTitle: {
        marginBottom: 0,
        lineHeight: 30,
    },
    categoryRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    categoryTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: colors.gray[100],
        borderWidth: 2,
        borderColor: colors.gray[200],
        width: "30%",
        minWidth: 100,
        alignItems: "center",
        justifyContent: "center",
    },
    categoryTagSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    categoryTagText: {
        fontSize: 12,
        fontWeight: "500",
        color: colors.text.title,
    },
    categoryTagTextSelected: {
        color: "white",
        fontWeight: "600",
    },
    emptyCategoriesText: {
        fontSize: 14,
        color: colors.text.body,
        fontStyle: "italic",
        paddingVertical: 12,
    },
    periodTypeScrollContainer: {
        flexDirection: "row",
        gap: 8,
        paddingRight: 8,
    },
    periodTypeTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: colors.gray[100],
        borderWidth: 2,
        borderColor: colors.gray[200],
    },
    periodTypeTagSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    periodTypeTagText: {
        fontSize: 12,
        fontWeight: "500",
        color: colors.text.title,
    },
    periodTypeTagTextSelected: {
        color: "white",
        fontWeight: "600",
    },
    timeTagsRow: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "nowrap",
    },
    timeTag: {
        flex: 1,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: colors.gray[100],
        borderWidth: 2,
        borderColor: colors.gray[200],
        alignItems: "center",
        justifyContent: "center",
    },
    timeTagSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    timeTagText: {
        fontSize: 11,
        fontWeight: "500",
        color: colors.text.title,
    },
    timeTagTextSelected: {
        color: "white",
        fontWeight: "600",
    },
    reminderHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    reminderTimeContainer: {
        marginTop: 12,
    },
    reminderTimeLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text.title,
        marginBottom: 8,
    },
    reminderTimeButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.gray[200],
        minHeight: 52,
        position: "relative",
    },
    reminderTimeIcon: {
        position: "absolute",
        left: 16,
    },
    reminderTimeButtonText: {
        flex: 1,
        fontSize: 16,
        fontWeight: "500",
        color: colors.text.title,
        textAlign: "center",
    },
    selectedValuesContainer: {
        marginTop: 12,
        padding: 14,
        backgroundColor: colors.gray[100],
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.gray[200],
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    selectedValuesChipsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
    },
    selectedValueChip: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 18,
        backgroundColor: colors.primary,
        borderWidth: 1,
        borderColor: colors.primary,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    selectedValueChipText: {
        fontSize: 10,
        fontWeight: "600",
        color: "white",
    },
    goalLabelContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 12,
    },
    goalLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text.title,
    },
    valueUnitRow: {
        flexDirection: "row",
        gap: 12,
    },
    valueContainer: {
        flex: 1,
    },
    unitContainer: {
        flex: 1,
    },
    unitButton: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.gray[200],
        alignItems: "center",
        justifyContent: "center",
        minHeight: 52,
    },
    unitButtonText: {
        fontSize: 16,
        fontWeight: "500",
        color: colors.text.title,
    },
    unitOptionsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        justifyContent: "center",
    },
    colorRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 25,
        borderWidth: 3,
        borderColor: colors.gray[200],
        alignItems: "center",
        justifyContent: "center",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    colorOptionSelected: {
        borderColor: colors.primary,
        borderWidth: 4,
    },
    colorCheckmark: {
        fontSize: 24,
        color: "white",
        fontWeight: "bold",
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    input: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: colors.text.title,
        borderWidth: 1,
        borderColor: colors.gray[200],
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    titleInput: {
        flex: 1,
    },
    emojiSelectorIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "white",
        borderWidth: 2,
        borderColor: colors.gray[200],
        justifyContent: "center",
        alignItems: "center",
    },
    emojiSelectorIconText: {
        fontSize: 28,
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    weekDaysRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        flexWrap: "nowrap",
    },
    weekDayCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.gray[100],
        borderWidth: 2,
        borderColor: colors.gray[200],
        alignItems: "center",
        justifyContent: "center",
    },
    weekDayCircleSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    weekDayCircleText: {
        fontSize: 11,
        fontWeight: "600",
        color: colors.text.body,
    },
    weekDayCircleTextSelected: {
        color: "white",
        fontWeight: "700",
    },
    monthDaysGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    monthDayCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.gray[100],
        borderWidth: 2,
        borderColor: colors.gray[200],
        alignItems: "center",
        justifyContent: "center",
    },
    monthDayCircleSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    monthDayCircleText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text.body,
    },
    monthDayCircleTextSelected: {
        color: "white",
        fontWeight: "700",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 20,
        width: "94%",
        maxWidth: 480,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.text.title,
    },
    modalCloseButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.gray[100],
        alignItems: "center",
        justifyContent: "center",
    },
    modalCloseText: {
        fontSize: 18,
        color: colors.text.body,
        fontWeight: "600",
    },
    modalSaveButton: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },
    modalSaveButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    emojiBottomSheetBackground: {
        backgroundColor: colors.gray[100],
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    emojiBottomSheetIndicator: {
        backgroundColor: colors.gray[300],
        width: 40,
    },
    emojiBottomSheetContent: {
        flex: 1,
        paddingHorizontal: 0,
    },
    emojiModalContainer: {
        flex: 1,
    },
    emojiSelectorContainer: {
        width: "100%",
        paddingBottom: 80,
    },
    emojiModalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        paddingTop: Platform.OS === "ios" ? 10 : 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    emojiModalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000000",
    },
    emojiModalCloseButton: {
        padding: 3,
        backgroundColor: colors.gray[200],
        borderRadius: 20,

    },
    inactiveTag: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#FEF3C7",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#FCD34D",
    },
    inactiveTagText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#92400E",
    },
    saveButton: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 24,
        marginBottom: 32,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FAFAFA",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: colors.text.body,
        fontWeight: "500",
    },
    dateRangeContainer: {
        marginTop: 8,
        position: "relative",
    },
    dateRangeRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 0,
        position: "relative",
    },
    dateFieldWrapper: {
        flex: 1,
        alignItems: "center",
        zIndex: 1,
    },
    dateFieldLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: colors.text.title,
        marginBottom: 6,
        textAlign: "center",
    },
    dateButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: colors.gray[200],
        minHeight: 36,
        position: "relative",
        width: "85%",
    },
    dateButtonIcon: {
        position: "absolute",
        left: 8,
    },
    dateButtonText: {
        flex: 1,
        fontSize: 11,
        fontWeight: "500",
        color: colors.text.title,
        textAlign: "center",
    },
    dateTimelineLine: {
        position: "absolute",
        left: "20%",
        right: "20%",
        top: 44,
        height: 2,
        backgroundColor: colors.gray[200],
        zIndex: 0,
    },
});
