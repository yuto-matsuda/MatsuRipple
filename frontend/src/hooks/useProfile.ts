import { useState, useEffect } from 'react';
import { fetchMe } from '../api/auth';
import { fetchMyParticipations } from '../api/participants';
import { fetchMyFestivals, deleteFestival } from '../api/festivals';
import { fetchMyPhotos, uploadPhoto, updatePhotoVisibility, deletePhoto } from '../api/photos';
import type { Festival } from '../types/festival';
import type { Photo } from '../types/photo';
import type { UserResponse } from '../types/user';

const useProfile = () => {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [postedFestivals, setPostedFestivals] = useState<Festival[]>([]);
    const [participatedFestivals, setParticipatedFestivals] = useState<Festival[]>([]);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [me, posted, participations, myPhotos] = await Promise.all([
                    fetchMe(),
                    fetchMyFestivals(),
                    fetchMyParticipations(),
                    fetchMyPhotos(),
                ]);
                setUser(me);
                setPostedFestivals(posted);
                setParticipatedFestivals(participations);
                setPhotos(myPhotos);
            } catch (e) {
                setError(e instanceof Error ? e.message : '読み込みに失敗しました');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const upload = async (file: File, isPublic: boolean, festivalId?: number) => {
        setUploading(true);
        try {
            const photo = await uploadPhoto(file, festivalId, isPublic);
            setPhotos((prev) => [photo, ...prev]);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'アップロードに失敗しました');
        } finally {
            setUploading(false);
        }
    };

    const updateVisibility = async (photoId: number, isPublic: boolean) => {
        try {
            const updated = await updatePhotoVisibility(photoId, isPublic);
            setPhotos((prev) => prev.map((p) => (p.id === photoId ? updated : p)));
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : '更新に失敗しました');
        }
    };

    const removePhoto = async (photoId: number) => {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        try {
            await deletePhoto(photoId);
        } catch {
            // 失敗時は再取得で整合性を回復
            fetchMyPhotos().then(setPhotos).catch(() => {});
        }
    };

    const removeFestival = async (festivalId: number): Promise<boolean> => {
        try {
            await deleteFestival(festivalId);
            setPostedFestivals((prev) => prev.filter((f) => f.id !== festivalId));
            return true;
        } catch {
            return false;
        }
    };

    return {
        user,
        postedFestivals,
        participatedFestivals,
        photos,
        loading,
        uploading,
        error,
        upload,
        updateVisibility,
        removePhoto,
        removeFestival,
    };
};

export default useProfile;
