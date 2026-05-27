import { apiClient } from './client';
import type { FestivalGalleryPhoto } from '../types/festivalGallery';

export const fetchFestivalGallery = async (festivalId: number): Promise<FestivalGalleryPhoto[]> => {
    const response = await apiClient.get<FestivalGalleryPhoto[]>('/festival-gallery/', {
        params: { festival_id: festivalId },
    });
    return response.data;
};

export const deleteFestivalGalleryPhoto = async (photoId: number): Promise<void> => {
    await apiClient.delete(`/festival-gallery/${photoId}`);
};

export const uploadFestivalGalleryPhoto = async (
    file: File,
    festivalId: number,
    orderIndex: number,
): Promise<FestivalGalleryPhoto> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('festival_id', String(festivalId));
    formData.append('order_index', String(orderIndex));
    const response = await apiClient.post<FestivalGalleryPhoto>('/festival-gallery/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};
