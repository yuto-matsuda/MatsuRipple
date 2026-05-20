export interface Festival {
    id: number;
    name: string;
    description: string | null;
    region: string | null;
    location_lat: number | null;
    location_lng: number | null;
    start_datetime: string | null;
    end_datetime: string | null;
    venue: string | null;
    thumbnail_url: string | null;
    user_id: number | null;
    created_at: string;
}

export interface FestivalCreate {
    name: string;
    description?: string;
    region?: string;
    location_lat?: number;
    location_lng?: number;
    start_datetime?: string;
    end_datetime?: string;
    venue?: string;
    thumbnail_url?: string;
}
