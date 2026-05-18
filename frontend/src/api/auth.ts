import { apiClient } from './client';
import type { UserResponse } from '../types/user';

export const login = async (email: string, password: string): Promise<string> => {
    const response = await apiClient.post<{ access_token: string }>('/auth/login', { email, password });
    return response.data.access_token;
};

export const registerUser = async (username: string, email: string, password: string): Promise<UserResponse> => {
    const response = await apiClient.post<UserResponse>('/auth/register', { username, email, password });
    return response.data;
};

export const deleteAccount = async (): Promise<void> => {
    await apiClient.delete('/auth/me');
};
