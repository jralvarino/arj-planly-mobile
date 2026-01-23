export interface Colors {
    primary: string;
    primaryLight: string;
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
    };
    orange: {
        light: string;
        base: string;
        dark: string;
        border: string;
    };
    gold: string;
    white: string;
    error: string;
}

export const colors: Colors = {
    primary: "#6D62E1",
    primaryLight: "#A6A0F7",

    background: "#FFFFFF",
    tabBar: "#FFFFFF",

    text: {
        title: "#222222",
        body: "#555555",
    },

    gray: {
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
    error: "#EF4444",
};
