export interface AuthResponse {
    token: string;
    user: {
        userId: string;
        name: string;
        avatar?: string;
    };
}
