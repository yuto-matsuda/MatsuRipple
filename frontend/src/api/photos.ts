import { apiClient } from './client';
import type { Photo } from '../types/photo';

export const fetchPhotos = async (festivalId?: number): Promise<Photo[]> => {
    const params = festivalId !== undefined ? { festival_id: festivalId } : {};
    const response = await apiClient.get<Photo[]>('/photos/', { params });
    return response.data;
};

export const fetchMyPhotos = async (): Promise<Photo[]> => {
    const response = await apiClient.get<Photo[]>('/photos/me');
    return response.data;
};

export const deletePhoto = async (photoId: number): Promise<void> => {
    await apiClient.delete(`/photos/${photoId}`);
};

export const updatePhotoVisibility = async (photoId: number, isPublic: boolean): Promise<Photo> => {
    const response = await apiClient.patch<Photo>(`/photos/${photoId}`, { is_public: isPublic });
    return response.data;
};

export const uploadPhoto = async (
    file: File,
    festivalId?: number,
    isPublic = true,
    groupId?: number,
): Promise<Photo> => {
    const formData = new FormData();
    formData.append('file', file);
    if (festivalId !== undefined) formData.append('festival_id', String(festivalId));
    if (groupId !== undefined) formData.append('group_id', String(groupId));
    formData.append('is_public', String(isPublic));
    const response = await apiClient.post<Photo>('/photos/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};