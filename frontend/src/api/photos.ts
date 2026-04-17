import { apiClient } from './client';
import type { Photo } from '../types/photo';

export const fetchPhotos = async (festivalId?: number): Promise<Photo[]> => {
    const params = festivalId !== undefined ? { festival_id: festivalId } : {};
    const response = await apiClient.get<Photo[]>('/photos/', { params });
    return response.data;
};

export const uploadPhoto = async (file: File, festivalId?: number, isPublic = true): Promise<Photo> => {
    const formData = new FormData();
    formData.append('file', file);
    if (festivalId !== undefined) {
        formData.append('festival_id', String(festivalId));
    }
    formData.append('is_public', String(isPublic));
    const response = await apiClient.post<Photo>('/photos/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};
