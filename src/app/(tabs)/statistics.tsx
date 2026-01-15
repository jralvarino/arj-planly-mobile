import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";

export default function StatisticsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>statistics</Text>
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
    title: {
        fontSize: 22,
        color: colors.text.title,
    },
});
