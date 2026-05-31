import { apiClient } from './client';
import type { Group, GroupDetail, GroupCreate, GroupUpdate, Invitation } from '../types/group';
import type { Photo } from '../types/photo';

export const fetchMyGroups = async (): Promise<Group[]> => {
    const response = await apiClient.get<Group[]>('/groups/');
    return response.data;
};

export const fetchGroupDetail = async (groupId: number): Promise<GroupDetail> => {
    const response = await apiClient.get<GroupDetail>(`/groups/${groupId}`);
    return response.data;
};

export const createGroup = async (data: GroupCreate): Promise<Group> => {
    const response = await apiClient.post<Group>('/groups/', data);
    return response.data;
};

export const updateGroup = async (groupId: number, data: GroupUpdate): Promise<Group> => {
    const response = await apiClient.patch<Group>(`/groups/${groupId}`, data);
    return response.data;
};

export const leaveGroup = async (groupId: number): Promise<void> => {
    await apiClient.delete(`/groups/${groupId}/leave`);
};

export const sendInvitation = async (groupId: number, username: string): Promise<Invitation> => {
    const response = await apiClient.post<Invitation>(`/groups/${groupId}/invitations`, { username });
    return response.data;
};

export const fetchGroupPhotos = async (groupId: number): Promise<Photo[]> => {
    const response = await apiClient.get<Photo[]>(`/groups/${groupId}/photos`);
    return response.data;
};

interface GroupParticipateResult {
    registered: number;
    total: number;
}

export const groupParticipate = async (
    groupId: number,
    festivalId: number,
    message?: string,
): Promise<GroupParticipateResult> => {
    const response = await apiClient.post<GroupParticipateResult>(
        `/groups/${groupId}/participate`,
        { festival_id: festivalId, message },
    );
    return response.data;
};
