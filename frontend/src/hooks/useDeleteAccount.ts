import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteAccount } from '../api/auth';

const useDeleteAccount = () => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const openConfirm = () => setShowConfirm(true);
    const closeConfirm = () => setShowConfirm(false);

    const confirm = async () => {
        setLoading(true);
        setError(null);
        try {
            await deleteAccount();
            localStorage.removeItem('token');
            navigate('/');
        } catch {
            setError('退会処理に失敗しました。もう一度お試しください');
        } finally {
            setLoading(false);
        }
    };

    return { showConfirm, loading, error, openConfirm, closeConfirm, confirm };
};

export default useDeleteAccount;
