import { useState } from 'react';
import { registerParticipant } from '../api/participants';
import type { ParticipantCreate } from '../types/participant';

const useParticipants = () => {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const register = async (data: ParticipantCreate) => {
        setSubmitting(true);
        setError(null);
        setSuccess(false);
        try {
            await registerParticipant(data);
            setSuccess(true);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : '登録に失敗しました');
        } finally {
            setSubmitting(false);
        }
    };

    return { register, submitting, error, success };
};

export default useParticipants;
