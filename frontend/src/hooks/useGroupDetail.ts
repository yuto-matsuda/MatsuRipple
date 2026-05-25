import { useState, useEffect } from 'react';
import { fetchGroupDetail, updateGroup, leaveGroup, sendInvitation, addGroupFestival, removeGroupFestival } from '../api/groups';
import type { GroupDetail, GroupUpdate } from '../types/group';

const useGroupDetail = (groupId: number) => {
    const [group, setGroup] = useState<GroupDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = () => {
        setLoading(true);
        fetchGroupDetail(groupId)
            .then(setGroup)
            .catch((e: unknown) => setError(e instanceof Error ? e.message : '読み込みに失敗しました'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, [groupId]);

    const update = async (data: GroupUpdate): Promise<boolean> => {
        try {
            const updated = await updateGroup(groupId, data);
            setGroup((prev) => prev ? { ...prev, ...updated } : null);
            return true;
        } catch {
            return false;
        }
    };

    const leave = async (): Promise<boolean> => {
        try {
            await leaveGroup(groupId);
            return true;
        } catch {
            return false;
        }
    };

    const invite = async (username: string): Promise<{ ok: boolean; message: string | null }> => {
        try {
            await sendInvitation(groupId, username);
            return { ok: true, message: null };
        } catch (e: unknown) {
            const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
            return { ok: false, message: detail ?? '招待に失敗しました' };
        }
    };

    const addFestival = async (festivalId: number): Promise<{ ok: boolean; message: string | null }> => {
        try {
            const tag = await addGroupFestival(groupId, festivalId);
            setGroup((prev) => prev ? { ...prev, festivals: [...prev.festivals, tag] } : null);
            return { ok: true, message: null };
        } catch (e: unknown) {
            const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
            return { ok: false, message: detail ?? '追加に失敗しました' };
        }
    };

    const removeFestival = async (festivalId: number): Promise<boolean> => {
        try {
            await removeGroupFestival(groupId, festivalId);
            setGroup((prev) =>
                prev ? { ...prev, festivals: prev.festivals.filter((f) => f.festival_id !== festivalId) } : null
            );
            return true;
        } catch {
            return false;
        }
    };

    return { group, loading, error, update, leave, invite, addFestival, removeFestival, reload: load };
};

export default useGroupDetail;
