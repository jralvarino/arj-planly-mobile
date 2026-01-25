import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { useLoginViewModel } from "../viewmodels/login/useLoginViewModel";

export default function LoginScreen() {
    const { username, password, loading, showPassword, setUsername, setPassword, handleLogin, toggleShowPassword } =
        useLoginViewModel();

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
                <View style={styles.content}>
                    {/* Logo/Title */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Planly</Text>
                        <Text style={styles.subtitle}>Sign in to continue</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Username Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Username</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons
                                    name="person-outline"
                                    size={20}
                                    color={colors.text.body}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your username"
                                    placeholderTextColor={colors.text.body}
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!loading}
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color={colors.text.body}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    placeholderTextColor={colors.text.body}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!loading}
                                />
                                <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeIcon}>
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={colors.text.body}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <Text style={styles.loginButtonText}>{loading ? "Signing in..." : "Sign In"}</Text>
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
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    header: {
        alignItems: "center",
        marginBottom: 48,
    },
    title: {
        fontSize: 48,
        fontWeight: "700",
        color: colors.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.text.body,
        textAlign: "center",
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
    eyeIcon: {
        padding: 4,
    },
    loginButton: {
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
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.white,
    },
});
