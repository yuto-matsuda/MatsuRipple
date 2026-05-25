import { useState, useEffect } from 'react';
import { fetchPhotos, uploadPhoto, updatePhotoVisibility } from '../api/photos';
import { fetchGroupPhotos } from '../api/groups';
import type { Photo } from '../types/photo';

const usePhotos = (festivalId?: number, groupId?: number) => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = () => {
        setLoading(true);
        const fetcher =
            groupId !== undefined
                ? fetchGroupPhotos(groupId)
                : fetchPhotos(festivalId);
        fetcher
            .then(setPhotos)
            .catch((e: unknown) => setError(e instanceof Error ? e.message : '読み込みに失敗しました'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, [festivalId, groupId]);

    const upload = async (file: File, isPublic: boolean, uploadGroupId?: number, uploadFestivalId?: number) => {
        setUploading(true);
        try {
            const photo = await uploadPhoto(
                file,
                uploadFestivalId ?? festivalId,
                isPublic,
                uploadGroupId ?? groupId,
            );
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

    return { photos, loading, uploading, error, upload, updateVisibility, reload: load };
};

export default usePhotos;
