export interface Participant {
    id: number;
    festival_id: number;
    name: string;
    message: string | null;
    created_at: string;
}

export interface ParticipantCreate {
    festival_id: number;
    name: string;
    email: string;
    message?: string;
}
