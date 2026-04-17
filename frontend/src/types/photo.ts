export interface Photo {
    id: number;
    festival_id: number | null;
    filename: string;
    original_name: string | null;
    is_public: boolean;
    created_at: string;
}
