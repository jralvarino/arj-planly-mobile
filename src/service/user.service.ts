import { User } from "../interfaces/user/User.interface";
import { planlyApiClient } from "../api/planly-api";

export const getUser = async (): Promise<User> => {
    const { data } = await planlyApiClient.get<User>("/user");
    return data;
};
