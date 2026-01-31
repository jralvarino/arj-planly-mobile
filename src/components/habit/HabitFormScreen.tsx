import { colors } from "@/theme/colors";
import { PeriodType, PeriodTypeValue, WEEK_DAYS } from "@/utils/constants";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useCallback } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    LayoutAnimation,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { useHabitFormViewModel } from "../../viewmodels/habit/useHabitFormViewModel";
import { HabitDateRangeModal } from "./HabitDateRangeModal";
import { HabitEmojiModal } from "./HabitEmojiModal";
import { HabitGoalModal } from "./HabitGoalModal";
import { HabitReminderModal } from "./HabitReminderModal";

export function HabitFormScreen() {
    const {
        title,
        description,
        color,
        emoji,
        unit,
        value,
        periodType,
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
        showEmojiModal,
        emojiBottomSheetRef,
        unitBottomSheetRef,
        reminderTimePickerRef,
        startDatePickerRef,
        endDatePickerRef,
        selectedDays,
        selectedMonthDays,
        monthDays,
        goalText,
        formattedStartDate,
        formattedEndDate,
        setTitle,
        setDescription,
        setColor,
        setEmoji,
        setUnit,
        setValue,
        setCategoryId,
        setPeriod,
        setReminderEnabled,
        setReminderTime,
        setStartDate,
        setEndDate,
        setActive,
        handleActiveChange,
        handleSubmit,
        toggleDay,
        toggleMonthDay,
        handlePeriodTypeChange,
        handleSetPeriod,
        handleSetColor,
        handleSetCategoryId,
        handlePresentEmojiModal,
        handleOpenGoalModal,
        handleOpenReminderModal,
        handleOpenStartDateModal,
        handleOpenEndDateModal,
        setShowEmojiModal,
    } = useHabitFormViewModel();

    const handleFrequencyTypePress = useCallback(
        (type: PeriodTypeValue) => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            handlePeriodTypeChange(type);
        },
        [handlePeriodTypeChange]
    );

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
                        <Ionicons name="warning-outline" size={18} color={colors.warning.dark} />
                        <Text style={styles.inactiveTagText}>This habit is currently inactive</Text>
                    </View>
                )}

                {/* Section: Appearance */}
                <View style={styles.sectionCard}>
                    <View style={[styles.section, styles.sectionAppearanceTitle, styles.appearanceHeader]}>
                        <Text style={[styles.sectionTitle, styles.sectionTitleCompact]}>Appearance</Text>
                        {isEditMode && (
                            <View style={styles.appearanceStatusRow}>
                                <View style={styles.statusToggleContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.statusToggleSegment,
                                            !active && styles.statusToggleSegmentInactiveSelected,
                                        ]}
                                        onPress={() => handleActiveChange(false)}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                styles.statusToggleText,
                                                !active && styles.statusToggleTextInactiveSelected,
                                            ]}
                                        >
                                            Inactive
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.statusToggleSegment, active && styles.statusToggleSegmentSelected]}
                                        onPress={() => handleActiveChange(true)}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                styles.statusToggleText,
                                                active && styles.statusToggleTextSelected,
                                            ]}
                                        >
                                            Active
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                    {/* Title Input */}
                    <View style={[styles.section, styles.sectionTitleToDescription]}>
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
                            {colors.habitColors.map((colorItem) => {
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
                <View style={[styles.sectionCard, styles.categoryCard]}>
                    <View style={[styles.section, styles.categorySection]}>
                        <View style={[styles.goalLabelContainer, styles.categoryLabelContainer]}>
                            <Text style={[styles.sectionTitle, styles.sectionTitleCompact]}>Category</Text>
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

                {/* Frequency Type Card */}
                <View style={[styles.sectionCard, styles.frequencyCard]}>
                    <View style={[styles.section, styles.frequencySection]}>
                        <View style={[styles.goalLabelContainer, styles.frequencyLabelContainer]}>
                            <Text style={[styles.sectionTitle, styles.sectionTitleCompact]}>Frequency</Text>
                        </View>
                        <View style={styles.periodTypeScrollContainer}>
                            <TouchableOpacity
                                onPress={() => handleFrequencyTypePress(PeriodType.EVERY_DAY)}
                                style={[
                                    styles.periodTypeTag,
                                    periodType === PeriodType.EVERY_DAY && styles.periodTypeTagSelected,
                                ]}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.periodTypeTagText,
                                        periodType === PeriodType.EVERY_DAY && styles.periodTypeTagTextSelected,
                                    ]}
                                >
                                    Every Day
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleFrequencyTypePress(PeriodType.WEEKLY)}
                                style={[
                                    styles.periodTypeTag,
                                    periodType === PeriodType.WEEKLY && styles.periodTypeTagSelected,
                                ]}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.periodTypeTagText,
                                        periodType === PeriodType.WEEKLY && styles.periodTypeTagTextSelected,
                                    ]}
                                >
                                    Weekly
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleFrequencyTypePress(PeriodType.MONTHLY)}
                                style={[
                                    styles.periodTypeTag,
                                    periodType === PeriodType.MONTHLY && styles.periodTypeTagSelected,
                                ]}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.periodTypeTagText,
                                        periodType === PeriodType.MONTHLY && styles.periodTypeTagTextSelected,
                                    ]}
                                >
                                    Monthly
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {periodType === PeriodType.WEEKLY && (
                            <View style={[styles.weekDaysRow, { marginTop: 12 }]}>
                                {WEEK_DAYS.map((day) => {
                                    const isSelected = selectedDays.some(
                                        (selectedDay) =>
                                            selectedDay.trim().toUpperCase() === day.code.trim().toUpperCase()
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
                        )}
                        {periodType === PeriodType.MONTHLY && (
                            <View style={[styles.monthDaysGrid, { marginTop: 12 }]}>
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
                        )}
                    </View>
                </View>

                {/* Goal Card */}
                <View style={[styles.sectionCard, styles.goalCard]}>
                    <View style={[styles.section, styles.goalSection]}>
                        {/* Goal Label */}
                        <View style={styles.goalLabelContainer}>
                            <Text style={styles.goalLabel}>Goal</Text>
                        </View>
                        {/* Goal Button */}
                        <View style={styles.goalButtonWrapper}>
                            <TouchableOpacity
                                style={[styles.dateButton, styles.goalButtonFullWidth, styles.goalButtonContainer]}
                                onPress={handleOpenGoalModal}
                            >
                                <Ionicons
                                    name="locate-outline"
                                    size={20}
                                    color={colors.text.body}
                                    style={styles.goalButtonIcon}
                                />
                                <Text style={styles.goalButtonText}>{goalText}</Text>
                                <Ionicons
                                    name="chevron-forward"
                                    size={16}
                                    color={colors.text.body}
                                    style={styles.goalButtonArrow}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Time Card */}
                <View style={styles.sectionCard}>
                    <View style={[styles.section, styles.timeSection]}>
                        <View style={styles.goalLabelContainer}>
                            <Text style={[styles.sectionTitle, styles.sectionTitleCompact]}>Time of the Day</Text>
                        </View>
                        <View style={styles.timeCardsRow}>
                            <TouchableOpacity
                                onPress={() => handleSetPeriod("Anytime")}
                                style={[styles.timeCard, period === "Anytime" && styles.timeCardSelected]}
                                activeOpacity={0.7}
                                delayPressIn={0}
                            >
                                <View
                                    style={[
                                        styles.timeCardIconContainer,
                                        period === "Anytime" && styles.timeCardIconContainerSelected,
                                    ]}
                                >
                                    <Ionicons name="sunny" size={24} color={colors.orange.base} />
                                </View>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.timeCardText, period === "Anytime" && styles.timeCardTextSelected]}
                                >
                                    Anytime
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleSetPeriod("Morning")}
                                style={[styles.timeCard, period === "Morning" && styles.timeCardSelected]}
                                activeOpacity={0.7}
                                delayPressIn={0}
                            >
                                <View
                                    style={[
                                        styles.timeCardIconContainer,
                                        period === "Morning" && styles.timeCardIconContainerSelected,
                                    ]}
                                >
                                    <Ionicons name="partly-sunny" size={24} color={colors.orange.base} />
                                </View>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.timeCardText, period === "Morning" && styles.timeCardTextSelected]}
                                >
                                    Morning
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleSetPeriod("Afternoon")}
                                style={[styles.timeCard, period === "Afternoon" && styles.timeCardSelected]}
                                activeOpacity={0.7}
                                delayPressIn={0}
                            >
                                <View
                                    style={[
                                        styles.timeCardIconContainer,
                                        period === "Afternoon" && styles.timeCardIconContainerSelected,
                                    ]}
                                >
                                    <Ionicons name="sunny" size={24} color={colors.orange.base} />
                                </View>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.timeCardText, period === "Afternoon" && styles.timeCardTextSelected]}
                                >
                                    Afternoon
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleSetPeriod("Evening")}
                                style={[styles.timeCard, period === "Evening" && styles.timeCardSelected]}
                                activeOpacity={0.7}
                                delayPressIn={0}
                            >
                                <View
                                    style={[
                                        styles.timeCardIconContainer,
                                        period === "Evening" && styles.timeCardIconContainerSelected,
                                    ]}
                                >
                                    <Ionicons name="moon" size={24} color={colors.orange.base} />
                                </View>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.timeCardText, period === "Evening" && styles.timeCardTextSelected]}
                                >
                                    Evening
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Reminder Card */}
                <View style={[styles.sectionCard, styles.goalCard]}>
                    <View style={[styles.section, styles.goalSection]}>
                        {/* Reminder Label */}
                        <View style={styles.reminderLabelContainer}>
                            <Text style={styles.goalLabel}>Reminder</Text>
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
                        {/* Reminder Button */}
                        {reminderEnabled && (
                            <View style={styles.goalButtonWrapper}>
                                <TouchableOpacity
                                    style={[styles.dateButton, styles.goalButtonFullWidth, styles.reminderTimeButton]}
                                    onPress={handleOpenReminderModal}
                                >
                                    <Ionicons
                                        name="time-outline"
                                        size={20}
                                        color={colors.text.body}
                                        style={styles.reminderTimeIcon}
                                    />
                                    <Text style={styles.reminderTimeButtonText}>{reminderTime || "Select time"}</Text>
                                    <Ionicons
                                        name="chevron-forward"
                                        size={16}
                                        color={colors.text.body}
                                        style={styles.goalButtonArrow}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {/* Date Range Card */}
                <View style={[styles.sectionCard, styles.goalCard]}>
                    <View style={[styles.section, styles.goalSection]}>
                        {/* Date Range Label */}
                        <View style={styles.goalLabelContainer}>
                            <Text style={styles.goalLabel}>Date Range</Text>
                        </View>
                        {/* Date Range Buttons */}
                        <View style={styles.dateRangeContainer}>
                            <View style={styles.dateRangeRow}>
                                <View style={styles.dateFieldWrapper}>
                                    <Text style={styles.dateFieldLabel}>Start Date</Text>
                                    <TouchableOpacity
                                        style={[styles.dateButton, styles.dateRangeButton]}
                                        onPress={handleOpenStartDateModal}
                                    >
                                        <Ionicons
                                            name="calendar-outline"
                                            size={20}
                                            color={colors.text.body}
                                            style={styles.dateRangeButtonIcon}
                                        />
                                        <Text style={styles.dateRangeButtonText}>{formattedStartDate}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.dateTimelineLine} />
                                <View style={styles.dateFieldWrapper}>
                                    <Text style={styles.dateFieldLabel}>End Date</Text>
                                    <TouchableOpacity
                                        style={[styles.dateButton, styles.dateRangeButton]}
                                        onPress={handleOpenEndDateModal}
                                    >
                                        <Ionicons
                                            name="calendar-outline"
                                            size={20}
                                            color={colors.text.body}
                                            style={styles.dateRangeButtonIcon}
                                        />
                                        <Text style={styles.dateRangeButtonText}>{formattedEndDate}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

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

            {/* Goal Selection Modal */}
            <HabitGoalModal
                modalRef={unitBottomSheetRef}
                initialValue={value || "1"}
                initialUnit={unit}
                onConfirm={(newValue, newUnit) => {
                    setValue(newValue);
                    setUnit(newUnit);
                }}
            />

            {/* Reminder Time Modal */}
            <HabitReminderModal
                modalRef={reminderTimePickerRef}
                initialValue={reminderTime}
                onConfirm={(time) => setReminderTime(time)}
            />

            {/* Start Date Modal */}
            <HabitDateRangeModal
                modalRef={startDatePickerRef}
                initialValue={startDate}
                onConfirm={(date) => setStartDate(date)}
            />

            {/* End Date Modal */}
            <HabitDateRangeModal
                modalRef={endDatePickerRef}
                initialValue={endDate || ""}
                onConfirm={(date) => setEndDate(date)}
            />

            {/* Emoji Selection Modal */}
            <HabitEmojiModal
                modalRef={emojiBottomSheetRef}
                visible={showEmojiModal}
                onEmojiSelected={(emojiChar) => {
                    setEmoji(emojiChar);
                    setShowEmojiModal(false);
                }}
                onDismiss={() => setShowEmojiModal(false)}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 8,
        paddingBottom: 32,
    },
    sectionCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        paddingTop: 12,
        paddingBottom: 20,
        paddingHorizontal: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.gray[200],
        ...Platform.select({
            ios: {
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    categoryCard: {
        paddingTop: 12,
        paddingBottom: 20
    },
    categoryLabelContainer: {
        marginBottom: 12,
    },
    categorySection: {
        marginTop: 0,
        marginBottom: 0,
    },
    frequencyCard: {
        paddingBottom: 20,
    },
    frequencyLabelContainer: {
        marginBottom: 12,
    },
    frequencySection: {
        marginBottom: 0,
    },
    timeSection: {
        marginBottom: 1,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitleToDescription: {
        marginBottom: 20,
    },
    sectionAppearanceTitle: {
        marginBottom: 20,
    },
    appearanceHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    appearanceStatusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    statusToggleContainer: {
        flexDirection: "row",
        borderRadius: 14,
        backgroundColor: colors.gray[200],
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.gray[200],
    },
    statusToggleSegment: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        minWidth: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    statusToggleSegmentSelected: {
        backgroundColor: colors.primary,
    },
    statusToggleSegmentInactiveSelected: {
        backgroundColor: colors.warning.light,
    },
    statusToggleText: {
        fontSize: 11,
        fontWeight: "500",
        color: colors.text.body,
    },
    statusToggleTextSelected: {
        color: colors.white,
        fontWeight: "600",
    },
    statusToggleTextInactiveSelected: {
        color: colors.warning.text,
        fontWeight: "600",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "500",
        color: colors.text.body,
        marginBottom: 12,
    },
    sectionTitleCompact: {
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
        color: colors.white,
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
        justifyContent: "center",
        alignItems: "center",
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
        color: colors.white,
        fontWeight: "600",
    },
    timeCardsRow: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "nowrap",
    },
    timeCard: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderRadius: 16,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray[200],
        alignItems: "center",
        justifyContent: "center",
        minHeight: 110,
    },
    timeCardSelected: {
        backgroundColor: colors.orange.base,
        borderColor: colors.orange.base,
    },
    timeCardIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    timeCardIconContainerSelected: {
        backgroundColor: colors.white,
    },
    timeCardText: {
        fontSize: 11,
        fontWeight: "500",
        color: colors.text.title,
        textAlign: "center",
    },
    timeCardTextSelected: {
        color: colors.white,
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
        justifyContent: "center",
        position: "relative",
    },
    reminderTimeIcon: {
        position: "absolute",
        left: 16,
    },
    reminderTimeButtonText: {
        fontSize: 11,
        fontWeight: "500",
        color: colors.text.title,
        textAlign: "center",
        flex: 1,
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
                shadowColor: colors.shadow,
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
        color: colors.white,
    },
    goalLabelContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 20,
    },
    goalLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: colors.text.body,
    },
    goalButtonWrapper: {
        width: "100%",
        zIndex: 1,
        marginBottom: 0,
    },
    goalSection: {
        marginBottom: 13,
    },
    goalCard: {
        paddingBottom: 12,
    },
    reminderLabelContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    goalButtonFullWidth: {
        width: "100%",
    },
    goalButtonArrow: {
        marginLeft: 8,
    },
    goalButtonContainer: {
        justifyContent: "center",
    },
    goalButtonIcon: {
        position: "absolute",
        left: 16,
    },
    goalButtonText: {
        textAlign: "center",
        flex: 1,
        fontSize: 11,
        fontWeight: "500",
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
        backgroundColor: colors.white,
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
    colorRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        justifyContent: "center",
        alignItems: "center",
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
                shadowColor: colors.shadow,
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
        color: colors.white,
        fontWeight: "bold",
        textShadowColor: colors.textShadow,
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    input: {
        backgroundColor: colors.white,
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
        backgroundColor: colors.white,
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
        color: colors.white,
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
        color: colors.white,
        fontWeight: "700",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.overlay.black,
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        width: "94%",
        maxWidth: 480,
        ...Platform.select({
            ios: {
                shadowColor: colors.shadow,
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
        color: colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
    inactiveTag: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: colors.warning.light,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.warning.medium,
    },
    inactiveTagText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.warning.text,
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
        color: colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.gray[50],
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: colors.text.body,
        fontWeight: "500",
    },
    dateRangeContainer: {
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
    dateRangeButton: {
        justifyContent: "center",
        width: "85%",
    },
    dateRangeButtonIcon: {
        position: "absolute",
        left: 16,
    },
    dateRangeButtonText: {
        textAlign: "center",
        flex: 1,
        fontSize: 11,
        fontWeight: "500",
        color: colors.text.title,
        paddingLeft: 30,
        paddingRight: 24,
    },
    dateButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: colors.gray[200],
        minHeight: 36,
        position: "relative",
        width: "85%",
        justifyContent: "space-between",
    },
    dateButtonIcon: {
        position: "absolute",
        left: 0,
    },
    dateButtonText: {
        fontSize: 11,
        fontWeight: "500",
        color: colors.text.title,
        textAlign: "center",
    },
    dateTimelineLine: {
        position: "absolute",
        left: "50%",
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: colors.gray[300],
        zIndex: 0,
        transform: [{ translateX: -1 }],
    },
});
