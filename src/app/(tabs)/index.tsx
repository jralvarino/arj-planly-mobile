import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useHomeViewModel } from "../../viewmodels/useHomeViewModel";

export default function Home() {
    const { handleLogout } = useHomeViewModel();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Home Tab</Text>
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 22,
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#4CAF50",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
});
