export interface Photo {
    id: number;
    festival_id: number | null;
    group_id: number | null;
    filename: string;
    original_name: string | null;
    is_public: boolean;
    user_id: number | null;
    created_at: string;
}
