import { Habit } from "@/models/Habit";
import { planlyApiClient } from "../api/planly-api";

export const getAllHabits = async (): Promise<Habit[]> => {
    const { data } = await planlyApiClient.get<any[]>("/habits");
    return data || [];
};

export const getHabitById = async (id: string): Promise<Habit> => {
    const { data } = await planlyApiClient.get<Habit>(`/habits/${id}`);
    console.log(data);
    return data;
};

export const createHabit = async (habitData: Partial<Habit>): Promise<Habit> => {
    console.log(habitData);
    const { data } = await planlyApiClient.post<Habit>("/habits", habitData);
    return data;
};

export const updateHabit = async (id: string, habitData: Partial<Habit>): Promise<Habit> => {
    const { data } = await planlyApiClient.put<Habit>(`/habits/${id}`, habitData);
    return data;
};

export const deleteHabit = async (id: string): Promise<void> => {
    await planlyApiClient.delete(`/habits/${id}`);
};
