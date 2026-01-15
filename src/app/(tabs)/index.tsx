import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../theme/colors";
import { useHomeViewModel } from "../../viewmodels/useHomeViewModel";

export default function HomeScreen() {
    const { handleLogout } = useHomeViewModel();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Home Tab</Text>
            <TouchableOpacity onPress={handleLogout}>
                <Text>Logout</Text>
            </TouchableOpacity>
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
