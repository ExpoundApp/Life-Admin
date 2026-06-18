import { createClient } from "@supabase/supabase-js";

/*
 * Reads your project's keys from environment variables (set in .env locally,
 * and in your host's dashboard for production). If they're missing, this
 * exports `null` and the app quietly runs in single-device localStorage mode.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
