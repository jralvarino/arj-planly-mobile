import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { User } from "../interfaces/user/User.interface";
import { getUser } from "../service/user.service";
import { useAuthStore } from "../stores/authStore";
import { colors } from "../theme/colors";

const DRAWER_WIDTH = Math.min(320, Dimensions.get("window").width * 0.85);

interface BurgerMenuProps {
    visible: boolean;
    onClose: () => void;
}

export function BurgerMenu({ visible, onClose }: BurgerMenuProps) {
    const insets = useSafeAreaInsets();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = useCallback(async () => {
        onClose();
        await logout();
    }, [logout, onClose]);

    const fetchUser = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getUser();
            setUser(data);
        } catch (err) {
            console.error("Error fetching user:", err);
            setError(err instanceof Error ? err.message : "Failed to load user");
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (visible) {
            fetchUser();
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -DRAWER_WIDTH,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, slideAnim, backdropOpacity, fetchUser]);

    return (
        <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
            <View style={styles.container}>
                <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                </Animated.View>
                <Animated.View
                    style={[
                        styles.drawer,
                        { width: DRAWER_WIDTH, transform: [{ translateX: slideAnim }], paddingTop: insets.top + 16 },
                    ]}
                >
                    <View style={styles.header}>
                        <Pressable onPress={onClose} hitSlop={12} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.text.body} />
                        </Pressable>
                    </View>
                    {loading ? (
                        <View style={styles.centerContent}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.loadingText}>Loading...</Text>
                        </View>
                    ) : error ? (
                        <View style={styles.centerContent}>
                            <Ionicons name="alert-circle-outline" size={48} color={colors.gray[300]} />
                            <Text style={styles.errorText}>{error}</Text>
                            <Pressable style={styles.retryButton} onPress={fetchUser}>
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </Pressable>
                        </View>
                    ) : user ? (
                        <View style={styles.userSection}>
                            <View style={styles.avatarWrapper}>
                                {user.avatar ? (
                                    <Image
                                        source={{ uri: user.avatar }}
                                        style={styles.avatar}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                        <Text style={styles.avatarPlaceholderText}>
                                            {user.name?.charAt(0)?.toUpperCase() || "?"}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.name} numberOfLines={2}>
                                {user.name}
                            </Text>
                            <View style={styles.metaRow}>
                                <Ionicons name="person-outline" size={14} color={colors.gray[300]} />
                                <Text style={styles.metaText}>{user.userId}</Text>
                            </View>
                            <View style={styles.metaRow}>
                                <Ionicons name="calendar-outline" size={14} color={colors.gray[300]} />
                                <Text style={styles.metaText}>
                                    {user.createdAt
                                        ? moment(user.createdAt).format("DD/MM/YYYY")
                                        : "—"}
                                </Text>
                            </View>
                        </View>
                    ) : null}
                    <View style={styles.menuSection}>
                        <Pressable style={styles.menuItem} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={24} color={colors.error} />
                            <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    drawer: {
        flex: 0,
        backgroundColor: colors.background,
        borderRightWidth: 1,
        borderRightColor: colors.gray[200],
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 24,
    },
    closeButton: {
        padding: 4,
    },
    centerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: colors.text.body,
    },
    errorText: {
        fontSize: 14,
        color: colors.text.body,
        textAlign: "center",
    },
    retryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: colors.primary,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
    },
    userSection: {
        alignItems: "center",
    },
    avatarWrapper: {
        marginBottom: 12,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    avatarPlaceholder: {
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarPlaceholderText: {
        fontSize: 32,
        fontWeight: "700",
        color: "#fff",
    },
    name: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text.title,
        textAlign: "center",
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 4,
    },
    metaText: {
        fontSize: 13,
        color: colors.text.body,
    },
    menuSection: {
        marginTop: 32,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: colors.gray[200],
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: "500",
        color: colors.text.title,
    },
    logoutText: {
        color: colors.error,
    },
});
