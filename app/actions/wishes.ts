'use server';

import { createClient } from '@/lib/supabase/server';
import type { Wish } from '@/lib/supabase/types';

export async function submitWish(wish: Wish) {
    const supabase = await createClient();

    const payload = {
        ...wish,
        user_id: wish.user_id,
        name: wish.name?.trim() || "Khách",
        created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from("wishes")
        .insert([payload])
        .select()
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function getWishes(page: number = 1, limit: number = 10) {
    const supabase = await createClient();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
        .from('wishes')
        .select('*, wish_reactions(*)')
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;
    return data;
}

export async function deleteWish(wishId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("wishes")
        .delete()
        .eq("id", wishId);

    if (error) throw error;
}

export async function addReaction(
    wishId: string,
    sticker: string,
    sessionId: string,
    reactorName: string
) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('wish_reactions')
        .insert([{ wish_id: wishId, sticker, session_id: sessionId, reactor_name: reactorName }])
        .select()
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function getReactionsForWish(wishId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('wish_reactions')
        .select('*')
        .eq('wish_id', wishId);

    if (error) throw error;
    return data || [];
}

export async function getUserReactionsForWish(wishId: string, sessionId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('wish_reactions')
        .select('*')
        .eq('wish_id', wishId)
        .eq('session_id', sessionId);

    if (error) throw error;
    return data || [];
}
