import { useState, useEffect } from 'react';
import { fetchMyGroups, createGroup } from '../api/groups';
import type { Group, GroupCreate } from '../types/group';

const useGroups = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = () => {
        setLoading(true);
        fetchMyGroups()
            .then(setGroups)
            .catch((e: unknown) => setError(e instanceof Error ? e.message : '読み込みに失敗しました'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, []);

    const create = async (data: GroupCreate): Promise<Group | null> => {
        try {
            const group = await createGroup(data);
            setGroups((prev) => [group, ...prev]);
            return group;
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'グループの作成に失敗しました');
            return null;
        }
    };

    return { groups, loading, error, create, reload: load };
};

export default useGroups;
