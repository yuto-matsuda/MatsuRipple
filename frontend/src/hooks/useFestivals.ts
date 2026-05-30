import { useState, useEffect } from 'react';
import { fetchFestivals } from '../api/festivals';
import type { Festival } from '../types/festival';

const sortFestivals = (fs: Festival[]): Festival[] => {
    const now = Date.now();
    const withDate = fs.filter((f) => f.start_datetime !== null);
    const noDate = fs.filter((f) => f.start_datetime === null);

    const upcoming = withDate
        .filter((f) => new Date(f.start_datetime!).getTime() >= now)
        .sort((a, b) => new Date(a.start_datetime!).getTime() - new Date(b.start_datetime!).getTime());

    const past = withDate
        .filter((f) => new Date(f.start_datetime!).getTime() < now)
        .sort((a, b) => new Date(b.start_datetime!).getTime() - new Date(a.start_datetime!).getTime());

    return [...upcoming, ...past, ...noDate];
};

const useFestivals = () => {
    const [festivals, setFestivals] = useState<Festival[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = () => {
        setLoading(true);
        fetchFestivals()
            .then((data) => setFestivals(sortFestivals(data)))
            .catch((e: unknown) => setError(e instanceof Error ? e.message : '読み込みに失敗しました'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, []);

    return { festivals, loading, error, reload: load };
};

export default useFestivals;
