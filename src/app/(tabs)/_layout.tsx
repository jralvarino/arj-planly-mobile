import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, Tabs } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BurgerMenu } from "../../components/BurgerMenu";
import { colors } from "../../theme/colors";

export default function TabsLayout() {
    const [burgerOpen, setBurgerOpen] = useState(false);

    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarShowLabel: true,
                    tabBarStyle: styles.tabBar,
                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: "gray",
                    tabBarLabelStyle: {
                        fontSize: 11,
                        fontWeight: "600",
                        marginTop: 5,
                    },
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <Pressable onPress={() => setBurgerOpen(true)} hitSlop={12} style={styles.burgerButton}>
                            <Ionicons name="menu" size={24} color={colors.primary} />
                        </Pressable>
                    ),
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        headerShown: true,
                        tabBarLabel: "To-do",
                        tabBarShowLabel: false,
                        tabBarIcon: ({ focused, color }) => (
                            <View>
                                <Ionicons
                                    name={focused ? "checkmark-done" : "checkmark-done-outline"}
                                    size={30}
                                    color={focused ? colors.primary : "gray"}
                                />
                            </View>
                        ),
                    }}
                />

                <Tabs.Screen
                    name="habits"
                    options={{
                        tabBarShowLabel: false,
                        headerTitle: () => (
                            <View style={styles.headerTitleContainer}>
                                <Text style={styles.headerTitleText}>Habits</Text>
                            </View>
                        ),
                        headerRight: () => (
                            <Pressable onPress={() => router.push("/habits/new")} hitSlop={12} style={styles.addButton}>
                                <Ionicons name="add" size={24} color={colors.primary} />
                            </Pressable>
                        ),
                        tabBarLabel: "Habits",
                        tabBarIcon: ({ focused, color }) => (
                            <View>
                                <Ionicons
                                    name={focused ? "list" : "list-outline"}
                                    size={30}
                                    color={focused ? colors.primary : "gray"}
                                />
                            </View>
                        ),
                    }}
                />

                <Tabs.Screen
                    name="statistics"
                    options={{
                        tabBarShowLabel: false,
                        headerTitle: () => (
                            <View style={styles.headerTitleContainer}>
                                <Text style={styles.headerTitleText}>Statistics</Text>
                            </View>
                        ),
                        tabBarLabel: "Statistics",
                        tabBarIcon: ({ focused, color }) => (
                            <View>
                                <Ionicons
                                    name={focused ? "pulse" : "pulse-outline"}
                                    size={30}
                                    color={focused ? colors.primary : "gray"}
                                />
                            </View>
                        ),
                    }}
                />

                <Tabs.Screen
                    name="categories"
                    options={{
                        tabBarShowLabel: false,
                        headerTitle: () => (
                            <View style={styles.headerTitleContainer}>
                                <Text style={styles.headerTitleText}>Category</Text>
                            </View>
                        ),
                        headerRight: () => (
                            <Pressable
                                onPress={() => router.push("/categories/new")}
                                hitSlop={12}
                                style={styles.addButton}
                            >
                                <Ionicons name="add" size={24} color={colors.primary} />
                            </Pressable>
                        ),
                        tabBarLabel: "Categories",
                        tabBarIcon: ({ focused, color }) => (
                            <View>
                                <Ionicons name="pricetag" size={30} color={focused ? colors.primary : "gray"} />
                            </View>
                        ),
                    }}
                />

            </Tabs>
            <BurgerMenu visible={burgerOpen} onClose={() => setBurgerOpen(false)} />
        </>
    );
}

const styles = StyleSheet.create({
    burgerButton: {
        marginLeft: 16,
        padding: 8,
        backgroundColor: colors.gray[100],
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    tabBar: {
        position: "absolute",
        bottom: 0,
        left: 16,
        right: 16,
        height: 72,
        elevation: 0,
        backgroundColor: colors.white,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 5,
        paddingBottom: 8,
    },
    addButton: {
        marginRight: 12,
        padding: 8,
        backgroundColor: colors.gray[100],
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitleContainer: {
        backgroundColor: colors.primary,
        paddingHorizontal: 30,
        paddingVertical: 5,
        borderRadius: 15,
    },
    headerTitleText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.white,
    },
});
