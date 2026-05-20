export interface FestivalGalleryPhoto {
    id: number;
    festival_id: number;
    filename: string;
    original_name: string | null;
    order_index: number;
    user_id: number | null;
    created_at: string;
}
