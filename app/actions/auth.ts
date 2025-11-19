'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import type { AppUser, AppUserRole } from '@/lib/supabase/types';

export async function loginUser(username: string, role: AppUserRole) {
    const supabase = await createClient();
    const normalized = username.trim().toLowerCase();

    const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', normalized)
        .eq('role', role)
        .maybeSingle();

    if (error) throw error;

    if (!data) {
        throw new Error('Bạn chưa được mời tham dự');
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('user_session', JSON.stringify(data), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return data as AppUser;
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('user_session');
}

export async function getSession(): Promise<AppUser | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) return null;

    try {
        return JSON.parse(sessionCookie.value) as AppUser;
    } catch {
        return null;
    }
}

export async function findUserByUsername(username: string, role: AppUserRole) {
    const supabase = await createClient();
    const normalized = username.trim().toLowerCase();

    const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', normalized)
        .eq('role', role)
        .maybeSingle();

    if (error) throw error;
    return (data as AppUser) ?? null;
}

export async function updateUserProfile(
    id: string,
    updates: Partial<Pick<AppUser, 'display_name' | 'password'>>
) {
    const supabase = await createClient();

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

    // Update session cookie
    if (data) {
        const cookieStore = await cookies();
        cookieStore.set('user_session', JSON.stringify(data), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
        });
    }

    return data as AppUser;
}
