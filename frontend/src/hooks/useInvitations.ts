import { useState, useEffect } from 'react';
import { fetchMyInvitations, acceptInvitation, rejectInvitation } from '../api/invitations';
import type { Invitation } from '../types/group';

const useInvitations = () => {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = () => {
        setLoading(true);
        fetchMyInvitations()
            .then(setInvitations)
            .catch((e: unknown) => setError(e instanceof Error ? e.message : '読み込みに失敗しました'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, []);

    const accept = async (invitationId: number): Promise<boolean> => {
        try {
            await acceptInvitation(invitationId);
            setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
            return true;
        } catch {
            return false;
        }
    };

    const reject = async (invitationId: number): Promise<boolean> => {
        try {
            await rejectInvitation(invitationId);
            setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
            return true;
        } catch {
            return false;
        }
    };

    return { invitations, loading, error, accept, reject, reload: load };
};

export default useInvitations;
