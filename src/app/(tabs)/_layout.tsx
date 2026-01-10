import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
    // Route protection for this group is handled in root _layout.tsx using Stack.Protected
    // So this component doesn't need to manually check authentication

    return (
        <Tabs
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let icon = "home";

                    if (route.name === "index") icon = "home";
                    if (route.name === "profile") icon = "person";

                    return <Ionicons name={icon as any} size={size} color={color} />;
                },
                tabBarActiveTintColor: "#4CAF50",
            })}
        >
            <Tabs.Screen name="index" options={{ title: "Home" }} />
        </Tabs>
    );
}
