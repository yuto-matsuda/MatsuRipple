import { apiClient } from './client';

export const login = async (username: string, password: string): Promise<string> => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const response = await apiClient.post<{ access_token: string }>('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data.access_token;
};

export const registerUser = async (username: string, email: string, password: string) => {
    const response = await apiClient.post('/auth/register', { username, email, password });
    return response.data;
};
