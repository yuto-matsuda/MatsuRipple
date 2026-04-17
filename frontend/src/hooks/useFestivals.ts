import { useState, useEffect } from 'react';
import { fetchFestivals } from '../api/festivals';
import type { Festival } from '../types/festival';

const useFestivals = () => {
    const [festivals, setFestivals] = useState<Festival[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = () => {
        setLoading(true);
        fetchFestivals()
            .then(setFestivals)
            .catch((e: unknown) => setError(e instanceof Error ? e.message : '読み込みに失敗しました'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, []);

    return { festivals, loading, error, reload: load };
};

export default useFestivals;
