export interface GroupLocation {
    id: number;
    group_id: number;
    name: string;
    order: number;
}

export interface GroupMember {
    id: number;
    group_id: number;
    user_id: number;
    username: string;
    joined_at: string;
}

export interface Group {
    id: number;
    name: string;
    description: string | null;
    creator_id: number;
    created_at: string;
}

export interface GroupFestival {
    id: number;
    group_id: number;
    festival_id: number;
    festival_name: string;
    created_at: string;
}

export interface GroupDetail extends Group {
    locations: GroupLocation[];
    members: GroupMember[];
    festivals: GroupFestival[];
}

export interface GroupCreate {
    name: string;
    description?: string;
    locations: { name: string; order: number }[];
}

export interface GroupUpdate {
    name?: string;
    description?: string;
}

export interface Invitation {
    id: number;
    group_id: number;
    inviter_id: number;
    invitee_id: number;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    group_name: string | null;
    inviter_username: string | null;
}
