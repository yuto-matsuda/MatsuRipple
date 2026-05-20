import { useState, useEffect } from 'react';
import { fetchMe } from '../api/auth';
import { fetchMyFestivals } from '../api/festivals';
import { fetchMyPhotos } from '../api/photos';
import type { Festival } from '../types/festival';
import type { Photo } from '../types/photo';
import type { UserResponse } from '../types/user';

interface UserHistory {
    user: UserResponse | null;
    festivals: Festival[];
    photos: Photo[];
    loading: boolean;
    error: string | null;
}

const useUserHistory = (): UserHistory => {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [festivals, setFestivals] = useState<Festival[]>([]);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [me, myFestivals, myPhotos] = await Promise.all([
                    fetchMe(),
                    fetchMyFestivals(),
                    fetchMyPhotos(),
                ]);
                setUser(me);
                setFestivals(myFestivals);
                setPhotos(myPhotos);
            } catch (e) {
                setError(e instanceof Error ? e.message : '読み込みに失敗しました');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return { user, festivals, photos, loading, error };
};

export default useUserHistory;
