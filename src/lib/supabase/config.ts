// True only when both Supabase env vars are present. NEXT_PUBLIC_* values are
// inlined at build time, so this works in both client and server code.
// When false, the app falls back to the local (localStorage) data layer so it
// still runs without a backend during development.
export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
