'use server';

import { createClient } from '@/lib/supabase/server';
import type { ParticipantRecord, ParticipantUpsertInput, AppUser } from '@/lib/supabase/types';

export async function getParticipants() {
    const supabase = await createClient();

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

export async function upsertParticipant(participant: ParticipantUpsertInput) {
    const supabase = await createClient();

    const username = participant.username.trim().toLowerCase();
    const displayName = participant.display_name.trim() || username;
    const salutation = participant.salutation?.trim() || '';

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
        salutation,
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
    const supabase = await createClient();

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
