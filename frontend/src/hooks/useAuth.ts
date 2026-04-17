import { useState } from 'react';
import { login as loginApi } from '../api/auth';

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [error, setError] = useState<string | null>(null);

    const login = async (username: string, password: string): Promise<boolean> => {
        setError(null);
        try {
            const token = await loginApi(username, password);
            localStorage.setItem('token', token);
            setIsAuthenticated(true);
            return true;
        } catch {
            setError('ユーザー名またはパスワードが正しくありません');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    return { isAuthenticated, login, logout, error };
};

export default useAuth;
