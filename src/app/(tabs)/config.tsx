import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../theme/colors";
import { useConfigViewModel } from "../../viewmodels/useConfigViewModel";

export default function ConfigScreen() {
    const { handleLogout } = useConfigViewModel();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Config</Text>
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
