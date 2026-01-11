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
}

export const colors: Colors = {
    primary: "#59008c",
    primaryLight: "#7a29b8",

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
};
