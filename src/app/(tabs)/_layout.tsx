import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, Tabs } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { colors } from "../../theme/colors";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: styles.tabBar,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <View>
                            <Ionicons
                                name={focused ? "checkmark-done" : "checkmark-done-outline"}
                                size={24}
                                color={focused ? colors.primary : "gray"}
                            />
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="habits"
                options={{
                    headerTitle: "Habits",
                    headerRight: () => (
                        <Pressable onPress={() => router.push("/habits/new")} hitSlop={12} style={{ marginRight: 12 }}>
                            <Ionicons name="add" size={24} color={colors.primary} />
                        </Pressable>
                    ),
                    tabBarIcon: ({ focused, color }) => (
                        <View>
                            <Ionicons
                                name={focused ? "list" : "list-outline"}
                                size={24}
                                color={focused ? colors.primary : "gray"}
                            />
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="statistics"
                options={{
                    headerTitle: "Statistics",
                    tabBarIcon: ({ focused, color }) => (
                        <View>
                            <Ionicons
                                name={focused ? "calendar" : "calendar-outline"}
                                size={24}
                                color={focused ? colors.primary : "gray"}
                            />
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="categories"
                options={{
                    headerTitle: "Category",
                    headerRight: () => (
                        <Pressable
                            onPress={() => router.push("/categories/new")}
                            hitSlop={12}
                            style={{ marginRight: 12 }}
                        >
                            <Ionicons name="add" size={24} color={colors.primary} />
                        </Pressable>
                    ),
                    tabBarIcon: ({ focused, color }) => (
                        <View>
                            <MaterialIcons name="category" size={24} color={focused ? colors.primary : "gray"} />
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="config"
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <View>
                            <Ionicons
                                name={focused ? "settings" : "settings-outline"}
                                size={24}
                                color={focused ? colors.primary : "gray"}
                            />
                        </View>
                    ),
                }}
            />

        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: "absolute",
        bottom: 0,
        left: 16,
        right: 16,
        height: 72,
        elevation: 0,
        backgroundColor: "white",
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },

    addButton: {
        height: 60,
        width: 60,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 99999,
        backgroundColor: "#59008c",
        marginBottom: 30,
    },
});
