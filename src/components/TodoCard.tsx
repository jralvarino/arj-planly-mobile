import { colors } from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Emoji from "react-native-emoji";
import { Category } from "../models/Category";
import { Todo } from "../models/Todo";

interface TodoCardProps {
    todo: Todo;
    categories?: Category[];
    onToggle?: (todoId: string, currentStatus: "done" | "pending" | "skipped") => void;
}

export function TodoCard({ todo, categories = [], onToggle }: TodoCardProps) {
    const progress = todo.targetValue
        ? (parseFloat(todo.progressValue || "0") / parseFloat(todo.targetValue)) * 100
        : 0;

    const isDone = todo.status === "done";

    const category = categories.find((cat) => cat.id === todo.categoryId);

    return (
        <View style={[styles.card, { borderLeftColor: todo.color }]}>
            <View style={styles.header}>
                <View style={styles.emojiContainer}>
                    {todo.emoji ? (
                        todo.emoji.length <= 2 ? (
                            <Text style={styles.emoji}>{todo.emoji}</Text>
                        ) : (
                            <Emoji name={todo.emoji} style={styles.emoji} />
                        )
                    ) : (
                        <Text style={styles.emoji}>📷</Text>
                    )}
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{todo.title}</Text>
                    {category && (
                        <View style={styles.categoryTag}>
                            <Text style={styles.categoryTagText}>{category.name}</Text>
                        </View>
                    )}
                </View>
                <Pressable
                    onPress={() => onToggle?.(todo.id, todo.status)}
                    style={[styles.checkButton, isDone && styles.checkButtonDone]}
                >
                    <Ionicons
                        name={isDone ? "checkmark-circle" : "checkmark-circle-outline"}
                        size={28}
                        color={isDone ? "#10B981" : colors.gray[300]}
                    />
                </Pressable>
            </View>
            <View style={styles.details}>
                <View style={styles.progressContainer}>
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarBackground}>
                            <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%` }]} />
                        </View>
                    </View>
                    <Text style={styles.progressValue}>
                        {todo.progressValue} / {todo.targetValue} {todo.unit}
                    </Text>
                </View>
                {todo.notes && (
                    <View style={styles.notesContainer}>
                        <Text style={styles.notesLabel}>Notes:</Text>
                        <Text style={styles.notesText}>{todo.notes}</Text>
                    </View>
                )}
                {todo.currentStreak && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Streak:</Text>
                        <Text style={styles.detailValue}>{todo.currentStreak} days</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        position: "relative",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
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
        alignItems: "center",
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
    categoryTag: {
        alignSelf: "flex-start",
        backgroundColor: colors.gray[100],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 4,
    },
    categoryTagText: {
        fontSize: 11,
        fontWeight: "500",
        color: colors.text.body,
    },
    details: {
        gap: 8,
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
        minWidth: 70,
    },
    detailValue: {
        fontSize: 12,
        color: colors.text.title,
    },
    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    progressBarContainer: {
        flex: 1,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: colors.gray[200],
        borderRadius: 4,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    progressValue: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.text.title,
    },
    checkButton: {
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },
    checkButtonDone: {
        // Estilo adicional quando está marcado
    },
    notesContainer: {
        marginTop: 4,
        padding: 8,
        backgroundColor: colors.gray[100],
        borderRadius: 6,
    },
    notesLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.text.body,
        marginBottom: 4,
    },
    notesText: {
        fontSize: 12,
        color: colors.text.title,
    },
});
