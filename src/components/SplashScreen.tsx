import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export function SplashScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Planly</Text>
                <Text style={styles.subtitle}>Your habits, your way</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        alignItems: "center",
    },
    title: {
        fontSize: 56,
        fontWeight: "700",
        color: colors.primary,
        marginBottom: 12,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 18,
        color: colors.text.body,
        fontWeight: "400",
    },
});
