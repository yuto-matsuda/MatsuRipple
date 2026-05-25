import { apiClient } from './client';
import type { Invitation } from '../types/group';

export const fetchMyInvitations = async (): Promise<Invitation[]> => {
    const response = await apiClient.get<Invitation[]>('/invitations/');
    return response.data;
};

export const acceptInvitation = async (invitationId: number): Promise<void> => {
    await apiClient.patch(`/invitations/${invitationId}/accept`);
};

export const rejectInvitation = async (invitationId: number): Promise<void> => {
    await apiClient.patch(`/invitations/${invitationId}/reject`);
};
