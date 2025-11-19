export interface RSVPResponse {
    id?: string;
    user_id?: string;
    user?: Pick<AppUser, 'id' | 'username' | 'display_name' | 'email' | 'invited_to_dinner'>;
    name: string;
    email: string;
    phone?: string;
    will_attend?: boolean;
    will_attend_dinner?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Wish {
    id?: string;
    name: string;
    message: string;
    created_at?: string;
    user_id: string;
    wish_reactions?: WishReaction[];
}

export interface WishReaction {
    id?: string;
    wish_id: string;
    sticker: string;
    session_id: string;
    reactor_name?: string;
    created_at?: string;
}

export type AppUserRole = 'user' | 'admin';

export interface AppUser {
    id?: string;
    email: string;
    username: string;
    display_name: string;
    salutation?: string;
    password: string;
    role: AppUserRole;
    invited_to_dinner?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ParticipantUpsertInput {
    id?: string;
    username: string;
    display_name: string;
    salutation?: string;
    invited_to_dinner?: boolean;
}

export interface ParticipantRecord extends AppUser {
    rsvp?: RSVPResponse | null;
}
