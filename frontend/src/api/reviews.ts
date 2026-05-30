import { apiClient } from './client';
import type { Review, ReviewCreate } from '../types/review';

export const fetchReviews = async (festivalId: number): Promise<Review[]> => {
    const response = await apiClient.get<Review[]>('/reviews/', { params: { festival_id: festivalId } });
    return response.data;
};

export const postReview = async (data: ReviewCreate): Promise<Review> => {
    const response = await apiClient.post<Review>('/reviews/', data);
    return response.data;
};
