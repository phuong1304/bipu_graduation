import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface RSVPResponse {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  will_attend: boolean;
  guest_count: number;
  dietary_requirements?: string;
  created_at?: string;
}

export interface Wish {
  id?: string;
  name: string;
  message: string;
  created_at?: string;
}

export async function submitRSVP(rsvp: RSVPResponse) {
  const { data, error } = await supabase
    .from('rsvp_responses')
    .insert([rsvp])
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
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
