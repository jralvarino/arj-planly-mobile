import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Pressable } from "react-native";
import { colors } from "../../theme/colors";

export default function HabitsLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="new"
                options={{
                    title: "New Habit",
                    presentation: "modal",
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} hitSlop={12} style={{ marginLeft: 7 }}>
                            <Ionicons name="arrow-back" size={24} color={colors.primary} />
                        </Pressable>
                    ),
                }}
            />
            <Stack.Screen
                name="[id]"
                options={{
                    title: "Edit Habit",
                    presentation: "modal",
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} hitSlop={12} style={{ marginLeft: 7 }}>
                            <Ionicons name="arrow-back" size={24} color={colors.primary} />
                        </Pressable>
                    ),
                }}
            />
        </Stack>
    );
}
