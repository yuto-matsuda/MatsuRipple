export interface Review {
    id: number;
    festival_id: number;
    user_id: number;
    username: string;
    body: string;
    rating: number;
    created_at: string;
}

export interface ReviewCreate {
    festival_id: number;
    body: string;
    rating: number;
}
