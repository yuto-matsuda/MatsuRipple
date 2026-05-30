import { useState, useEffect } from 'react';
import { fetchReviews, postReview } from '../api/reviews';
import type { Review } from '../types/review';

const useReviews = (festivalId: number) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = () => {
        setLoading(true);
        fetchReviews(festivalId)
            .then(setReviews)
            .catch((e: unknown) => setError(e instanceof Error ? e.message : '読み込みに失敗しました'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, [festivalId]);

    const submit = async (body: string, rating: number): Promise<{ ok: boolean; message: string | null }> => {
        setSubmitting(true);
        setError(null);
        try {
            const review = await postReview({ festival_id: festivalId, body, rating });
            setReviews((prev) => [review, ...prev]);
            return { ok: true, message: null };
        } catch (e: unknown) {
            const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
            const msg = detail ?? '投稿に失敗しました';
            setError(msg);
            return { ok: false, message: msg };
        } finally {
            setSubmitting(false);
        }
    };

    return { reviews, loading, submitting, error, submit };
};

export default useReviews;
