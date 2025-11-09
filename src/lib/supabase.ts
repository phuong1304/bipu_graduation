import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface RSVPResponse {
  id?: string;
  user_id?: string;
  user?: Pick<AppUser, 'id' | 'username' | 'display_name' | 'email' | 'invited_to_dinner'>;
  name: string;
  email: string;
  phone?: string;
  will_attend: boolean;
  guest_count: number;
  dietary_requirements?: string;
  will_attend_dinner?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Wish {
  id?: string;
  name: string;
  message: string;
  created_at?: string;
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
  invited_to_dinner?: boolean;
}

export interface ParticipantRecord extends AppUser {
  rsvp?: RSVPResponse | null;
}

export interface WishReaction {
  id?: string;
  wish_id: string;
  sticker: string;
  session_id: string;
  created_at?: string;
}

export async function submitRSVP(rsvp: RSVPResponse) {
  if (!rsvp.user_id) {
    throw new Error('RSVP missing user reference');
  }

  const payload = {
    ...rsvp,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('rsvp_responses')
    .upsert([payload], { onConflict: 'user_id' })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function submitWish(wish: Wish) {
  const { data, error } = await supabase
    .from('wishes')
    .insert([wish])
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getWishes() {
  const { data, error } = await supabase
    .from('wishes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getRSVPResponses() {
  const { data, error } = await supabase
    .from('rsvp_responses')
    .select(
      `
        *,
        user:app_users (
          id,
          username,
          display_name,
          email,
          invited_to_dinner
        )
      `
    )
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addReaction(
  wishId: string,
  sticker: string,
  sessionId: string,
  reactorName: string
) {
  const { data, error } = await supabase
    .from('wish_reactions')
    .insert([{ wish_id: wishId, sticker, session_id: sessionId, reactor_name: reactorName }])
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getReactionsForWish(wishId: string) {
  const { data, error } = await supabase
    .from('wish_reactions')
    .select('*')
    .eq('wish_id', wishId);

  if (error) throw error;
  return data || [];
}

export async function getUserReactionsForWish(wishId: string, sessionId: string) {
  const { data, error } = await supabase
    .from('wish_reactions')
    .select('*')
    .eq('wish_id', wishId)
    .eq('session_id', sessionId);

  if (error) throw error;
  return data || [];
}

export async function getParticipants() {
  const { data, error } = await supabase
    .from('app_users')
    .select(
      `
        *,
        rsvp:rsvp_responses (
          id,
          user_id,
          name,
          email,
          phone,
          will_attend,
          guest_count,
          dietary_requirements,
          will_attend_dinner,
          created_at,
          updated_at
        )
      `
    )
    .eq('role', 'user')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const normalized = (data || []).map((row: any) => ({
    ...row,
    rsvp: Array.isArray(row.rsvp) ? row.rsvp[0] ?? null : row.rsvp ?? null
  }));

  return normalized as ParticipantRecord[];
}

export async function loginUser(username: string, role: AppUserRole) {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('username', username)
    .eq('role', role)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new Error('Bạn chưa được mời tham dự');
  }

  return data as AppUser;
}

export async function updateUserProfile(
  id: string,
  updates: Partial<Pick<AppUser, 'display_name' | 'password'>>
) {
  const { data, error } = await supabase
    .from('app_users')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('role', 'user')
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as AppUser;
}

export async function upsertParticipant(participant: ParticipantUpsertInput) {
  const username = participant.username.trim().toLowerCase();
  const displayName = participant.display_name.trim() || username;

  if (!username || !displayName) {
    throw new Error('Username va ten hien thi khong duoc de trong');
  }

  const identifierColumn = participant.id ? 'id' : 'username';
  const identifierValue = participant.id || username;

  let existingEmail: string | undefined;
  let existingPassword: string | undefined;

  if (identifierValue) {
    const { data: existing, error: lookupError } = await supabase
      .from('app_users')
      .select('id,email,password')
      .eq(identifierColumn, identifierValue)
      .eq('role', 'user')
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    existingEmail = existing?.email ?? undefined;
    existingPassword = existing?.password ?? undefined;
  }

  const safeUsername = username.replace(/[^a-z0-9]/g, '') || 'guest';
  const fallbackEmail = `${safeUsername}@guests.local`;
  const fallbackPassword = safeUsername;

  const payload = {
    id: participant.id || undefined,
    username,
    email: existingEmail || fallbackEmail,
    display_name: displayName,
    password: existingPassword || fallbackPassword,
    role: 'user',
    invited_to_dinner: participant.invited_to_dinner ?? false,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('app_users')
    .upsert(payload, { onConflict: 'username' })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as AppUser;
}

export async function deleteParticipants(ids: string[]) {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) {
    throw new Error('Khong co nguoi tham gia nao duoc chon');
  }

  const { error } = await supabase
    .from('app_users')
    .delete()
    .eq('role', 'user')
    .in('id', uniqueIds);

  if (error) throw error;
}

export async function updateDinnerAttendance(userId: string, attending: boolean) {
  const { data, error } = await supabase
    .from('rsvp_responses')
    .update({
      will_attend_dinner: attending,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as RSVPResponse;
}
