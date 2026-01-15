import { colors } from "@/theme/colors";
import { COLORS_HABIT, WEEK_DAYS } from "@/utils/constants";
import Ionicons from "@expo/vector-icons/Ionicons";
import moment from "moment";
import React, { useState } from "react";
import {
    ActivityIndicator,
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
import { useHabitFormViewModel } from "../viewmodels/habit/useHabitFormViewModel";
import { DatePicker } from "./DatePicker";
import { TimePicker } from "./TimePicker";

const UNIT_OPTIONS: Array<{ code: "count" | "pg" | "km" | "ml"; label: string }> = [
    { code: "count", label: "Count" },
    { code: "pg", label: "Pages" },
    { code: "km", label: "Km" },
    { code: "ml", label: "Ml" },
];

const POPULAR_EMOJIS = [
    "smile",
    "heart",
    "thumbsup",
    "fire",
    "star",
    "coffee",
    "book",
    "muscle",
    "running",
    "bicycle",
    "apple",
    "pizza",
    "sleeping",
    "sunny",
    "rainbow",
    "rocket",
    "trophy",
    "medal",
    "musical_note",
    "art",
    "pencil",
    "computer",
    "phone",
    "camera",
    "movie_camera",
    "game_die",
    "soccer",
    "basketball",
    "tennis",
    "swimmer",
    "yoga",
    "meditation",
    "pray",
    "peace_symbol",
    "clap",
    "wave",
    "point_right",
    "ok_hand",
    "v",
    "thumbsdown",
    "punch",
    "fist",
    "hand",
    "point_up",
    "point_down",
    "point_left",
    "raised_hand",
    "open_hands",
    "palms_up_together",
    "handshake",
    "pray",
    "writing_hand",
    "nail_care",
    "selfie",
    "muscle",
    "mechanical_arm",
    "mechanical_leg",
    "leg",
    "foot",
    "ear",
    "eye",
    "nose",
    "brain",
    "tooth",
    "bone",
    "eyes",
    "eye",
    "tongue",
    "lips",
    "baby",
    "child",
    "boy",
    "girl",
    "adult",
    "older_adult",
    "older_person",
    "man",
    "woman",
    "person_with_blond_hair",
    "man_with_gua_pi_mao",
    "person_with_headscarf",
    "person_in_tuxedo",
    "person_with_veil",
    "pregnant_woman",
    "breast_feeding",
    "woman_feeding_baby",
    "angel",
    "santa",
    "mrs_claus",
    "mx_claus",
    "superhero",
    "supervillain",
    "mage",
    "fairy",
    "vampire",
    "merperson",
    "elf",
    "genie",
    "zombie",
    "brain",
    "orange_heart",
    "yellow_heart",
    "green_heart",
    "blue_heart",
    "purple_heart",
    "black_heart",
    "white_heart",
    "brown_heart",
    "heart_exclamation",
    "two_hearts",
    "revolving_hearts",
    "heartbeat",
    "heartpulse",
    "sparkling_heart",
    "cupid",
    "gift_heart",
    "heart_decoration",
    "peace_symbol",
    "latin_cross",
    "star_and_crescent",
    "om",
    "wheel_of_dharma",
    "star_of_david",
    "six_pointed_star",
    "menorah",
    "yin_yang",
    "orthodox_cross",
    "place_of_worship",
    "ophiuchus",
    "aries",
    "taurus",
    "gemini",
    "cancer",
    "leo",
    "virgo",
    "libra",
    "scorpius",
    "sagittarius",
    "capricorn",
    "aquarius",
    "pisces",
    "id",
    "atom_symbol",
    "u7a7a",
    "u5272",
    "radioactive",
    "biohazard",
    "mobile_phone_off",
    "vibration_mode",
    "u6709",
    "u7121",
    "u7533",
    "u55b6",
    "u6708",
    "eight_pointed_black_star",
    "vs",
    "accept",
    "white_flower",
    "ideograph_advantage",
    "secret",
    "congratulations",
    "u5408",
    "u6e80",
    "u7981",
    "a",
    "b",
    "ab",
    "cl",
    "o2",
    "sos",
    "no_entry",
    "name_badge",
    "no_entry_sign",
    "x",
    "o",
    "stop_sign",
    "anger",
    "hotsprings",
    "no_pedestrians",
    "do_not_litter",
    "no_bicycles",
    "non_potable_water",
    "underage",
    "no_mobile_phones",
    "exclamation",
    "grey_exclamation",
    "question",
    "grey_question",
    "bangbang",
    "interrobang",
    "100",
    "low_brightness",
    "high_brightness",
    "trident",
    "fleur_de_lis",
    "part_alternation_mark",
    "warning",
    "children_crossing",
    "beginner",
    "recycle",
    "u6307",
    "chart",
    "sparkle",
    "eight_spoked_asterisk",
    "negative_squared_cross_mark",
    "white_check_mark",
    "diamond_shape_with_a_dot_inside",
    "cyclone",
    "loop",
    "globe_with_meridians",
    "m",
    "atm",
    "sa",
    "passport_control",
    "customs",
    "baggage_claim",
    "left_luggage",
    "wheelchair",
    "no_smoking",
    "wc",
    "parking",
    "potable_water",
    "mens",
    "womens",
    "baby_symbol",
    "restroom",
    "put_litter_in_its_place",
    "cinema",
    "signal_strength",
    "koko",
    "ng",
    "ok",
    "up",
    "cool",
    "new",
    "free",
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "keycap_ten",
    "asterisk",
    "arrow_forward",
    "pause_button",
    "next_track_button",
    "stop_button",
    "record_button",
    "play_or_pause_button",
    "previous_track_button",
    "fast_forward",
    "rewind",
    "twisted_rightwards_arrows",
    "repeat",
    "repeat_one",
    "arrow_backward",
    "arrow_up_small",
    "arrow_down_small",
    "arrow_right",
    "arrow_left",
    "arrow_up",
    "arrow_down",
    "arrow_upper_right",
    "arrow_lower_right",
    "arrow_lower_left",
    "arrow_upper_left",
    "arrow_up_down",
    "left_right_arrow",
    "arrows_counterclockwise",
    "arrow_right_hook",
    "leftwards_arrow_with_hook",
    "arrow_heading_up",
    "arrow_heading_down",
    "arrows_clockwise",
    "hash",
    "information_source",
    "abc",
    "abcd",
    "capital_abcd",
    "symbols",
    "musical_note",
    "notes",
    "wavy_dash",
    "curly_loop",
    "heavy_check_mark",
    "arrows_clockwise",
    "heavy_plus_sign",
    "heavy_minus_sign",
    "heavy_division_sign",
    "heavy_multiplication_x",
    "infinity",
    "heavy_dollar_sign",
    "currency_exchange",
    "copyright",
    "registered",
    "tm",
    "end",
    "back",
    "on",
    "top",
    "soon",
    "ballot_box_with_check",
    "radio_button",
    "white_circle",
    "black_circle",
    "red_circle",
    "large_blue_circle",
    "small_orange_diamond",
    "small_blue_diamond",
    "large_orange_diamond",
    "large_blue_diamond",
    "small_red_triangle",
    "small_red_triangle_down",
    "diamond_shape_with_a_dot_inside",
    "radio_button",
    "white_square_button",
    "black_square_button",
    "black_small_square",
    "white_small_square",
    "black_medium_small_square",
    "white_medium_small_square",
    "black_medium_square",
    "white_medium_square",
    "black_large_square",
    "white_large_square",
    "speaker",
    "mute",
    "sound",
    "loud_sound",
    "bell",
    "no_bell",
    "mega",
    "loudspeaker",
    "speech_left",
    "eye_in_speech_bubble",
    "speech_balloon",
    "thought_balloon",
    "right_anger_bubble",
    "spades",
    "clubs",
    "hearts",
    "diamonds",
    "flower_playing_cards",
    "mahjong",
    "black_joker",
    "a",
    "b",
    "o2",
    "parking",
    "ab",
    "cl",
    "cool",
    "free",
    "information_source",
    "id",
    "m",
    "new",
    "ng",
    "o2",
    "ok",
    "parking",
    "sos",
];

export function HabitFormScreen() {
    const [showWeekDaysModal, setShowWeekDaysModal] = useState(false);
    const [showMonthDaysModal, setShowMonthDaysModal] = useState(false);
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showEmojiModal, setShowEmojiModal] = useState(false);
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
        handleSubmit,
    } = useHabitFormViewModel();

    // Parse periodValue to array of selected days
    // For week days, only parse if periodType is specific_days_week
    const selectedDays =
        periodType === "specific_days_week" && periodValue
            ? periodValue
                  .split(",")
                  .map((day) => day.trim())
                  .filter((day) => day !== "")
            : [];

    // For month days, only parse if periodType is specific_days_month
    const selectedMonthDays =
        periodType === "specific_days_month" && periodValue
            ? periodValue
                  .split(",")
                  .map((day) => day.trim())
                  .filter((day) => day !== "")
            : [];

    // Generate array of month days (1-31)
    const monthDays = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

    // Toggle day selection (for week days)
    const toggleDay = (dayCode: string) => {
        const isSelected = selectedDays.includes(dayCode);
        let newDays: string[];
        if (isSelected) {
            newDays = selectedDays.filter((day) => day !== dayCode);
        } else {
            newDays = [...selectedDays, dayCode];
        }
        setPeriodValue(newDays.join(","));
    };

    // Toggle month day selection
    const toggleMonthDay = (day: string) => {
        const isSelected = selectedMonthDays.includes(day);
        let newDays: string[];
        if (isSelected) {
            newDays = selectedMonthDays.filter((d) => d !== day);
        } else {
            newDays = [...selectedMonthDays, day];
        }
        setPeriodValue(newDays.join(","));
    };

    // Handle period type change - open modal if specific_days_week or specific_days_month
    const handlePeriodTypeChange = (type: "every_day" | "specific_days_week" | "specific_days_month") => {
        // Clear periodValue if changing to every_day or to a different type
        if (type === "every_day" || periodType !== type) {
            setPeriodValue("");
        }
        setPeriodType(type);
        if (type === "specific_days_week") {
            setShowWeekDaysModal(true);
        } else if (type === "specific_days_month") {
            setShowMonthDaysModal(true);
        }
    };

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
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
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
                                onPress={() => setShowEmojiModal(true)}
                                activeOpacity={0.7}
                            >
                                {emoji ? (
                                    <Emoji name={emoji} style={styles.emojiSelectorIconText} />
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
                        />
                    </View>

                    {/* Color Selector */}
                    <View style={styles.section}>
                        <View style={styles.colorRow}>
                            {COLORS_HABIT.map((colorItem) => (
                                <TouchableOpacity
                                    key={colorItem}
                                    onPress={() => setColor(colorItem)}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: colorItem },
                                        color === colorItem && styles.colorOptionSelected,
                                    ]}
                                >
                                    {color === colorItem && <Text style={styles.colorCheckmark}>✓</Text>}
                                </TouchableOpacity>
                            ))}
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
                                {categories.map((category) => (
                                    <TouchableOpacity
                                        key={category.id}
                                        onPress={() => setCategoryId(category.id)}
                                        style={[
                                            styles.categoryTag,
                                            categoryId === category.id && styles.categoryTagSelected,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryTagText,
                                                categoryId === category.id && styles.categoryTagTextSelected,
                                            ]}
                                        >
                                            {category.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
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
                        >
                            <TouchableOpacity
                                onPress={() => handlePeriodTypeChange("every_day")}
                                style={[
                                    styles.periodTypeTag,
                                    periodType === "every_day" && styles.periodTypeTagSelected,
                                ]}
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
                                onPress={() => handlePeriodTypeChange("specific_days_week")}
                                style={[
                                    styles.periodTypeTag,
                                    periodType === "specific_days_week" && styles.periodTypeTagSelected,
                                ]}
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
                                onPress={() => handlePeriodTypeChange("specific_days_month")}
                                style={[
                                    styles.periodTypeTag,
                                    periodType === "specific_days_month" && styles.periodTypeTagSelected,
                                ]}
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
                                                <View key={index} style={styles.selectedValueChip}>
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
                                onPress={() => setPeriod("Anytime")}
                                style={[styles.timeTag, period === "Anytime" && styles.timeTagSelected]}
                            >
                                <Text style={[styles.timeTagText, period === "Anytime" && styles.timeTagTextSelected]}>
                                    Anytime
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setPeriod("Morning")}
                                style={[styles.timeTag, period === "Morning" && styles.timeTagSelected]}
                            >
                                <Text style={[styles.timeTagText, period === "Morning" && styles.timeTagTextSelected]}>
                                    Morning
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setPeriod("Afternoon")}
                                style={[styles.timeTag, period === "Afternoon" && styles.timeTagSelected]}
                            >
                                <Text
                                    style={[styles.timeTagText, period === "Afternoon" && styles.timeTagTextSelected]}
                                >
                                    Afternoon
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setPeriod("Evening")}
                                style={[styles.timeTag, period === "Evening" && styles.timeTagSelected]}
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
                                    onValueChange={setActive}
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

            {/* Emoji Selection Modal */}
            <Modal
                visible={showEmojiModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowEmojiModal(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowEmojiModal(false)}>
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Emoji</Text>
                            <TouchableOpacity onPress={() => setShowEmojiModal(false)} style={styles.modalCloseButton}>
                                <Text style={styles.modalCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.emojiScrollView} showsVerticalScrollIndicator={false}>
                            <View style={styles.emojiGrid}>
                                {POPULAR_EMOJIS.map((emojiName: string) => {
                                    const isSelected = emoji === emojiName;
                                    return (
                                        <TouchableOpacity
                                            key={emojiName}
                                            style={[styles.emojiOption, isSelected && styles.emojiOptionSelected]}
                                            onPress={() => {
                                                setEmoji(emojiName);
                                                setShowEmojiModal(false);
                                            }}
                                        >
                                            <Emoji name={emojiName} style={styles.emojiIcon} />
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
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
    hiddenEmojiInput: {
        position: "absolute",
        opacity: 0,
        width: 0,
        height: 0,
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
    numberInput: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: colors.text.title,
        borderWidth: 1,
        borderColor: colors.gray[200],
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
    emojiScrollView: {
        maxHeight: 400,
    },
    emojiGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 8,
        padding: 8,
    },
    emojiOption: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: colors.gray[100],
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "transparent",
    },
    emojiOptionSelected: {
        borderColor: colors.primary,
        backgroundColor: "#F9FAFB",
    },
    emojiIcon: {
        fontSize: 28,
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
    dateDivider: {
        width: 1,
        backgroundColor: colors.gray[200],
        marginHorizontal: 12,
        marginTop: 32,
        height: 52,
    },
});
