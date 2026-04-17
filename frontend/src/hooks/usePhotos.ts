import { useState, useEffect } from 'react';
import { fetchPhotos, uploadPhoto } from '../api/photos';
import type { Photo } from '../types/photo';

const usePhotos = (festivalId?: number) => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = () => {
        setLoading(true);
        fetchPhotos(festivalId)
            .then(setPhotos)
            .catch((e: unknown) => setError(e instanceof Error ? e.message : '読み込みに失敗しました'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, [festivalId]);

    const upload = async (file: File, isPublic: boolean) => {
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

    return { photos, loading, uploading, error, upload, reload: load };
};

export default usePhotos;
