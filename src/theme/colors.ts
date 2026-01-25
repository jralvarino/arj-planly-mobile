export interface Colors {
    primary: string;
    primaryLight: string;
    habitDefault: string;
    habitColors: string[];
    background: string;
    tabBar: string;
    text: {
        title: string;
        body: string;
    };
    gray: {
        100: string;
        200: string;
        300: string;
        50: string;
    };
    orange: {
        light: string;
        base: string;
        dark: string;
        border: string;
    };
    gold: string;
    white: string;
    black: string;
    error: string;
    warning: {
        light: string;
        base: string;
        medium: string;
        dark: string;
        text: string;
    };
    success: string;
    overlay: {
        white: string;
        white90: string;
        black: string;
        backdrop: string;
    };
    shadow: string;
    textShadow: string;
    toast: {
        success: string;
        info: string;
        error: string;
    };
}

export const colors: Colors = {
    primary: "#6D62E1",
    primaryLight: "#A6A0F7",
    habitDefault: "#59008c",
    habitColors: [
        "#f3eafe",
        "#D8FFFB",
        "#d6fce9",
        "#ffe4e6",
        "#fff4e6",
        "#e6f3ff",
        "#f0e6ff",
        "#ffe6f0",
        "#e6ffe6",
        "#fff9e6",
    ],

    background: "#FFFFFF",
    tabBar: "#FFFFFF",

    text: {
        title: "#222222",
        body: "#555555",
    },

    gray: {
        50: "#FAFAFA",
        100: "#f7f7f7",
        200: "#e1e1e1",
        300: "#c4c4c4",
    },
    orange: {
        light: "#FFF2E5",
        base: "#FF9500",
        dark: "#FFD6AF",
        border: "#E67E00",
    },
    gold: "#FFD700",
    white: "#FFFFFF",
    black: "#000000",
    error: "#EF4444",
    warning: {
        light: "#FEF3C7",
        base: "#FBBF24",
        medium: "#FCD34D",
        dark: "#F59E0B",
        text: "#92400E",
    },
    success: "#10B981",
    overlay: {
        white: "rgba(255, 255, 255, 0.5)",
        white90: "rgba(255, 255, 255, 0.9)",
        black: "rgba(0, 0, 0, 0.5)",
        backdrop: "rgba(0,0,0,0.4)",
    },
    shadow: "#000",
    textShadow: "rgba(0, 0, 0, 0.3)",
    toast: {
        success: "#10B981",
        info: "#FBBF24",
        error: "#EF4444",
    },
};
