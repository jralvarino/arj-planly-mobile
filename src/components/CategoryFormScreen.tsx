import { colors } from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCategoryFormViewModel } from "../viewmodels/category/useCategoryFormViewModel";

export function CategoryFormScreen() {
    const { name, loading, initialLoading, isEditMode, setName, handleSubmit } = useCategoryFormViewModel();

    if (initialLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
                <View style={styles.content}>
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Category Name</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons
                                    name="folder-outline"
                                    size={20}
                                    color={colors.text.body}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter category name"
                                    placeholderTextColor={colors.text.body}
                                    value={name}
                                    onChangeText={setName}
                                    autoCorrect={false}
                                    editable={!loading}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text style={styles.submitButtonText}>
                                {loading
                                    ? isEditMode
                                        ? "Updating..."
                                        : "Creating..."
                                    : isEditMode
                                      ? "Update"
                                      : "Create"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    form: {
        width: "100%",
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text.title,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.gray[200],
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: colors.text.title,
    },
    submitButton: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
        ...Platform.select({
            ios: {
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.white,
    },
});
