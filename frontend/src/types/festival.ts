export interface Festival {
    id: number;
    name: string;
    description: string | null;
    region: string | null;
    location_lat: number | null;
    location_lng: number | null;
    date: string | null;
    created_at: string;
}

export interface FestivalCreate {
    name: string;
    description?: string;
    region?: string;
    location_lat?: number;
    location_lng?: number;
    date?: string;
}
