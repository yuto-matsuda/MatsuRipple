import { apiClient } from './client';
import type { Festival, FestivalCreate } from '../types/festival';

export const fetchFestivals = async (): Promise<Festival[]> => {
    const response = await apiClient.get<Festival[]>('/festivals/');
    return response.data;
};

export const fetchFestival = async (id: number): Promise<Festival> => {
    const response = await apiClient.get<Festival>(`/festivals/${id}`);
    return response.data;
};

export const createFestival = async (festival: FestivalCreate): Promise<Festival> => {
    const response = await apiClient.post<Festival>('/festivals/', festival);
    return response.data;
};

export const updateFestival = async (id: number, festival: FestivalCreate): Promise<Festival> => {
    const response = await apiClient.put<Festival>(`/festivals/${id}`, festival);
    return response.data;
};

export const deleteFestival = async (id: number): Promise<void> => {
    await apiClient.delete(`/festivals/${id}`);
};
