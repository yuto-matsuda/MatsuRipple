import { apiClient } from './client';
import type { Participant, ParticipantCreate } from '../types/participant';
import type { Festival } from '../types/festival';

export const registerParticipant = async (participant: ParticipantCreate): Promise<Participant> => {
    const response = await apiClient.post<Participant>('/participants/', participant);
    return response.data;
};

export const fetchParticipants = async (festivalId: number): Promise<Participant[]> => {
    const response = await apiClient.get<Participant[]>(`/participants/festival/${festivalId}`);
    return response.data;
};

export const fetchMyParticipations = async (): Promise<Festival[]> => {
    const response = await apiClient.get<Festival[]>('/participants/me');
    return response.data;
};
