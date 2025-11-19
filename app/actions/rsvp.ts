'use server';

import { createClient } from '@/lib/supabase/server';
import type { RSVPResponse } from '@/lib/supabase/types';

export async function submitRSVP(rsvp: RSVPResponse) {
    const supabase = await createClient();

    if (!rsvp.user_id) {
        throw new Error('RSVP missing user reference');
    }

    const payload = {
        ...rsvp,
    };

    const { data, error } = await supabase
        .from('rsvp_responses')
        .upsert([payload], { onConflict: 'user_id' })
        .select()
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function getRSVPResponses() {
    const supabase = await createClient();

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
